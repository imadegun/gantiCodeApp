import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock/notifications - Get stock notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as NotificationType | null;
    const isRead = searchParams.get('isRead');
    const stockId = searchParams.get('stockId');

    let whereClause: any = {};
    if (type) whereClause.type = type;
    if (isRead !== null) whereClause.isRead = isRead === 'true';
    if (stockId) whereClause.stockId = stockId;

    const notifications = await prisma.stockNotification.findMany({
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
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/stock/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockId, type, message } = body;

    if (!stockId || !type || !message) {
      return NextResponse.json(
        { success: false, error: 'Stock ID, type, and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.stockNotification.create({
      data: {
        stockId,
        type,
        message
      },
      include: {
        stock: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/stock/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all notifications as read
      await prisma.stockNotification.updateMany({
        where: { isRead: false },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'Notification IDs array is required' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await prisma.stockNotification.updateMany({
      where: {
        id: { in: notificationIds },
        isRead: false
      },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}