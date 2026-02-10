export const generateWhatsAppLink = (
  products: Array<{ name: string; price: number; productId?: string }>
) => {
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  const message = generateOrderMessage(products, typeof window !== 'undefined' ? window.location.origin : '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${businessNumber}?text=${encodedMessage}`;
};

export const generateOrderMessage = (
  products: Array<{ name: string; price: number; productId?: string }>,
  baseUrl: string
) => {
  let message = `${process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hi! I am interested in'}\n\n`;
  
  products.forEach((product) => {
    const url = product.productId && baseUrl ? `${baseUrl}/product/${product.productId}` : '';
    message += `• ${product.name} - ₹${product.price}${url ? `\n  ${url}` : ''}\n`;
  });
  
  message += `\nCould you please provide more details?`;
  
  return message;
};
