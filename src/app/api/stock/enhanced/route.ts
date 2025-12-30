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
    if (searchParams.get('productId')) whereClause.productId = parseInt(searchParams.get('productId')!);
    
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
        offers: {
          where: { status: 'pending' },
          select: {
            quantity: true
          }
        }
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    // Enrich with MySQL product data and calculate reserved quantity
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

          // Calculate reserved quantity from pending offers only
          const reservedQuantity = stock.offers.reduce((sum, offer) => sum + offer.quantity, 0);

          // Get approved offers for this stock
          const approvedOffers = await prisma.stockOffer.findMany({
            where: {
              stockId: stock.id,
              status: 'approved'
            },
            select: { quantity: true }
          });
          const approvedQuantity = approvedOffers.reduce((sum, offer) => sum + offer.quantity, 0);

          // Calculate dynamic total: approved reservations + pending reservations
          const dynamicTotal = approvedQuantity + reservedQuantity;

          return {
            ...stock,
            product,
            // Override qty_offer with calculated pending reservations
            qty_offer: reservedQuantity,
            // Override total with dynamic calculation (approved + pending)
            total: dynamicTotal,
            // Use stored available quantity (updated in transactions)
            availableQuantity: stock.availableQuantity,
            // Check if stock is expiring soon
            isExpiringSoon: stock.expirationDate ?
              new Date(stock.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false
          };
        } catch (error) {
          console.error('Error enriching stock data:', error);
          // Calculate reserved quantity even if product fetch fails
          const reservedQuantity = stock.offers.reduce((sum, offer) => sum + offer.quantity, 0);
          return {
            ...stock,
            product: null,
            qty_offer: reservedQuantity,
            availableQuantity: stock.availableQuantity,
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

    // Validate createdBy - must be a valid user ID
    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: 'Created by user ID is required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    try {
      const user = await prisma.user.findUnique({
        where: { id: createdBy },
        select: { id: true }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID provided' },
          { status: 400 }
        );
      }
    } catch (userError) {
      console.error('Error validating user:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate user' },
        { status: 500 }
      );
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

    // Check if stock already exists for this product (unique by ClientCode/productId)
    const existingStock = await prisma.stock.findFirst({
      where: { productId: productId }
    });

    if (existingStock) {
      // Get pending offers for existing stock to calculate reserved quantity
      const pendingOffers = await prisma.stockOffer.findMany({
        where: {
          stockId: existingStock.id,
          status: 'pending'
        },
        select: { quantity: true }
      });
      const reservedQuantity = pendingOffers.reduce((sum, offer) => sum + offer.quantity, 0);

      // Get approved offers for existing stock
      const approvedOffers = await prisma.stockOffer.findMany({
        where: {
          stockId: existingStock.id,
          status: 'approved'
        },
        select: { quantity: true }
      });
      const approvedQuantity = approvedOffers.reduce((sum, offer) => sum + offer.quantity, 0);

      // Add to existing stock
      const newQtyIn = existingStock.qty_in + qty_in;
      // Calculate dynamic total: approved reservations + pending reservations
      const newTotal = approvedQuantity + reservedQuantity;
      const newAvailableQuantity = newQtyIn - reservedQuantity;

      const updatedStock = await prisma.stock.update({
        where: { id: existingStock.id },
        data: {
          qty_in: newQtyIn,
          total: newTotal,
          availableQuantity: newAvailableQuantity,
          qty_offer: reservedQuantity, // Update with calculated pending reservations
          // Update other fields if provided
          ...(warehouseId !== undefined && { warehouseId }),
          ...(validatedShelfId !== undefined && { shelfId: validatedShelfId }),
          ...(notes !== undefined && { notes }),
          ...(isComplated_set !== undefined && { isComplated_set }),
          ...(isBody_only !== undefined && { isBody_only }),
          ...(isLid_only !== undefined && { isLid_only }),
          ...(expirationYears !== undefined && { expirationYears }),
          ...(expirationDate !== undefined && { expirationDate }),
          updatedAt: new Date()
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
        data: { ...updatedStock, product },
        message: `Successfully added ${qty_in} units to existing stock. Total quantity now: ${newQtyIn}`
      });
    }

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
        createdBy,
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

// PUT /api/stock/enhanced - Update stock entry
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('id');

    if (!stockId) {
      return NextResponse.json(
        { success: false, error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      productType,
      qty_in,
      isComplated_set,
      isBody_only,
      isLid_only,
      expirationYears,
      warehouseId,
      shelfId,
      notes
    } = body;

    // Get current stock entry
    const currentStock = await prisma.stock.findUnique({
      where: { id: stockId }
    });

    if (!currentStock) {
      return NextResponse.json(
        { success: false, error: 'Stock entry not found' },
        { status: 404 }
      );
    }

    // Validate shelfId if provided
    let validatedShelfId = currentStock.shelfId;
    if (shelfId !== undefined) {
      if (shelfId && shelfId.trim() !== '') {
        const shelfExists = await prisma.shelf.findUnique({
          where: { id: shelfId }
        });
        validatedShelfId = shelfExists ? shelfId : null;
      } else {
        validatedShelfId = null;
      }
    }

    // Calculate new expiration date if expirationYears changed
    let expirationDate = currentStock.expirationDate;
    if (expirationYears !== undefined && expirationYears !== currentStock.expirationYears) {
      if (expirationYears && expirationYears > 0) {
        expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);
      } else {
        expirationDate = null;
      }
    }

    // Get pending offers for current stock to calculate reserved quantity
    const pendingOffers = await prisma.stockOffer.findMany({
      where: {
        stockId: stockId,
        status: 'pending'
      },
      select: { quantity: true }
    });
    const reservedQuantity = pendingOffers.reduce((sum, offer) => sum + offer.quantity, 0);

    // Get approved offers for current stock
    const approvedOffers = await prisma.stockOffer.findMany({
      where: {
        stockId: stockId,
        status: 'approved'
      },
      select: { quantity: true }
    });
    const approvedQuantity = approvedOffers.reduce((sum, offer) => sum + offer.quantity, 0);

    // Calculate new total and available quantity
    // When updating qty_in, set to new value (standard editing)
    const newQtyIn = qty_in !== undefined ? qty_in : currentStock.qty_in;
    // Calculate dynamic total: approved reservations + pending reservations
    const newTotal = approvedQuantity + reservedQuantity;
    const newAvailableQuantity = newQtyIn - reservedQuantity;

    // Update stock entry
    const updateData: any = {
      qty_in: newQtyIn,
      total: newTotal,
      availableQuantity: newAvailableQuantity,
      qty_offer: reservedQuantity, // Update with calculated pending reservations
      isComplated_set: isComplated_set !== undefined ? isComplated_set : currentStock.isComplated_set,
      isBody_only: isBody_only !== undefined ? isBody_only : currentStock.isBody_only,
      isLid_only: isLid_only !== undefined ? isLid_only : currentStock.isLid_only,
      expirationYears: expirationYears !== undefined ? expirationYears : currentStock.expirationYears,
      expirationDate,
      warehouseId: warehouseId !== undefined ? warehouseId : currentStock.warehouseId,
      shelfId: validatedShelfId,
      notes: notes !== undefined ? notes : currentStock.notes,
      updatedAt: new Date()
    };

    if (productType !== undefined) {
      updateData.productType = productType;
    }

    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: updateData,
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

    // Get product details
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
      [updatedStock.productId]
    ) as any[];

    const product = productRows && productRows.length > 0 ? productRows[0] : null;

    return NextResponse.json({
      success: true,
      data: { ...updatedStock, product },
      message: 'Stock entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to update stock entry: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/enhanced - Delete stock entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('id');

    if (!stockId) {
      return NextResponse.json(
        { success: false, error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    // Check if stock entry exists
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      include: {
        offers: {
          where: { status: 'pending' }
        }
      }
    });

    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'Stock entry not found' },
        { status: 404 }
      );
    }

    // Delete all offers for this stock first (including cancelled/expired ones)
    await prisma.stockOffer.deleteMany({
      where: { stockId }
    });

    // Delete stock entry
    await prisma.stock.delete({
      where: { id: stockId }
    });

    return NextResponse.json({
      success: true,
      message: 'Stock entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to delete stock entry: ${errorMessage}` },
      { status: 500 }
    );
  }
}