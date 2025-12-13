import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, clientCode } objects

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Validate all updates first
    const errors = [];
    for (const update of updates) {
      if (!update.id || update.clientCode === undefined) {
        errors.push(`Invalid update data for item ID: ${update.id}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation errors', details: errors },
        { status: 400 }
      );
    }

    // Check for duplicate ClientCodes within the updates
    const clientCodes = updates.map(u => u.clientCode).filter(code => code);
    const uniqueCodes = [...new Set(clientCodes)];
    if (clientCodes.length !== uniqueCodes.length) {
      return NextResponse.json(
        { success: false, error: 'Duplicate ClientCodes found in bulk update' },
        { status: 400 }
      );
    }

    // Check for existing ClientCodes in database
    const existingCodes = [];
    for (const update of updates) {
      if (update.clientCode) {
        const sql = 'SELECT COUNT(*) as count FROM tblcollect_master WHERE ClientCode = ? AND ID != ?';
        const results = await query(sql, [update.clientCode, update.id]) as any[];
        if (results[0]?.count > 0) {
          existingCodes.push(update.clientCode);
        }
      }
    }

    if (existingCodes.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Some ClientCodes already exist in database', 
          duplicateCodes: existingCodes 
        },
        { status: 409 }
      );
    }

    // Perform bulk update
    let successCount = 0;
    const updateErrors = [];

    for (const update of updates) {
      try {
        const sql = 'UPDATE tblcollect_master SET ClientCode = ? WHERE ID = ?';
        await query(sql, [update.clientCode, update.id]);
        successCount++;
      } catch (error) {
        updateErrors.push(`Failed to update item ID ${update.id}: ${error}`);
      }
    }

    if (updateErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some updates failed',
        details: updateErrors,
        successCount
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successCount} items`,
      updatedCount: successCount
    });
  } catch (error) {
    console.error('Error in bulk save:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk save' },
      { status: 500 }
    );
  }
}