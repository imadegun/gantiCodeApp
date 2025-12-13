import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clientCode } = body;

    if (!id || clientCode === undefined) {
      return NextResponse.json(
        { success: false, error: 'ID and ClientCode are required' },
        { status: 400 }
      );
    }

    const sql = 'UPDATE tblcollect_master SET ClientCode = ? WHERE ID = ?';
    await query(sql, [clientCode, id]);

    return NextResponse.json({
      success: true,
      message: 'ClientCode updated successfully'
    });
  } catch (error) {
    console.error('Error updating ClientCode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ClientCode' },
      { status: 500 }
    );
  }
}