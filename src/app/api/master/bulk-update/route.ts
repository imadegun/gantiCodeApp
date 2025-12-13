import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, clientCode } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs array is required' },
        { status: 400 }
      );
    }

    if (clientCode === undefined) {
      return NextResponse.json(
        { success: false, error: 'ClientCode is required' },
        { status: 400 }
      );
    }

    // Create placeholders for the IN clause
    const placeholders = ids.map(() => '?').join(',');
    
    const sql = `UPDATE tblcollect_master SET ClientCode = ? WHERE ID IN (${placeholders})`;
    await query(sql, [clientCode, ...ids]);

    return NextResponse.json({
      success: true,
      message: `${ids.length} items updated successfully`,
      updatedCount: ids.length
    });
  } catch (error) {
    console.error('Error bulk updating ClientCode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ClientCode' },
      { status: 500 }
    );
  }
}