import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const purchaseOrders = await db.purchaseOrder.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: purchaseOrders
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poNo, clientId, deliveryDate, qtyOrdered, notes } = body;

    // Validate required fields
    if (!poNo || !clientId || !deliveryDate || !qtyOrdered) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if PO number already exists
    const existingPO = await db.purchaseOrder.findUnique({
      where: { poNo }
    });

    if (existingPO) {
      return NextResponse.json(
        { success: false, error: 'PO number already exists' },
        { status: 400 }
      );
    }

    // Create new purchase order
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        poNo,
        clientId,
        deliveryDate: new Date(deliveryDate),
        qtyOrdered: parseInt(qtyOrdered),
        notes: notes || null,
        status: 'draft'
      }
    });

    return NextResponse.json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}