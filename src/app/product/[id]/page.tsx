import { headers } from 'next/headers';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Product } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

type PageParams = {
  params: { id: string };
};

async function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    return siteUrl.replace(/\/+$/, '');
  }
  const headerList = await headers();
  const host = headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') || 'https';
  if (!host) return '';
  return `${proto}://${host}`;
}

async function fetchProduct(baseUrl: string, productId: string) {
  if (!baseUrl) return null;
  const response = await fetch(`${baseUrl}/api/products?id=${productId}`, {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function generateMetadata({ params }: PageParams) {
  const baseUrl = await getBaseUrl();

  // `params` may be a Promise in newer Next versions — unwrap first
  const resolvedParams = (await (params as any)) as { id?: string };
  if (!resolvedParams || !resolvedParams.id || typeof resolvedParams.id !== 'string') {
    console.warn('generateMetadata: invalid params', params);
    return { title: 'Product Not Found' };
  }

  const productId = resolvedParams.id;

  try {
    console.log('[generateMetadata] productId:', productId, 'baseUrl:', baseUrl || '(none)');

    // Read product directly from Firestore (server-side) — more reliable for metadata
    const productRef = doc(db, 'products', productId);
    const snap = await getDoc(productRef);

    if (!snap.exists()) {
      console.warn('[generateMetadata] product not found in Firestore', productId);
      return { title: 'Product Not Found' };
    }

    const product = { id: snap.id, ...(snap.data() as any) } as Product;
    const imageUrl = product.images?.[0] || product.image || `${baseUrl}/placeholder.svg`;
    const description = product.description || 'View product details';
    const url = baseUrl ? `${baseUrl}/product/${product.id}` : `/product/${product.id}`;

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        url,
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error('generateMetadata error:', err);
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetail({ params }: PageParams) {
  const resolvedParams = (await (params as any)) as { id?: string };
  const productId = resolvedParams?.id || '';
  return <ProductDetailClient productId={productId} />;
}
