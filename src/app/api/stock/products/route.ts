import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

// GET /api/stock/products - Get products from MySQL for stock creation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const clientCode = searchParams.get('clientCode');
    const designCode = searchParams.get('designCode');
    const categoryCode = searchParams.get('categoryCode');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ` AND (m.CollectCode LIKE ? OR m.ClientCode LIKE ? OR d.DesignName LIKE ? OR n.NameDesc LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (clientCode) {
      whereClause += ` AND m.ClientCode = ?`;
      params.push(clientCode);
    }

    if (designCode) {
      whereClause += ` AND m.DesignCode = ?`;
      params.push(designCode);
    }

    if (categoryCode) {
      whereClause += ` AND m.CategoryCode = ?`;
      params.push(categoryCode);
    }

    const productsQuery = `
      SELECT m.ID, m.CollectCode, m.DesignCode, m.NameCode, m.CategoryCode, 
             m.SizeCode, m.ColorCode, m.TextureCode, m.MaterialCode, m.ClientCode,
             m.Photo1, m.Photo2, m.PriceDollar, m.PriceEuro,
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
      ${whereClause}
      ORDER BY m.CollectCode
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM tblcollect_master m
      LEFT JOIN tblcollect_design d ON m.DesignCode = d.DesignCode
      LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
      LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
      LEFT JOIN tblcollect_color co ON m.ColorCode = co.ColorCode
      LEFT JOIN tblcollect_texture t ON m.TextureCode = t.TextureCode
      LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
      LEFT JOIN tblcollect_material ma ON m.MaterialCode = ma.MaterialCode
      ${whereClause}
    `;

    const [products, countResult] = await Promise.all([
      query(productsQuery, [...params, limit, offset]) as any[],
      query(countQuery, params) as any[]
    ]);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// GET /api/stock/products/[id] - Get single product by ID
export async function getProductById(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    const productRows = await query(
      `SELECT m.ID, m.CollectCode, m.DesignCode, m.NameCode, m.CategoryCode, 
              m.SizeCode, m.ColorCode, m.TextureCode, m.MaterialCode, m.ClientCode,
              m.Photo1, m.Photo2, m.Photo3, m.Photo4, m.PriceDollar, m.PriceEuro,
              m.Width, m.Height, m.Length, m.Diameter, m.Description,
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
      [productId]
    ) as any[];

    if (!productRows || productRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: productRows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// GET /api/stock/products/options - Get product options (dropdowns)
export async function getProductOptions() {
  try {
    const [designs, names, categories, colors, textures, sizes, materials] = await Promise.all([
      query('SELECT DesignCode, DesignName FROM tblcollect_design ORDER BY DesignName') as any[],
      query('SELECT NameCode, NameDesc FROM tblcollect_name ORDER BY NameDesc') as any[],
      query('SELECT CategoryCode, CategoryName FROM tblcollect_category ORDER BY CategoryName') as any[],
      query('SELECT ColorCode, ColorName FROM tblcollect_color ORDER BY ColorName') as any[],
      query('SELECT TextureCode, TextureName FROM tblcollect_texture ORDER BY TextureName') as any[],
      query('SELECT SizeCode, SizeName FROM tblcollect_size ORDER BY SizeName') as any[],
      query('SELECT MaterialCode, MaterialName FROM tblcollect_material ORDER BY MaterialName') as any[]
    ]);

    return NextResponse.json({
      success: true,
      data: {
        designs: designs || [],
        names: names || [],
        categories: categories || [],
        colors: colors || [],
        textures: textures || [],
        sizes: sizes || [],
        materials: materials || []
      }
    });
  } catch (error) {
    console.error('Error fetching product options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product options' },
      { status: 500 }
    );
  }
}