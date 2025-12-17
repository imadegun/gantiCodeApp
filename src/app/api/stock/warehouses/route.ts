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