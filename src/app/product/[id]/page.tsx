import { headers } from 'next/headers';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Product } from '@/types';
// server components use admin SDK to avoid permission issues
import { adminDb } from '@/lib/firebaseAdmin';

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
    const snap = await adminDb.collection('products').doc(productId).get();

    if (!snap.exists) {
      console.warn('[generateMetadata] product not found in Firestore', productId);
      return { title: 'Product Not Found' };
    }

    const product = { id: snap.id, ...(snap.data() as any) } as Product;

    // Normalize image URL to absolute so social crawlers (WhatsApp/Facebook) can fetch it reliably
    let imageUrl = product.images?.[0] || product.image || '/placeholder.svg';
    if (imageUrl.startsWith('/')) {
      imageUrl = baseUrl ? `${baseUrl}${imageUrl}` : imageUrl;
    }
    // ensure protocol-present absolute url for external/public assets
    if (!/^https?:\/\//i.test(imageUrl) && baseUrl) {
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    const description = product.description || 'View product details';
    const url = baseUrl ? `${baseUrl}/product/${product.id}` : `/product/${product.id}`;

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        url,
        images: [
          {
            url: imageUrl,
            alt: product.name,
            // recommended size for social previews
            width: 1200,
            height: 630,
          },
        ],
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
