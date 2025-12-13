import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientCode, excludeId } = body;

    if (!clientCode) {
      return NextResponse.json(
        { success: false, error: 'ClientCode is required' },
        { status: 400 }
      );
    }

    // Check if ClientCode already exists (excluding current item if editing)
    let sql = 'SELECT COUNT(*) as count FROM tblcollect_master WHERE ClientCode = ?';
    let params = [clientCode];

    if (excludeId) {
      sql += ' AND ID != ?';
      params.push(excludeId);
    }

    const results = await query(sql, params) as any[];
    const count = results[0]?.count || 0;

    const isUnique = count === 0;

    return NextResponse.json({
      success: true,
      isUnique,
      exists: !isUnique,
      message: isUnique ? 'ClientCode is available' : 'ClientCode already exists'
    });
  } catch (error) {
    console.error('Error checking ClientCode uniqueness:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check ClientCode uniqueness' },
      { status: 500 }
    );
  }
}