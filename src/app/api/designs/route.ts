import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const sql = 'SELECT DesignCode, DesignName FROM tblcollect_design ORDER BY DesignName';
    const results = await query(sql) as any[];
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}