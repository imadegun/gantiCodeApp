import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { query } from '@/lib/mysql';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            designCode,
            clientCode,
            department,
            region,
            totalQuantity,
            availableQuantity,
            reservedQuantity,
            notes
        } = body;

        if (!designCode || !clientCode) {
            return NextResponse.json(
                { success: false, error: 'DesignCode and ClientCode are required' },
                { status: 400 }
            );
        }

        // 1. Fetch latest details from MySQL to ensure snapshot accuracy
        // We look for the specific record matching both DesignCode and ClientCode
        const sql = `
      SELECT 
        tm.ID,
        tm.NameCode,
        tm.Photo1,
        tm.CategoryCode,
        tm.ColorCode,
        tm.TextureCode,
        tm.SizeCode,
        tm.MaterialCode
      FROM tblcollect_master tm
      WHERE tm.DesignCode = ? AND tm.ClientCode = ?
      LIMIT 1
    `;

        const mysqlResults = await query(sql, [designCode, clientCode]) as any[];
        const productData = mysqlResults[0];

        // Even if not found in MySQL (edge case), we might still want to allow saving if the user provided data?
        // For now, let's assume valid data IS in MySQL.
        if (!productData) {
            return NextResponse.json(
                { success: false, error: 'Product not found in master database' },
                { status: 404 }
            );
        }

        // 2. Create Stock record in Postgres
        const stock = await prisma.stock.create({
            data: {
                designCode,
                clientCode,
                nameCode: productData.NameCode,
                photo1: productData.Photo1,
                categoryCode: productData.CategoryCode,
                colorCode: productData.ColorCode,
                textureCode: productData.TextureCode,
                sizeCode: productData.SizeCode,
                materialCode: productData.MaterialCode,

                department,
                region,

                totalQuantity: totalQuantity || 0,
                availableQuantity: availableQuantity || 0,
                reservedQuantity: reservedQuantity || 0,

                notes,
                status: (availableQuantity > 0) ? 'available' : 'out_of_stock'
            }
        });

        return NextResponse.json({
            success: true,
            data: stock
        });

    } catch (error) {
        console.error('Error creating stock:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create stock entry' },
            { status: 500 }
        );
    }
}
