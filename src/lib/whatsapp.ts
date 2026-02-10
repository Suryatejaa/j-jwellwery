export const generateWhatsAppLink = (products: Array<{ name: string; price: number }>) => {
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  const message = generateOrderMessage(products);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${businessNumber}?text=${encodedMessage}`;
};

export const generateOrderMessage = (products: Array<{ name: string; price: number }>) => {
  let message = `${process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hi! I am interested in'}\n\n`;
  
  products.forEach((product) => {
    message += `• ${product.name} - ₹${product.price}\n`;
  });
  
  message += `\nCould you please provide more details?`;
  
  return message;
};
