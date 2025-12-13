import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const sql = 'SELECT CategoryCode, CategoryName FROM tblcollect_category ORDER BY CategoryName';
    const results = await query(sql) as any[];
    
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