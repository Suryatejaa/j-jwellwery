import { NextRequest, NextResponse } from 'next/server';
// admin route is always executed on the server; authenticate using admin SDK
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, category, images, video } = body;

    if (!name || !price || !image || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const docRef = await adminDb.collection('products').add({
      name,
      description,
      price: parseFloat(price),
      image,
      images: images && images.length > 0 ? images : [image],
      category,
      video: video || null,
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
    });

    return NextResponse.json(
      { id: docRef.id, message: 'Product created successfully' },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, image, category, images, video } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const productRef = adminDb.collection('products').doc(id);
    await productRef.update({
      name,
      description,
      price: parseFloat(price),
      image,
      images: images && images.length > 0 ? images : [image],
      category,
      video: video || null,
      updatedAt: Timestamp.now().toMillis(),
    });

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const productRef = adminDb.collection('products').doc(id);
    await productRef.delete();

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
