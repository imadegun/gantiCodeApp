import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const designCode = searchParams.get('designCode');

    let sql = 'SELECT DISTINCT c.CategoryCode, c.CategoryName FROM tblcollect_category c';
    const params: any[] = [];

    if (designCode) {
      sql += ' INNER JOIN tblcollect_master m ON c.CategoryCode = m.CategoryCode WHERE m.DesignCode = ?';
      params.push(designCode);
    }

    sql += ' ORDER BY c.CategoryName';

    const results = await query(sql, params) as any[];

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}