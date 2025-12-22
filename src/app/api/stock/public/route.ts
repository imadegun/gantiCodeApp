import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, StockStatus } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock/public - Get public stock data (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as StockStatus | null;

    let whereClause: any = {
      // Only show available and low stock items to public
      status: { in: ['available', 'low_stock'] }
    };

    if (status && ['available', 'low_stock'].includes(status)) {
      whereClause.status = status;
    }

    const stocks = await prisma.stock.findMany({
      where: whereClause,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        shelf: {
          select: {
            id: true,
            code: true,
            row: true,
            column: true,
            level: true
          }
        }
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    // Enrich with MySQL product data
    const enrichedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          // Get product details from MySQL
          const productRows = await query(
            `SELECT m.ID, m.ClientCode, m.DesignCode, m.NameCode, m.CategoryCode,
                    m.SizeCode, m.ColorCode, m.TextureCode, m.MaterialCode, m.Photo1,
                    d.DesignName, n.NameDesc, c.CategoryName, co.ColorName,
                    t.TextureName, s.SizeName, ma.MaterialName
             FROM tblcollect_master m
             LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
             LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
             LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
             LEFT JOIN tblcollect_color co ON m.ColorCode = co.ColorCode
             LEFT JOIN tblcollect_texture t ON m.TextureCode = t.TextureCode
             LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
             LEFT JOIN tblcollect_material ma ON m.MaterialCode = ma.MaterialCode
             WHERE m.ID = ?`,
            [stock.productId]
          ) as any[];

          const product = productRows && productRows.length > 0 ? productRows[0] : null;

          return {
            ...stock,
            product,
            // Calculate available quantity
            availableQuantity: stock.qty_in - stock.qty_offer,
            // Check if stock is expiring soon
            isExpiringSoon: stock.expirationDate ?
              new Date(stock.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false
          };
        } catch (error) {
          console.error('Error enriching stock data:', error);
          return {
            ...stock,
            product: null,
            availableQuantity: stock.qty_in - stock.qty_offer,
            isExpiringSoon: false
          };
        }
      })
    );

    return NextResponse.json({ success: true, data: enrichedStocks });
  } catch (error) {
    console.error('Error fetching public stock data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}