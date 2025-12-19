import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, StockStatus } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock/enhanced - Get enhanced stock data with product info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status') as StockStatus | null;
    const expiring = searchParams.get('expiring'); // Get expiring stock (days)

    let whereClause: any = {};
    
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (status) whereClause.status = status;
    
    // Handle expiring stock filter
    if (expiring) {
      const daysFromNow = parseInt(expiring);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysFromNow);
      
      whereClause.expirationDate = {
        lte: futureDate
      };
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
        },
        creator: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        _count: {
          select: {
            offers: {
              where: { status: 'pending' }
            }
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
    console.error('Error fetching enhanced stock data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// POST /api/stock/enhanced - Create new stock entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productType,
      qty_in,
      isComplated_set,
      isBody_only,
      isLid_only,
      expirationYears,
      warehouseId,
      shelfId,
      notes,
      createdBy
    } = body;

    if (!productId || !qty_in) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Find a valid user ID if createdBy is not provided or invalid
    let validCreatedBy = createdBy;
    if (!createdBy || createdBy === 'current-user') {
      try {
        const users = await prisma.user.findMany({ take: 1 });
        if (users.length > 0) {
          validCreatedBy = users[0].id;
        } else {
          return NextResponse.json(
            { success: false, error: 'No users found in database' },
            { status: 400 }
          );
        }
      } catch (userError) {
        console.error('Error finding users:', userError);
        return NextResponse.json(
          { success: false, error: 'Failed to find valid user' },
          { status: 500 }
        );
      }
    }

    // Get product details from MySQL
    const productRows = await query(
      `SELECT DesignCode, ClientCode, NameCode, CategoryCode, SizeCode,
              ColorCode, TextureCode, MaterialCode, Photo1
       FROM tblcollect_master WHERE ID = ?`,
      [productId]
    ) as any[];

    if (!productRows || productRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found in database' },
        { status: 404 }
      );
    }

    const product = productRows[0];

    // Calculate expiration date
    let expirationDate: Date | null = null;
    if (expirationYears && expirationYears > 0) {
      expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);
    }

    // Validate shelfId if provided
    console.log('Original shelfId:', shelfId, 'type:', typeof shelfId);
    let validatedShelfId: string | null = null; // Start with null
    if (shelfId && shelfId.trim() !== '') {
      try {
        console.log('Checking if shelf exists:', shelfId);
        const shelfExists = await prisma.shelf.findUnique({
          where: { id: shelfId }
        });
        console.log('Shelf exists result:', !!shelfExists);
        if (shelfExists) {
          validatedShelfId = shelfId;
          console.log('Shelf found, using it');
        } else {
          console.log('Shelf not found, setting to null');
        }
      } catch (shelfError) {
        console.log('Error checking shelf:', shelfError);
      }
    } else {
      console.log('No shelfId provided or empty');
    }
    console.log('Final validatedShelfId:', validatedShelfId);

    // Create stock entry
    const stock = await prisma.stock.create({
      data: {
        productId,
        designCode: product.DesignCode,
        clientCode: product.ClientCode,
        nameCode: product.NameCode,
        categoryCode: product.CategoryCode,
        sizeCode: product.SizeCode,
        colorCode: product.ColorCode,
        textureCode: product.TextureCode,
        materialCode: product.MaterialCode,
        photo1: product.Photo1,
        productType: productType || 'SINGLE_ITEM',
        qty_in,
        total: qty_in,
        availableQuantity: qty_in,
        isComplated_set: isComplated_set || false,
        isBody_only: isBody_only || false,
        isLid_only: isLid_only || false,
        expirationYears: expirationYears || 2,
        expirationDate,
        warehouseId,
        shelfId: validatedShelfId,
        notes,
        createdBy: validCreatedBy,
        status: 'available'
      },
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
      }
    });

    return NextResponse.json({
      success: true,
      data: { ...stock, product },
      message: 'Stock entry created successfully'
    });
  } catch (error) {
    console.error('Error creating stock entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    return NextResponse.json(
      { success: false, error: `Failed to create stock entry: ${errorMessage}` },
      { status: 500 }
    );
  }
}