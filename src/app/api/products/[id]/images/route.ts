import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with a query to the new tblcollect_images table
    // For now, we will use the existing Photo1, Photo2, etc. fields
    const sql = 'SELECT Photo1, Photo2, Photo3, Photo4, Photo5, Photo6, Photo7 FROM tblcollect_master WHERE ID = ?';
    const result = await query(sql, [id]) as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const productPhotos = result[0];
    const images = Object.values(productPhotos).filter(photo => photo).map((photo, index) => ({
      id: index,
      image_url: photo,
      is_main_image: index === 0,
    }));

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product images' },
      { status: 500 }
    );
  }
}
