import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/stock/check-expiration - Check for expiring stock and create notifications
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysThreshold = parseInt(searchParams.get('days') || '30'); // Default 30 days
    
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    // Find stock that will expire within the threshold
    const expiringStocks = await prisma.stock.findMany({
      where: {
        expirationDate: {
          lte: thresholdDate
        },
        lastNotifiedDate: {
          // Only notify if not notified in the last 7 days
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    const notifications = [];

    for (const stock of expiringStocks) {
      const daysUntilExpiration = Math.ceil(
        (stock.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let notificationType: NotificationType;
      let message: string;

      if (daysUntilExpiration <= 0) {
        notificationType = 'EXPIRATION_NOTICE';
        message = `Stock for product ${stock.designCode}-${stock.clientCode} has expired on ${stock.expirationDate!.toLocaleDateString()}. Available quantity: ${stock.availableQuantity}.`;
      } else if (daysUntilExpiration <= 7) {
        notificationType = 'EXPIRATION_WARNING';
        message = `Stock for product ${stock.designCode}-${stock.clientCode} will expire in ${daysUntilExpiration} days (${stock.expirationDate!.toLocaleDateString()}). Available quantity: ${stock.availableQuantity}.`;
      } else {
        notificationType = 'EXPIRATION_WARNING';
        message = `Stock for product ${stock.designCode}-${stock.clientCode} will expire in ${daysUntilExpiration} days (${stock.expirationDate!.toLocaleDateString()}). Available quantity: ${stock.availableQuantity}.`;
      }

      // Create notification
      const notification = await prisma.stockNotification.create({
        data: {
          stockId: stock.id,
          type: notificationType,
          message
        }
      });

      // Update last notified date
      await prisma.stock.update({
        where: { id: stock.id },
        data: { lastNotifiedDate: now }
      });

      notifications.push({
        stock: stock,
        notification: notification,
        daysUntilExpiration
      });
    }

    // Check for low stock
    const lowStockThreshold = 5;
    const lowStocks = await prisma.stock.findMany({
      where: {
        availableQuantity: {
          lte: lowStockThreshold
        },
        status: {
          not: 'out_of_stock'
        }
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const stock of lowStocks) {
      // Check if we already have a recent low stock notification
      const existingNotification = await prisma.stockNotification.findFirst({
        where: {
          stockId: stock.id,
          type: 'LOW_STOCK',
          isRead: false,
          sentAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (!existingNotification) {
        const message = `Low stock alert for product ${stock.designCode}-${stock.clientCode}. Available quantity: ${stock.availableQuantity}.`;
        
        await prisma.stockNotification.create({
          data: {
            stockId: stock.id,
            type: 'LOW_STOCK',
            message
          }
        });
      }
    }

    // Check for expired offers
    const expiredOffers = await prisma.stockOffer.findMany({
      where: {
        status: 'pending',
        expiryDate: {
          lt: now
        }
      },
      include: {
        stock: true
      }
    });

    for (const offer of expiredOffers) {
      // Auto-expire the offer and return stock to available
      await prisma.$transaction(async (tx) => {
        // Update offer status
        await tx.stockOffer.update({
          where: { id: offer.id },
          data: { status: 'expired' }
        });

        // Return stock to available
        await tx.stock.update({
          where: { id: offer.stockId },
          data: {
            qty_offer: { decrement: offer.quantity },
            availableQuantity: { increment: offer.quantity }
          }
        });

        // Create notification
        await tx.stockNotification.create({
          data: {
            stockId: offer.stockId,
            type: 'OFFER_EXPIRY',
            message: `Offer for ${offer.quantity} units of product ${offer.stock.designCode}-${offer.stock.clientCode} has expired. Stock has been returned to available inventory.`
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        expiringStocks: notifications.length,
        lowStocks: lowStocks.length,
        expiredOffers: expiredOffers.length,
        notifications: notifications
      },
      message: `Processed ${notifications.length} expiring stocks, ${lowStocks.length} low stocks, and ${expiredOffers.length} expired offers`
    });
  } catch (error) {
    console.error('Error checking stock expiration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check stock expiration' },
      { status: 500 }
    );
  }
}