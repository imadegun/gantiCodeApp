import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const sql = `
      SELECT DISTINCT DesignCode 
      FROM tblcollect_master 
      WHERE DesignCode IS NOT NULL AND DesignCode != ''
      ORDER BY DesignCode ASC
    `;
    
    const results = await query(sql) as any[];
    
    return NextResponse.json({
      success: true,
      data: results.map(r => r.DesignCode)
    });
  } catch (error) {
    console.error('Error fetching design codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch design codes' },
      { status: 500 }
    );
  }
}
