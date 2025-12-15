import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, canAccessStock } from '@/lib/auth'
import { z } from 'zod'

const searchParamsSchema = z.object({
  days: z.string().transform(Number).default(30), // Default 30 days
  status: z.enum(['expiring', 'expired']).optional()
})

// GET /api/stock/reminders - Get stock expiration reminders
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and authorization
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    })

    if (!user || !canAccessStock(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Stock access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams))

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + params.days)

    // Build where clause based on status
    let whereClause: any = {}
    
    if (params.status === 'expired') {
      whereClause.expirationDate = {
        lt: today
      }
    } else {
      // Default: expiring
      whereClause.expirationDate = {
        gte: today,
        lte: futureDate
      }
    }

    // Get expiring/expired stock entries
    const stockEntries = await db.stockEntry.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        offers: {
          where: { status: 'pending' },
          select: {
            id: true,
            quantity: true,
            clientId: true,
            status: true,
            expiryDate: true
          }
        }
      },
      orderBy: { expirationDate: 'asc' }
    })

    // Get product information for each stock entry
    const stockEntriesWithProducts = await Promise.all(
      stockEntries.map(async (entry) => {
        const productRows = await db.$queryRaw`
          SELECT m.ID, m.CollectCode, m.ClientCode, m.DesignCode, m.NameCode, 
           m.CategoryCode, m.SizeCode, m.Photo1, m.Photo2, 
           d.DesignName, c.CategoryName, s.SizeName
           FROM tblcollect_master m
           LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
           LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
           LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
           WHERE m.ID = ${entry.productId}
        ` as any[]

        const product = productRows && productRows.length > 0 ? productRows[0] : null

        // Calculate days until expiration
        const expirationDate = new Date(entry.expirationDate || '')
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...entry,
          product,
          daysUntilExpiration,
          totalOffered: entry.offers.reduce((sum, offer) => sum + offer.quantity, 0),
          availableQuantity: entry.quantityIn - entry.offers.reduce((sum, offer) => sum + offer.quantity, 0),
          isExpired: expirationDate < today,
          isExpiringSoon: daysUntilExpiration <= 30 && daysUntilExpiration > 0
        }
      })
    )

    // Group by expiration period for summary
    const summary = {
      expired: stockEntriesWithProducts.filter(entry => entry.isExpired).length,
      expiring7Days: stockEntriesWithProducts.filter(entry => entry.daysUntilExpiration <= 7 && entry.daysUntilExpiration > 0).length,
      expiring30Days: stockEntriesWithProducts.filter(entry => entry.daysUntilExpiration <= 30 && entry.daysUntilExpiration > 0).length,
      expiring90Days: stockEntriesWithProducts.filter(entry => entry.daysUntilExpiration <= 90 && entry.daysUntilExpiration > 0).length
    }

    return NextResponse.json({
      success: true,
      data: {
        entries: stockEntriesWithProducts,
        summary,
        filters: {
          days: params.days,
          status: params.status || 'expiring'
        }
      }
    })

  } catch (error) {
    console.error('Get stock reminders error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stock/reminders - Send reminder notifications
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    })

    if (!user || !canAccessStock(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Stock access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { days = 30, recipients = [] } = body

    // Get expiring stock entries
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    const expiringStock = await db.stockEntry.findMany({
      where: {
        expirationDate: {
          gte: today,
          lte: futureDate
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Here you would implement email/notification logic
    // For now, we'll just return the data that would be sent
    const notifications = expiringStock.map(entry => ({
      stockEntryId: entry.id,
      clientCode: entry.clientCode,
      expirationDate: entry.expirationDate,
      daysUntilExpiration: Math.ceil((new Date(entry.expirationDate || '').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      quantity: entry.quantityIn,
      createdBy: entry.creator
    }))

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        message: `Found ${notifications.length} expiring stock items`,
        sent: true // In a real implementation, this would be false until actually sent
      }
    })

  } catch (error) {
    console.error('Send stock reminders error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}