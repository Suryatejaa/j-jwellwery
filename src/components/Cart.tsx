'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CartItem } from '@/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export default function Cart({ items, onRemoveItem, onUpdateQuantity }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const whatsappLink = generateWhatsAppLink(items);
    window.open(whatsappLink, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gray-300 text-black p-4 rounded-full border border-gray-700 shadow-lg hover:bg-gray-300 transition-colors z-40"
      >
        🛒 {items.length > 0 && <span className="ml-2">{items.length}</span>}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 bg-white rounded-lg shadow-xl p-6 w-80 z-50 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <Link href={`/product/${item.productId}`} className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} x {item.quantity}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="w-7 h-7 rounded border text-sm hover:bg-gray-100"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            -
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            className="w-7 h-7 rounded border text-sm hover:bg-gray-100"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-emerald-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                💬 Order via WhatsApp
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
