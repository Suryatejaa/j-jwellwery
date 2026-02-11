'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { convertPrivateToPublicR2Url } from '@/lib/url-utils';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

function ProductListItem({ product, onEdit, onDelete }: { product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void; }) {
  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ['/placeholder.svg'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Convert current image url for display
  const currentImageUrl = convertPrivateToPublicR2Url(allImages[currentImageIndex]);

  // Auto-scroll images every 3 seconds
  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allImages.length]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-gray-200">
        <img
          src={currentImageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {currentImageIndex + 1}/{allImages.length}
          </div>
        )}

        <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
          {product.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-emerald-600">₹{product.price}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No products yet. Create your first product!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
