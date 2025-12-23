import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock/batch-expiration - Get stocks expiring within time batches or older than years
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const yearsOld = parseInt(searchParams.get('yearsOld') || '0');
    const batchSize = parseInt(searchParams.get('batchSize') || '50');

    let whereClause: any = { status: 'available' };

    if (yearsOld > 0) {
      // Stocks older than X years
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsOld);
      whereClause.createdAt = {
        lte: cutoffDate
      };
    } else {
      // Stocks expiring within X days
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      whereClause.expirationDate = {
        lte: expirationDate,
        gte: new Date() // Not already expired
      };
    }

    const stocks = await prisma.stock.findMany({
      where: whereClause,
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        shelf: {
          select: { id: true, code: true, row: true, column: true, level: true }
        }
      },
      orderBy: yearsOld > 0 ? { createdAt: 'asc' } : { expirationDate: 'asc' },
      take: batchSize
    });

    // Enrich with product data
    const enrichedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const productRows = await query(
            `SELECT m.ID, m.CollectCode, m.DesignCode, m.NameCode, m.CategoryCode,
                    m.SizeCode, m.ColorCode, m.TextureCode, m.MaterialCode, m.ClientCode,
                    d.DesignName, n.NameDesc, c.CategoryName
             FROM tblcollect_master m
             LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
             LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
             LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
             WHERE m.ID = ?`,
            [stock.productId]
          ) as any[];

          const product = productRows && productRows.length > 0 ? productRows[0] : null;

          return {
            ...stock,
            product
          };
        } catch (error) {
          return {
            ...stock,
            product: null
          };
        }
      })
    );

    // Get expiring offers if not in years mode
    let expiringOffers: any[] = [];
    if (yearsOld === 0) {
      const offerExpirationDate = new Date();
      offerExpirationDate.setDate(offerExpirationDate.getDate() + days);

      const offers = await prisma.stockOffer.findMany({
        where: {
          status: 'pending',
          expiryDate: {
            lte: offerExpirationDate,
            gte: new Date()
          }
        },
        include: {
          stock: {
            include: {
              warehouse: { select: { id: true, name: true, code: true } },
              shelf: { select: { id: true, code: true, row: true, column: true, level: true } }
            }
          },
          creator: { select: { id: true, name: true, username: true } }
        },
        orderBy: { expiryDate: 'asc' },
        take: batchSize
      });

      // Enrich offers with product data
      expiringOffers = await Promise.all(
        offers.map(async (offer) => {
          try {
            const productRows = await query(
              `SELECT m.ID, m.CollectCode, m.DesignCode, m.NameCode, m.CategoryCode,
                      m.SizeCode, m.ColorCode, m.TextureCode, m.MaterialCode, m.ClientCode,
                      d.DesignName, n.NameDesc, c.CategoryName
               FROM tblcollect_master m
               LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
               LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
               LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
               WHERE m.ID = ?`,
              [offer.stock.productId]
            ) as any[];

            const product = productRows && productRows.length > 0 ? productRows[0] : null;

            return {
              ...offer,
              product
            };
          } catch (error) {
            return {
              ...offer,
              product: null
            };
          }
        })
      );
    }

    let batches: any;

    if (yearsOld > 0) {
      // For older stocks, group by age
      const now = new Date();
      batches = {
        old: enrichedStocks.filter(stock => {
          const age = now.getFullYear() - stock.createdAt.getFullYear();
          return age >= yearsOld;
        }),
        older: enrichedStocks.filter(stock => {
          const age = now.getFullYear() - stock.createdAt.getFullYear();
          return age >= yearsOld + 2;
        }),
        very_old: enrichedStocks.filter(stock => {
          const age = now.getFullYear() - stock.createdAt.getFullYear();
          return age >= yearsOld + 5;
        })
      };
    } else {
      // Group by expiration batches
      batches = {
        critical: enrichedStocks.filter(stock =>
          stock.expirationDate && stock.expirationDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        warning: enrichedStocks.filter(stock =>
          stock.expirationDate &&
          stock.expirationDate > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
          stock.expirationDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        upcoming: enrichedStocks.filter(stock =>
          stock.expirationDate &&
          stock.expirationDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        )
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        batches,
        expiringOffers,
        total: enrichedStocks.length,
        offersTotal: expiringOffers.length,
        criticalCount: batches.critical?.length || batches.old?.length || 0,
        warningCount: batches.warning?.length || batches.older?.length || 0,
        upcomingCount: batches.upcoming?.length || batches.very_old?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching batch expiration data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch expiration data' },
      { status: 500 }
    );
  }
}

// PUT /api/stock/batch-expiration - Batch update expiration dates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockIds, expirationYears } = body;

    if (!stockIds || !Array.isArray(stockIds) || stockIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stock IDs array is required' },
        { status: 400 }
      );
    }

    if (!expirationYears || expirationYears <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid expiration years is required' },
        { status: 400 }
      );
    }

    // Calculate new expiration date
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);

    // Update multiple stocks
    const updateResult = await prisma.stock.updateMany({
      where: {
        id: { in: stockIds }
      },
      data: {
        expirationYears,
        expirationDate
      }
    });

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} stocks updated successfully`,
      updatedCount: updateResult.count
    });
  } catch (error) {
    console.error('Error batch updating expiration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to batch update expiration' },
      { status: 500 }
    );
  }
}