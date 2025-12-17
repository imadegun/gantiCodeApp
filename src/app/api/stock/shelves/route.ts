import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock/shelves - Get all shelves or by warehouse
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

    const shelves = await prisma.shelf.findMany({
      where: {
        isActive: true,
        ...(warehouseId && { warehouseId })
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            stocks: true
          }
        }
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { code: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, data: shelves });
  } catch (error) {
    console.error('Error fetching shelves:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shelves' },
      { status: 500 }
    );
  }
}

// POST /api/stock/shelves - Create new shelf
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { warehouseId, code, row, column, level, description } = body;

    if (!warehouseId || !code) {
      return NextResponse.json(
        { success: false, error: 'Warehouse ID and code are required' },
        { status: 400 }
      );
    }

    // Check if shelf code already exists in the same warehouse
    const existingShelf = await prisma.shelf.findFirst({
      where: {
        warehouseId,
        code,
        isActive: true
      }
    });

    if (existingShelf) {
      return NextResponse.json(
        { success: false, error: 'Shelf code already exists in this warehouse' },
        { status: 409 }
      );
    }

    const shelf = await prisma.shelf.create({
      data: {
        warehouseId,
        code,
        row,
        column,
        level,
        description
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: shelf,
      message: 'Shelf created successfully'
    });
  } catch (error) {
    console.error('Error creating shelf:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shelf' },
      { status: 500 }
    );
  }
}