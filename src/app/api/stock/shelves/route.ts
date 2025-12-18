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

// PUT /api/stock/shelves/[id] - Update shelf
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, warehouseId, code, row, column, level, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Shelf ID is required' },
        { status: 400 }
      );
    }

    // Check if updating code and if it conflicts with another shelf in the same warehouse
    if (code && warehouseId) {
      const existingShelf = await prisma.shelf.findFirst({
        where: {
          warehouseId,
          code,
          id: { not: id },
          isActive: true
        }
      });

      if (existingShelf) {
        return NextResponse.json(
          { success: false, error: 'Shelf code already exists in this warehouse' },
          { status: 409 }
        );
      }
    }

    const shelf = await prisma.shelf.update({
      where: { id },
      data: {
        ...(warehouseId && { warehouseId }),
        ...(code && { code }),
        ...(row !== undefined && { row }),
        ...(column !== undefined && { column }),
        ...(level !== undefined && { level }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
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
      message: 'Shelf updated successfully'
    });
  } catch (error) {
    console.error('Error updating shelf:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shelf' },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/shelves/[id] - Delete shelf (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Shelf ID is required' },
        { status: 400 }
      );
    }

    // Check if shelf has active stock
    const shelfWithStocks = await prisma.shelf.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stocks: true }
        }
      }
    });

    if (shelfWithStocks && shelfWithStocks._count.stocks > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete shelf with active stock. Move or delete stock first.' },
        { status: 409 }
      );
    }

    // Soft delete by setting isActive to false
    const shelf = await prisma.shelf.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Shelf deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shelf:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shelf' },
      { status: 500 }
    );
  }
}