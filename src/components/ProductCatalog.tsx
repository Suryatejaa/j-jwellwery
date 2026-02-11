'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, CartItem } from '@/types';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { CATEGORIES } from '@/lib/categories';

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [products] = useState<Product[]>(initialProducts || []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load cart from storage', err);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let res = products.slice();

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      res = res.filter((p) => p.category === selectedCategory);
    }

    if (minPrice !== '') {
      res = res.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      res = res.filter((p) => p.price <= Number(maxPrice));
    }

    switch (sortOption) {
      case 'price-asc':
        res.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        res.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        res.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        res.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // newest
        res.sort((a, b) => b.createdAt - a.createdAt);
    }

    return res;
  }, [products, search, selectedCategory, minPrice, maxPrice, sortOption]);

  const persistCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (err) {
      console.error('Failed to persist cart', err);
    }
  };

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || product.image,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      const newCart = existingItem
        ? prevCart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, cartItem];

      try {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } catch (err) {
        console.error('Failed to save cart', err);
      }

      return newCart;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.productId !== productId);
      try {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } catch (err) {
        console.error('Failed to save cart', err);
      }
      return newCart;
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const newCart = prevCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
      try {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } catch (err) {
        console.error('Failed to save cart', err);
      }
      return newCart;
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-stretch">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-40 px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice === '' ? '' : String(minPrice)}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-24 px-3 py-2 border rounded-lg"
              />

              <input
                type="number"
                placeholder="Max"
                value={maxPrice === '' ? '' : String(maxPrice)}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-24 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center mt-2 md:mt-0">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border rounded-lg"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setMinPrice('');
                setMaxPrice('');
                setSortOption('newest');
              }}
              className="px-3 py-2 bg-gray-100 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {/* Cart */}
      <Cart items={cart} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity} />
    </div>
  );
}
