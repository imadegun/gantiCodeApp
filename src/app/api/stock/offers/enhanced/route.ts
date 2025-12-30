import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, OfferStatus, StockStatus } from '@prisma/client';
import { query } from '@/lib/mysql';

const prisma = new PrismaClient();

// GET /api/stock/offers/enhanced - Get stock offers with details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OfferStatus | null;
    const stockId = searchParams.get('stockId');
    const clientCode = searchParams.get('clientCode');
    const designName = searchParams.get('designName');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let whereClause: any = {};
    
    if (status) whereClause.status = status;
    if (stockId) whereClause.stockId = stockId;
    if (clientCode) whereClause.clientCode = clientCode;
    if (designName) {
      whereClause.stock = { designCode: { contains: designName, mode: 'insensitive' } };
    } else if (search) {
      whereClause.OR = [
        { clientCode: { contains: search, mode: 'insensitive' } },
        { stock: { designCode: { contains: search, mode: 'insensitive' } } },
        { stock: { clientCode: { contains: search, mode: 'insensitive' } } },
        { stock: { nameCode: { contains: search, mode: 'insensitive' } } },
        { stock: { productId: { equals: parseInt(search) || 0 } } }
      ];
    }

    const offers = await prisma.stockOffer.findMany({
      where: whereClause,
      include: {
        stock: {
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
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Enrich with product data from MySQL
    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        try {
          const productResult = await query(
            `SELECT DesignName, CategoryName, SizeName, ColorName, MaterialName, Photo1
             FROM tblcollect_master WHERE ID = ?`,
            [offer.stock.productId]
          );
          
          // Handle MySQL result - could be array or OkPacket
          let products: any[] = [];
          if (Array.isArray(productResult)) {
            products = productResult;
          } else {
            // If it's not an array, return empty array
            products = [];
          }
          
          if (products && products.length > 0) {
            const product = products[0];
            // Merge product data with stock data
            return {
              ...offer,
              stock: {
                ...offer.stock,
                product: {
                  DesignName: product.DesignName || offer.stock.designCode,
                  CategoryName: product.CategoryName || offer.stock.categoryCode,
                  SizeName: product.SizeName || offer.stock.sizeCode,
                  ColorName: product.ColorName,
                  MaterialName: product.MaterialName,
                  Photo1: product.Photo1 || offer.stock.photo1
                }
              }
            };
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
        
        return offer;
      })
    );

    // Get total count for pagination
    const totalCount = await prisma.stockOffer.count({ where: whereClause });
    
    return NextResponse.json({
      success: true,
      data: enrichedOffers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock offers' },
      { status: 500 }
    );
  }
}

// POST /api/stock/offers/enhanced - Create stock offer (automatically reduces stock)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockId, clientCode, quantity, expiryDays, notes, createdBy } = body;
    
    if (!stockId || !clientCode || !quantity || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Stock ID, client code, quantity, and created by are required' },
        { status: 400 }
      );
    }

    // Get stock item
    const stock = await prisma.stock.findUnique({
      where: { id: stockId }
    });

    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'Stock item not found' },
        { status: 404 }
      );
    }

    // Check if enough stock is available
    const availableQuantity = stock.availableQuantity;
    if (availableQuantity < quantity) {
      return NextResponse.json(
        { success: false, error: `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}` },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 7));
    
    // Create offer and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create offer
      const offer = await tx.stockOffer.create({
        data: {
          stockId,
          clientCode,
          quantity,
          expiryDate,
          notes,
          offeredBy: createdBy,
          status: 'pending'
        },
        include: {
          stock: true
        }
      });

      // Update stock quantities
      const updatedStock = await tx.stock.update({
        where: { id: stockId },
        data: {
          qty_offer: { increment: quantity },
          availableQuantity: { decrement: quantity }
        }
      });

      // Update stock status if needed
      let newStatus = stock.status;
      if (updatedStock.availableQuantity === 0) {
        newStatus = 'out_of_stock';
      }

      if (newStatus !== stock.status) {
        await tx.stock.update({
          where: { id: stockId },
          data: { status: newStatus }
        });
      }

      return { offer, updatedStock };
    });

    return NextResponse.json({
      success: true,
      data: result.offer,
      message: `Stock offer created for ${quantity} units. Stock automatically reserved.`
    });
  } catch (error) {
    console.error('Error creating stock offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock offer' },
      { status: 500 }
    );
  }
}

// PUT /api/stock/offers/enhanced - Update stock offer status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, action, reason } = body;
    
    if (!offerId || !action) {
      return NextResponse.json(
        { success: false, error: 'Offer ID and action are required' },
        { status: 400 }
      );
    }

    // Get offer
    const offer = await prisma.stockOffer.findUnique({
      where: { id: offerId },
      include: { stock: true }
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Only pending offers can be updated' },
        { status: 400 }
      );
    }

    let newStatus: OfferStatus;
    let message: string;

    // Handle different actions
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        message = `Offer approved. ${offer.quantity} units permanently reserved.`;
        break;
      case 'reject':
        newStatus = 'rejected';
        message = `Offer rejected. ${offer.quantity} units returned to available stock.`;
        break;
      case 'cancel':
        newStatus = 'cancelled';
        message = `Offer cancelled. ${offer.quantity} units returned to available stock.`;
        break;
      case 'expire':
        newStatus = 'expired';
        message = `Offer expired. ${offer.quantity} units returned to available stock.`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update offer and stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update offer
      const updatedOffer = await tx.stockOffer.update({
        where: { id: offerId },
        data: { status: newStatus },
        include: {
          stock: true
        }
      });

      // For reject, cancel, or expire - return stock to available
      if (['reject', 'cancel', 'expire'].includes(action)) {
        const updatedStock = await tx.stock.update({
          where: { id: offer.stockId },
          data: {
            qty_offer: { decrement: offer.quantity },
            availableQuantity: { increment: offer.quantity }
          }
        });

        // Update stock status based on new available quantity
        let newStockStatus: StockStatus = 'available';
        if (updatedStock.availableQuantity === 0) {
          newStockStatus = 'out_of_stock';
        }

        const finalStock = await tx.stock.update({
          where: { id: offer.stockId },
          data: { status: newStockStatus }
        });

        return { offer: updatedOffer, stock: finalStock };
      }

      // For approved - increment reserved count (qty_offer) permanently
      if (action === 'approve') {
        const updatedStock = await tx.stock.update({
          where: { id: offer.stockId },
          data: {
            qty_offer: { increment: offer.quantity }
          }
        });

        return { offer: updatedOffer, stock: updatedStock };
      }

      return { offer: updatedOffer };
    });

    return NextResponse.json({
      success: true,
      data: result.offer,
      message
    });
  } catch (error) {
    console.error('Error updating stock offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock offer' },
      { status: 500 }
    );
  }
}
