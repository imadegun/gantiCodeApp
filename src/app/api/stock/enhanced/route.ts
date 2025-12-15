import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { query } from '@/lib/mysql'
import { verifyToken, canAccessStock } from '@/lib/auth'
import { z } from 'zod'

const createStockSchema = z.object({
  clientCode: z.string().min(1, 'Client code is required'),
  productId: z.number().int().positive('Product ID is required'),
  department: z.string().optional(),
  region: z.string().optional(),
  quantityIn: z.number().int().positive('Quantity must be positive'),
  isStockInSetComplete: z.boolean().default(false),
  isLid: z.boolean().default(false),
  isBody: z.boolean().default(false),
  notes: z.string().optional(),
  expirationYears: z.number().int().min(1).max(10).default(2)
})

const searchParamsSchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  clientCode: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  region: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional()
})

// GET /api/stock/enhanced - Get stock entries with filtering and pagination
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

    // Build where clause
    const where: any = {}

    if (params.clientCode) {
      where.clientCode = { contains: params.clientCode, mode: 'insensitive' }
    }
    if (params.department) {
      where.department = { contains: params.department, mode: 'insensitive' }
    }
    if (params.region) {
      where.region = { contains: params.region, mode: 'insensitive' }
    }
    if (params.status) {
      where.status = params.status
    }

    // Search across multiple fields
    if (params.search) {
      where.OR = [
        { clientCode: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    // Get stock entries with pagination
    const [stockEntries, total] = await Promise.all([
      db.stockEntry.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit
      }),
      db.stockEntry.count({ where })
    ])

    // Get product information for each stock entry
    const stockEntriesWithProducts = await Promise.all(
      stockEntries.map(async (entry) => {
        const productRows = await query(
          `SELECT m.ID, m.CollectCode, m.ClientCode, m.DesignCode, m.NameCode, 
           m.CategoryCode, m.SizeCode, m.Photo1, m.Photo2, 
           d.DesignName, c.CategoryName, s.SizeName
           FROM tblcollect_master m
           LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
           LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
           LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
           WHERE m.ID = ?`,
          [entry.productId]
        ) as any[]

        const product = productRows && productRows.length > 0 ? productRows[0] : null

        return {
          ...entry,
          product,
          totalOffered: entry.offers.reduce((sum, offer) => sum + offer.quantity, 0),
          availableQuantity: entry.quantityIn - entry.offers.reduce((sum, offer) => sum + offer.quantity, 0)
        }
      })
    )

    // Get unique values for filters
    const [clients, departments, regions] = await Promise.all([
      db.stockEntry.findMany({
        select: { clientCode: true },
        distinct: ['clientCode'],
        orderBy: { clientCode: 'asc' }
      }),
      db.stockEntry.findMany({
        where: { department: { not: null } },
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' }
      }),
      db.stockEntry.findMany({
        where: { region: { not: null } },
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        entries: stockEntriesWithProducts,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit)
        },
        filters: {
          clients: clients.map(c => c.clientCode),
          departments: departments.map(d => d.department).filter(Boolean),
          regions: regions.map(r => r.region).filter(Boolean)
        }
      }
    })

  } catch (error) {
    console.error('Get enhanced stock error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stock/enhanced - Create new stock entry
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
    const validation = createStockSchema.safeParse(body)
    
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

    // Calculate expiration date
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + data.expirationYears)

    // Get design code from product
    const productRows = await query(
      'SELECT DesignCode FROM tblcollect_master WHERE ID = ?',
      [data.productId]
    ) as any[]

    if (!productRows || productRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const designCode = productRows[0].DesignCode

    // Create stock entry
    const stockEntry = await db.stockEntry.create({
      data: {
        ...data,
        designCode,
        expirationDate,
        createdBy: decoded.id,
        status: 'available'
      },
      include: {
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
      data: stockEntry,
      message: 'Stock entry created successfully'
    })

  } catch (error) {
    console.error('Create stock entry error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}