import { headers } from 'next/headers';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Product } from '@/types';

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
  const product = (await fetchProduct(baseUrl, params.id)) as Product | null;

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const imageUrl = product.images?.[0] || product.image || `${baseUrl}/placeholder.svg`;
  const description = product.description || 'View product details';
  const url = `${baseUrl}/product/${product.id}`;

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
}

export default function ProductDetail({ params }: PageParams) {
  return <ProductDetailClient productId={params.id} />;
}
