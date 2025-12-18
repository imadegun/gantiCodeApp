import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const designCode = searchParams.get('designCode');

    if (!designCode) {
      return NextResponse.json(
        { success: false, error: 'designCode parameter harus diisi'},
        { status: 400 }
      );
    }

    const sql = `
      SELECT DISTINCT m.ClientCode, m.ID
      FROM tblcollect_master m
      WHERE m.DesignCode = ? AND m.ClientCode IS NOT NULL AND m.ClientCode != ''
      ORDER BY m.ClientCode
    `;

    const results = await query(sql, [designCode]) as any[];

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching client codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client codes' },
      { status: 500 }
    );
  }
}