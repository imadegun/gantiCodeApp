import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const designCode = searchParams.get('designCode');

        if (!designCode) {
            return NextResponse.json(
                { success: false, error: 'DesignCode is required' },
                { status: 400 }
            );
        }

        const sql = `
      SELECT 
        tm.ID,
        tm.ClientCode,
        tm.DesignCode,
        tm.NameCode,
        tm.CategoryCode,
        tm.ColorCode,
        tm.TextureCode,
        tm.SizeCode,
        tm.MaterialCode,
        tm.Photo1,
        td.DesignName,
        tc.CategoryName,
        ts.SizeName
      FROM tblcollect_master tm
      LEFT JOIN tblcollect_design td ON tm.DesignCode = td.DesignCode
      LEFT JOIN tblcollect_category tc ON tm.CategoryCode = tc.CategoryCode
      LEFT JOIN tblcollect_size ts ON tm.SizeCode = ts.SizeCode
      WHERE tm.DesignCode = ?
      ORDER BY tm.ClientCode ASC
    `;

        const results = await query(sql, [designCode]) as any[];

        return NextResponse.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch details' },
            { status: 500 }
        );
    }
}
