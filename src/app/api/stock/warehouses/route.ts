import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock/warehouses - Get all warehouses
export async function GET(request: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        shelves: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        },
        _count: {
          select: {
            stocks: true
          }
        }
      },
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

// POST /api/stock/warehouses - Create new warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, location, description } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if warehouse code already exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code }
    });

    if (existingWarehouse) {
      return NextResponse.json(
        { success: false, error: 'Warehouse code already exists' },
        { status: 409 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        location,
        description
      }
    });

    return NextResponse.json({
      success: true,
      data: warehouse,
      message: 'Warehouse created successfully'
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}

// PUT /api/stock/warehouses/[id] - Update warehouse
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, code, location, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Warehouse ID is required' },
        { status: 400 }
      );
    }

    // Check if updating code and if it conflicts with another warehouse
    if (code) {
      const existingWarehouse = await prisma.warehouse.findFirst({
        where: {
          code,
          id: { not: id }
        }
      });

      if (existingWarehouse) {
        return NextResponse.json(
          { success: false, error: 'Warehouse code already exists' },
          { status: 409 }
        );
      }
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      success: true,
      data: warehouse,
      message: 'Warehouse updated successfully'
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update warehouse' },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/warehouses/[id] - Delete warehouse (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Warehouse ID is required' },
        { status: 400 }
      );
    }

    // Check if warehouse has active stock
    const warehouseWithStocks = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stocks: true }
        }
      }
    });

    if (warehouseWithStocks && warehouseWithStocks._count.stocks > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete warehouse with active stock. Move or delete stock first.' },
        { status: 409 }
      );
    }

    // Soft delete by setting isActive to false
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete warehouse' },
      { status: 500 }
    );
  }
}