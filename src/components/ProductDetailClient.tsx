'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product, CartItem } from '@/types';
import Carousel from '@/components/Carousel';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const params = useParams();
  const resolvedProductId =
    productId || (typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [resolvedProductId]);

  const fetchProduct = async () => {
    try {
      if (!resolvedProductId) {
        setError('Product not found');
        return;
      }
      setLoading(true);
      const response = await fetch(`/api/products?id=${resolvedProductId}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      setError('Failed to load product details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || product.image,
    };

    // Store in localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: CartItem) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || product.image,
    };

    const whatsappLink = generateWhatsAppLink([item]);
    window.open(whatsappLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-800 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">✨ Jewelry Showcase</h1>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Carousel */}
          <div>
            <Carousel images={displayImages} title={product.name} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            {/* Category Badge */}
            <div className="mb-4 inline-flex w-fit">
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>

            {/* Price */}
            <div className="text-5xl font-bold text-emerald-600 mb-6">
              ₹{product.price.toFixed(2)}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Description</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Image Count */}
            {displayImages.length > 1 && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
                📸 This product has {displayImages.length} high-quality images. Use the carousel above to view all!
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="text-gray-700 font-medium mb-2 block">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isAdded ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.316 13.77h.902a.375.375 0 00.369-.303l1.468-9.04a.375.375 0 00-.369-.452h-16.563a.375.375 0 00-.369.452l1.468 9.04a.375.375 0 00.369.303h.902" />
                  <path d="M8.5 19a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm8 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-gray-600 mb-4">
                💬 You'll be redirected to WhatsApp to complete your order
              </p>
              <p className="text-xs text-gray-500">
                ✓ Secure ordering | ✓ Fast delivery | ✓ Quality guaranteed
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
