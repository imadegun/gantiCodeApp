import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock/batch-expiration - Get stocks expiring within time batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const batchSize = parseInt(searchParams.get('batchSize') || '50');

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const expiringStocks = await prisma.stock.findMany({
      where: {
        expirationDate: {
          lte: expirationDate,
          gte: new Date() // Not already expired
        },
        status: 'available'
      },
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        shelf: {
          select: { id: true, code: true, row: true, column: true, level: true }
        }
      },
      orderBy: { expirationDate: 'asc' },
      take: batchSize
    });

    // Enrich with product data
    const enrichedStocks = await Promise.all(
      expiringStocks.map(async (stock) => {
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

    // Group by expiration batches
    const batches = {
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

    return NextResponse.json({
      success: true,
      data: {
        batches,
        total: enrichedStocks.length,
        criticalCount: batches.critical.length,
        warningCount: batches.warning.length,
        upcomingCount: batches.upcoming.length
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