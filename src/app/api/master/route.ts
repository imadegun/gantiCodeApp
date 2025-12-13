import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const sql = `
      SELECT 
        tm.ID,
        tm.ClientCode,
        tm.DesignCode,
        tm.CategoryCode,
        tm.SizeCode,
        tm.Photo1,
        td.DesignName,
        tc.CategoryName,
        ts.SizeName
      FROM tblcollect_master tm
      LEFT JOIN tblcollect_design td ON tm.DesignCode = td.DesignCode
      LEFT JOIN tblcollect_category tc ON tm.CategoryCode = tc.CategoryCode
      LEFT JOIN tblcollect_size ts ON tm.SizeCode = ts.SizeCode
      ORDER BY tm.ID DESC
    `;
    
    const results = await query(sql) as any[];
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching master data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}