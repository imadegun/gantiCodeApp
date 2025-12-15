import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { verifyToken, canAccessStock } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const searchParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  design: z.string().optional(),
  clientCode: z.string().optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(50)
})

// GET /api/stock/products - Get products for stock selection
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

    // Build WHERE clause
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []

    if (params.search) {
      whereClause += ` AND (
        m.CollectCode LIKE ? OR 
        m.ClientCode LIKE ? OR 
        m.NameCode LIKE ? OR 
        d.DesignName LIKE ? OR 
        c.CategoryName LIKE ? OR 
        s.SizeName LIKE ?
      )`
      const searchTerm = `%${params.search}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (params.category) {
      whereClause += ' AND c.CategoryCode = ?'
      queryParams.push(params.category)
    }

    if (params.design) {
      whereClause += ' AND d.DesignCode = ?'
      queryParams.push(params.design)
    }

    if (params.clientCode) {
      whereClause += ' AND m.ClientCode LIKE ?'
      queryParams.push(`%${params.clientCode}%`)
    }

    // Get pagination info
    const offset = (params.page - 1) * params.limit

    // Main query for products
    const productsQuery = `
      SELECT 
        m.ID,
        m.CollectCode,
        m.ClientCode,
        m.DesignCode,
        m.NameCode,
        m.CategoryCode,
        m.SizeCode,
        m.Photo1,
        m.Photo2,
        d.DesignName,
        c.CategoryName,
        s.SizeName,
        m.Width,
        m.Height,
        m.Length,
        m.Diameter,
        m.SampCeramicVolume,
        m.Clay,
        m.BuildTech,
        m.Glaze1,
        m.Glaze2,
        m.Glaze3,
        m.Glaze4,
        m.GlazeTemp,
        m.Firing,
        m.History
      FROM tblcollect_master m
      LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
      LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
      LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
      ${whereClause}
      ORDER BY m.CollectCode
      LIMIT ? OFFSET ?
    `

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tblcollect_master m
      LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
      LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
      LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
      ${whereClause}
    `

    const [products, countResult] = await Promise.all([
      query(productsQuery, [...queryParams, params.limit, offset]) as any,
      query(countQuery, queryParams) as any
    ])

    const productsData = Array.isArray(products) ? products : []
    const countData = Array.isArray(countResult) ? countResult : []
    const total = countData.length > 0 ? countData[0].total : 0

    // Get unique values for filters
    const [categories, designs, clientCodes] = await Promise.all([
      query('SELECT DISTINCT c.CategoryCode, c.CategoryName FROM tblcollect_category c ORDER BY c.CategoryName') as any,
      query('SELECT DISTINCT d.DesignCode, d.DesignName FROM tblcollect_design d ORDER BY d.DesignName') as any,
      query('SELECT DISTINCT ClientCode FROM tblcollect_master WHERE ClientCode IS NOT NULL ORDER BY ClientCode') as any
    ])

    const categoriesData = Array.isArray(categories) ? categories : []
    const designsData = Array.isArray(designs) ? designs : []
    const clientCodesData = Array.isArray(clientCodes) ? clientCodes : []

    return NextResponse.json({
      success: true,
      data: {
        products: productsData,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit)
        },
        filters: {
          categories: categoriesData,
          designs: designsData,
          clientCodes: clientCodesData.map(cc => cc.ClientCode).filter(Boolean)
        }
      }
    })

  } catch (error) {
    console.error('Get products for stock error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}