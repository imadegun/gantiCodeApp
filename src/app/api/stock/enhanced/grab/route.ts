import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { verifyToken, canAccessStock } from '@/lib/auth'
import { z } from 'zod'

const createGrabStockSchema = z.object({
  clientCode: z.string().min(1, 'Client code is required'),
  designCode: z.string().min(1, 'Design code is required'),
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

// GET /api/stock/enhanced/grab - Get data for cascading dropdowns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'designs') {
      const designs = await query(
        `SELECT DISTINCT d.DesignCode, d.DesignName 
         FROM tblcollect_design d
         INNER JOIN tblcollect_master m ON d.DesignCode = m.DesignCode
         ORDER BY d.DesignName`
      ) as any[]
      
      return NextResponse.json({
        success: true,
        data: designs
      })
    }
    
    if (type === 'categories' && searchParams.get('designCode')) {
      const designCode = searchParams.get('designCode')
      
      const categories = await query(
        `SELECT DISTINCT c.CategoryCode, c.CategoryName 
         FROM tblcollect_category c
         INNER JOIN tblcollect_master m ON c.CategoryCode = m.CategoryCode
         WHERE m.DesignCode = ?
         ORDER BY c.CategoryName`,
        [designCode]
      ) as any[]
      
      return NextResponse.json({
        success: true,
        data: categories
      })
    }
    
    if (type === 'products' && searchParams.get('designCode')) {
      const designCode = searchParams.get('designCode')
      
      const products = await query(
        `SELECT m.ID, m.ClientCode, m.CollectCode, m.Photo1, m.Photo2,
         d.DesignName, c.CategoryName, s.SizeName
         FROM tblcollect_master m
         LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
         LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
         LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
         WHERE m.DesignCode = ?
         ORDER BY m.CollectCode`,
        [designCode]
      ) as any[]
      
      return NextResponse.json({
        success: true,
        data: products
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Get grab stock data error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stock/enhanced/grab - Create new grab stock entry
export async function POST(request: NextRequest) {
  try {
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

    const userRows = await query(
      'SELECT role FROM users WHERE id = ?',
      [decoded.id]
    ) as any[]

    if (!userRows || userRows.length === 0 || !canAccessStock(userRows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Stock access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createGrabStockSchema.safeParse(body)
    
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

    // Verify the product exists
    const productRows = await query(
      `SELECT ID, DesignCode FROM tblcollect_master
       WHERE ID = ? AND DesignCode = ?
       LIMIT 1`,
      [data.productId, data.designCode]
    ) as any[]

    if (!productRows || productRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product selection' },
        { status: 404 }
      )
    }

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + data.expirationYears)

    const result = await query(
      `INSERT INTO StockEntry (
        clientCode, designCode, productId, department, region,
        quantityIn, isStockInSetComplete, isLid, isBody,
        notes, expirationDate, createdBy, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.clientCode,
        data.designCode,
        data.productId,
        data.department || null,
        data.region || null,
        data.quantityIn,
        data.isStockInSetComplete,
        data.isLid,
        data.isBody,
        data.notes || null,
        expirationDate.toISOString().split('T')[0],
        decoded.id,
        'available'
      ]
    ) as any

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, ...data },
      message: 'Grab stock entry created successfully'
    })

  } catch (error) {
    console.error('Create grab stock entry error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}