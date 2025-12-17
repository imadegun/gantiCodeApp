import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, StockStatus } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock - Get all stock data with product info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'clientcode', 'designcode', or 'all'
    const status = searchParams.get('status') as StockStatus | null; // Filter by stock status

    const stockData: any[] = [];

    if (type === 'clientcode' || type === 'all') {
      const clientCodeStock = await prisma.stockByClientCode.findMany({
        where: status ? { status } : {},
        orderBy: { clientCode: 'asc' }
      });

      // Get product info from MySQL for each stock item
      for (const stock of clientCodeStock) {
        const productRows = await query(
          `SELECT m.ID, m.CollectCode, m.DesignCode, m.NameCode, m.CategoryCode, m.SizeCode,
                  m.ColorCode, m.TextureCode, m.MaterialCode, m.Photo1, m.Photo2,
                  d.DesignName, n.NameDesc, c.CategoryName, co.ColorName,
                  t.TextureName, s.SizeName, ma.MaterialName
           FROM tblcollect_master m
           LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
           LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
           LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
           LEFT JOIN tblcollect_color co ON m.ColorCode = co.ColorCode
           LEFT JOIN tblcollect_texture t ON m.TextureCode = t.TextureCode
           LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
           LEFT JOIN tblcollect_material ma ON m.MaterialCode = ma.MaterialName
           WHERE m.ClientCode = ? LIMIT 1`,
          [stock.clientCode]
        ) as any[];

        const product = productRows && productRows.length > 0 ? productRows[0] : null;

        stockData.push({
          id: stock.id,
          type: 'clientcode',
          code: stock.clientCode,
          quantityAvailable: stock.quantityAvailable,
          quantityReserved: stock.quantityReserved,
          status: stock.status,
          lastUpdated: stock.lastUpdated,
          product: product
        });
      }
    }

    if (type === 'designcode' || type === 'all') {
      const designCodeStock = await prisma.stockByDesignCode.findMany({
        where: status ? { status } : {},
        orderBy: { designCode: 'asc' }
      });

      for (const stock of designCodeStock) {
        const productRows = await query(
          `SELECT d.DesignName, COUNT(*) as productCount,
                  GROUP_CONCAT(DISTINCT m.ClientCode) as clientCodes
           FROM tblcollect_design d
           LEFT JOIN tblcollect_master m ON d.DesignCode = m.DesignCode
           WHERE d.DesignCode = ?
           GROUP BY d.DesignCode, d.DesignName`,
          [stock.designCode]
        ) as any[];

        const designInfo = productRows && productRows.length > 0 ? productRows[0] : null;

        stockData.push({
          id: stock.id,
          type: 'designcode',
          code: stock.designCode,
          totalQuantity: stock.totalQuantity,
          availableQuantity: stock.availableQuantity,
          reservedQuantity: stock.reservedQuantity,
          status: stock.status,
          lastUpdated: stock.lastUpdated,
          product: designInfo
        });
      }
    }

    return NextResponse.json({ success: true, data: stockData });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// POST /api/stock - Add incoming stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, code, quantity, source = 'manual' } = body;

    if (!type || !code || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Type, code, and quantity are required' },
        { status: 400 }
      );
    }

    let updatedStock;

    if (type === 'clientcode') {
      updatedStock = await prisma.stockByClientCode.upsert({
        where: { clientCode: code },
        update: {
          quantityAvailable: { increment: quantity },
          lastUpdated: new Date()
        },
        create: {
          clientCode: code,
          quantityAvailable: quantity,
          quantityReserved: 0,
          status: 'available'
        }
      });
    } else if (type === 'designcode') {
      updatedStock = await prisma.stockByDesignCode.upsert({
        where: { designCode: code },
        update: {
          totalQuantity: { increment: quantity },
          availableQuantity: { increment: quantity },
          lastUpdated: new Date()
        },
        create: {
          designCode: code,
          totalQuantity: quantity,
          availableQuantity: quantity,
          reservedQuantity: 0,
          status: 'available'
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Type must be "clientcode" or "designcode"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStock,
      message: `Added ${quantity} units to ${type} stock`
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add stock' },
      { status: 500 }
    );
  }
}

// PUT /api/stock - Update stock quantities (for outgoing goods, offers, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, code, action, quantity, reason } = body;

    if (!type || !code || !action || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Type, code, action, and quantity are required' },
        { status: 400 }
      );
    }

    let updatedStock;

    if (type === 'clientcode') {
      const stock = await prisma.stockByClientCode.findUnique({
        where: { clientCode: code }
      });

      if (!stock) {
        return NextResponse.json(
          { success: false, error: 'Stock item not found' },
          { status: 404 }
        );
      }

      if (action === 'offer') {
        // Reserve stock for offering to client
        if (stock.quantityAvailable < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient available stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByClientCode.update({
          where: { clientCode: code },
          data: {
            quantityAvailable: { decrement: quantity },
            quantityReserved: { increment: quantity },
            lastUpdated: new Date()
          }
        });
      } else if (action === 'confirm_sale') {
        // Convert reserved to sold (outgoing)
        if (stock.quantityReserved < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient reserved stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByClientCode.update({
          where: { clientCode: code },
          data: {
            quantityReserved: { decrement: quantity },
            lastUpdated: new Date()
          }
        });
      } else if (action === 'cancel_offer') {
        // Return reserved stock to available
        if (stock.quantityReserved < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient reserved stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByClientCode.update({
          where: { clientCode: code },
          data: {
            quantityAvailable: { increment: quantity },
            quantityReserved: { decrement: quantity },
            lastUpdated: new Date()
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid action for clientcode' },
          { status: 400 }
        );
      }
    } else if (type === 'designcode') {
      const stock = await prisma.stockByDesignCode.findUnique({
        where: { designCode: code }
      });

      if (!stock) {
        return NextResponse.json(
          { success: false, error: 'Stock item not found' },
          { status: 404 }
        );
      }

      if (action === 'offer') {
        // Reserve stock for offering to client
        if (stock.availableQuantity < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient available stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByDesignCode.update({
          where: { designCode: code },
          data: {
            availableQuantity: { decrement: quantity },
            reservedQuantity: { increment: quantity },
            lastUpdated: new Date()
          }
        });
      } else if (action === 'confirm_sale') {
        // Convert reserved to sold (outgoing)
        if (stock.reservedQuantity < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient reserved stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByDesignCode.update({
          where: { designCode: code },
          data: {
            reservedQuantity: { decrement: quantity },
            lastUpdated: new Date()
          }
        });
      } else if (action === 'cancel_offer') {
        // Return reserved stock to available
        if (stock.reservedQuantity < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient reserved stock' },
            { status: 400 }
          );
        }

        updatedStock = await prisma.stockByDesignCode.update({
          where: { designCode: code },
          data: {
            availableQuantity: { increment: quantity },
            reservedQuantity: { decrement: quantity },
            lastUpdated: new Date()
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid action for designcode' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Type must be "clientcode" or "designcode"' },
        { status: 400 }
      );
    }

    // Update status based on quantities
    let newStatus: StockStatus = 'available';
    if (type === 'clientcode') {
      if (updatedStock.quantityAvailable === 0) {
        newStatus = 'out_of_stock';
      } else if (updatedStock.quantityAvailable <= 5) {
        newStatus = 'low_stock';
      }
    } else {
      if (updatedStock.availableQuantity === 0) {
        newStatus = 'out_of_stock';
      } else if (updatedStock.availableQuantity <= 5) {
        newStatus = 'low_stock';
      }
    }

    // Update status if it changed
    if (updatedStock.status !== newStatus) {
      if (type === 'clientcode') {
        updatedStock = await prisma.stockByClientCode.update({
          where: { clientCode: code },
          data: { status: newStatus }
        });
      } else {
        updatedStock = await prisma.stockByDesignCode.update({
          where: { designCode: code },
          data: { status: newStatus }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedStock,
      message: `Stock ${action} completed for ${code}`
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}