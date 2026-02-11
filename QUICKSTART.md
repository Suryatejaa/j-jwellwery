# 🚀 Quick Start Guide

## 5-Minute Setup

### Step 1: Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=1234567890
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Dev Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Firebase Setup (Detailed)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Add project"
- Name it "jewellery-showcase"
- Click "Create project"

### 2. Enable Firestore
- In left menu, go to "Firestore Database"
- Click "Create database"
- Select "Start in test mode"
- Select your region
- Click "Create"

### 3. Enable Authentication
- Go to "Authentication" in left menu
- Click "Get started"
- Enable "Email/Password" provider
- Click "Enable"

### 4. Get Firebase Config
- Click ⚙️ Settings (top-right) → "Project settings"
- Scroll to "Your apps" section
- Copy your Firebase config values
- Paste into `.env.local`

### 5. Create Products Collection
- Go to Firestore Database
- Click "+ Create collection"
- Name it "products" (exactly!)
- Click "Next"
- Click "Auto ID" to create first document
- Add fields:
  - `name` (string)
  - `description` (string)
  - `price` (number)
  - `image` (string - URL)
  - `category` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
- Add sample product data and save

---

## User Flows

### Customer Journey
```
1. Visit http://localhost:3000
2. Browse products loaded from Firestore
3. Click "Add to Cart" on products
4. Click cart icon (bottom-right)
5. Click "Order via WhatsApp"
6. WhatsApp opens with pre-filled message
7. Customer sends to business
```

### Admin Journey
```
1. Visit http://localhost:3000/admin/login
2. Click "Sign Up" to create admin account
3. Enter email/password and create account
4. Redirects to dashboard
5. Click "+ Add Product"
6. Fill form and submit
7. Product appears in Firestore and on store
```

---

## File Structure Quick Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Customer homepage |
| `src/app/admin/login/page.tsx` | Admin login |
| `src/app/admin/dashboard/page.tsx` | Product management |
| `src/app/api/products/route.ts` | Get products |
| `src/app/api/admin/products/route.ts` | CRUD operations |
| `src/lib/firebase.ts` | Firebase config |
| `src/lib/whatsapp.ts` | WhatsApp links |
| `.env.local` | Environment variables |

---

## Testing Locally

### Test Customer Flow
1. Add a test product via admin
2. Go to home page, product should appear
3. Add to cart, cart count increases
4. Open cart, click WhatsApp button
5. Should open WhatsApp with message

### Test Admin Flow
1. Create admin account at `/admin/login`
2. Should redirect to dashboard
3. Add/edit/delete products
4. Changes should appear immediately

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Products not loading" | Check Firebase config in `.env.local` |
| "Can't login" | Enable Email/Password in Firebase Auth |
| "WhatsApp link broken" | Verify phone number format (no +) |
| "404 on admin page" | Check `.env.local` has all Firebase vars |

---

## Next Steps

1. ✅ Setup complete!
2. 📱 Customize colors/styling (Tailwind in components)
3. 🎨 Add company branding/logo
4. 🚀 Deploy to Vercel/Firebase
5. 📊 Monitor with Firebase Analytics

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Check code quality
```

---

Happy selling! 💎
