import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('id');

    // If requesting specific product, fetch by ID
    if (productId) {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
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
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
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
