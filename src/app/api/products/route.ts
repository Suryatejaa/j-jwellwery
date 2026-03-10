import { NextRequest, NextResponse } from 'next/server';
// public API is executed on the server; use admin SDK to bypass rules
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('id');

    // If requesting specific product, fetch by ID
    if (productId) {
      const docSnap = await adminDb.collection('products').doc(productId).get();

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        );
      }

      return NextResponse.json({
        id: docSnap.id,
        ...docSnap.data(),
      }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    // Otherwise fetch all products
    const snapshot = await adminDb
      .collection('products')
      .orderBy('createdAt', 'desc')
      .get();
    
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(products, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
