# 💎 Jewelry Showcase - Serverless Application

A modern Next.js + Firebase serverless application for jewelry businesses. Allows customers to browse and order products via WhatsApp, while admins can manage the product catalog.

## Features

### Customer Features
- **Browse Products**: Beautiful product gallery with filtering
- **Shopping Cart**: Add products to cart with quantity management
- **WhatsApp Ordering**: Direct checkout via WhatsApp with pre-filled order details
- **Responsive Design**: Mobile-friendly interface
- **Real-time Product Updates**: Products displayed in real-time from Firebase

### Admin Features
- **Firebase Authentication**: Secure admin login/signup
- **Product Management**: Add, edit, and delete products
- **Image Support**: Upload product images with URL-based hosting
- **Product Categories**: Organize products by category
- **Dashboard**: Clean admin interface for product management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth)
- **Forms**: React Hook Form, Zod
- **HTTP**: Axios

## Prerequisites

- Node.js 18+ and npm
- Firebase project account
- WhatsApp Business Account (for order processing)

## Setup Instructions

### 1. Clone and Install

```bash
cd /Volumes/D-Drive/Projects/jwellery-showcase
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable:
   - **Firestore Database** (Start in test mode for development)
   - **Authentication** (Email/Password method)
   - **Storage** (for optional image hosting)
4. Get your Firebase config from Project Settings

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=1234567890
NEXT_PUBLIC_WHATSAPP_MESSAGE=Hi! I am interested in
```

### 4. Firebase Firestore Setup

Create a Firestore collection named `products` with the following structure:

```
Collection: products
- Document fields:
  - name: string
  - description: string
  - price: number
  - image: string (URL)
  - category: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Customer homepage
│   ├── globals.css                # Global styles
│   ├── admin/
│   │   ├── login/page.tsx         # Admin login page
│   │   └── dashboard/page.tsx     # Admin dashboard
│   └── api/
│       ├── products/route.ts      # Get products
│       └── admin/products/route.ts # CRUD operations
├── components/
│   ├── ProductCard.tsx            # Product display card
│   ├── Cart.tsx                   # Shopping cart widget
│   ├── ProductForm.tsx            # Admin product form
│   ├── ProductList.tsx            # Admin product list
│   └── AdminNav.tsx               # Admin navigation
├── lib/
│   ├── firebase.ts                # Firebase config
│   └── whatsapp.ts                # WhatsApp integration
└── types/
    └── index.ts                   # TypeScript types
```

## Usage

### For Customers

1. **Browse Products**: Visit home page to see all products
2. **Add to Cart**: Click "Add to Cart" button on any product
3. **Open Cart**: Click the cart icon in bottom-right corner
4. **Checkout**: Click "Order via WhatsApp" to open chat with pre-filled order

### For Admins

1. **Login**: Visit `/admin/login` and sign up with email/password
2. **Add Product**: Click "+ Add Product" and fill the form
3. **Edit Product**: Click "Edit" on any product card to modify
4. **Delete Product**: Click "Delete" to remove a product

## API Endpoints

### GET `/api/products`
Fetch all products

**Response:**
```json
[
  {
    "id": "product_id",
    "name": "Diamond Ring",
    "description": "Beautiful diamond ring",
    "price": 999.99,
    "image": "https://example.com/image.jpg",
    "category": "rings",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### POST `/api/admin/products`
Create new product (requires authentication)

**Request:**
```json
{
  "name": "Diamond Ring",
  "description": "Beautiful diamond ring",
  "price": 999.99,
  "image": "https://example.com/image.jpg",
  "category": "rings"
}
```

### PUT `/api/admin/products`
Update product (requires authentication)

### DELETE `/api/admin/products?id=product_id`
Delete product (requires authentication)

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard and deploy.

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## WhatsApp Integration

The app generates WhatsApp links for orders. Customers click "Order via WhatsApp" and:

1. Opens WhatsApp Web/Mobile
2. Pre-fills message with product list and prices
3. Opens chat with your business number

Example message format:
```
Hi! I am interested in

• Diamond Ring - $999.99
• Gold Necklace - $599.99

Could you please provide more details?
```

Update the phone number in `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=1234567890  # Include country code, no + symbol
```

## Security Notes

- Firestore rules should restrict product writes to authenticated admins
- Test mode Firestore rules need to be updated for production
- Consider implementing role-based access for multi-admin scenarios

### Recommended Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Products not loading
- Check Firebase connection in browser console
- Verify Firestore database is accessible
- Ensure `.env.local` has correct Firebase config

### Admin login not working
- Verify Email/Password auth is enabled in Firebase
- Check browser console for auth errors
- Ensure user account exists in Firebase Authentication

### WhatsApp link not working
- Verify phone number format (no + or spaces)
- Test link manually: `https://wa.me/1234567890`
- Check NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER value

## License

MIT

## Support

For issues or questions, check Firebase and Next.js documentation or create an issue in the repository.
# j-jwellwery
