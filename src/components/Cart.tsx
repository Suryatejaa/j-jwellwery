'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
}

export default function Cart({ items, onRemoveItem }: CartProps) {
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
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-40"
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
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.price} x {item.quantity}
                      </p>
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
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
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
