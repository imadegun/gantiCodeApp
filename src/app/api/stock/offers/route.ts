import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, canAccessStock } from '@/lib/auth'
import { z } from 'zod'

const createOfferSchema = z.object({
  stockEntryId: z.string().min(1, 'Stock entry ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  notes: z.string().optional(),
  expiryDays: z.number().int().min(1).max(30).default(7) // 1-30 days
})

const updateOfferSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled'])
})

// GET /api/stock/offers - Get stock offers
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const stockEntryId = searchParams.get('stockEntryId')

    const where: any = {}
    if (status) where.status = status
    if (stockEntryId) where.stockEntryId = stockEntryId

    const offers = await db.stockOffer.findMany({
      where,
      include: {
        stockEntry: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: offers
    })

  } catch (error) {
    console.error('Get stock offers error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stock/offers - Create new stock offer
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

    // Validate input
    const body = await request.json()
    const validation = createOfferSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if stock entry exists and has enough available quantity
    const stockEntry = await db.stockEntry.findUnique({
      where: { id: data.stockEntryId },
      include: {
        offers: {
          where: { status: 'pending' }
        }
      }
    })

    if (!stockEntry) {
      return NextResponse.json(
        { success: false, error: 'Stock entry not found' },
        { status: 404 }
      )
    }

    // Calculate total offered quantity
    const totalOffered = stockEntry.offers.reduce((sum, offer) => sum + offer.quantity, 0)
    const availableQuantity = stockEntry.quantityIn - totalOffered

    if (data.quantity > availableQuantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient available quantity. Only ${availableQuantity} units available.` 
        },
        { status: 400 }
      )
    }

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + data.expiryDays)

    // Create offer
    const offer = await db.stockOffer.create({
      data: {
        stockEntryId: data.stockEntryId,
        clientId: data.clientId,
        quantity: data.quantity,
        expiryDate,
        notes: data.notes,
        createdBy: decoded.id
      },
      include: {
        stockEntry: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: offer,
      message: 'Stock offer created successfully'
    })

  } catch (error) {
    console.error('Create stock offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/stock/offers - Update stock offer status
export async function PUT(request: NextRequest) {
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

    // Get offer ID and new status from request body
    const body = await request.json()
    const { offerId, status } = body

    if (!offerId || !status) {
      return NextResponse.json(
        { success: false, error: 'Offer ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validation = updateOfferSchema.safeParse({ status })
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    // Get current offer
    const currentOffer = await db.stockOffer.findUnique({
      where: { id: offerId },
      include: {
        stockEntry: true
      }
    })

    if (!currentOffer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if offer can be updated
    if (currentOffer.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Offer cannot be updated - it is already ' + currentOffer.status },
        { status: 400 }
      )
    }

    // Update offer
    const updatedOffer = await db.stockOffer.update({
      where: { id: offerId },
      data: { status: validation.data.status },
      include: {
        stockEntry: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedOffer,
      message: `Offer ${validation.data.status} successfully`
    })

  } catch (error) {
    console.error('Update stock offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}