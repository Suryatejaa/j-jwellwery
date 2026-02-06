# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Next.js Frontend (React)                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Pages:                                              │   │
│  │  • / (Home - Product Gallery)                        │   │
│  │  • /admin/login (Admin Authentication)              │   │
│  │  • /admin/dashboard (Product Management)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
├─────────────────────────────────────────────────────────────┤
│  • GET  /api/products          (Fetch all products)         │
│  • POST /api/admin/products    (Create product)             │
│  • PUT  /api/admin/products    (Update product)             │
│  • DELETE /api/admin/products  (Delete product)             │
└─────────────────────────────────────────────────────────────┘
                           ↕ (SDK)
┌─────────────────────────────────────────────────────────────┐
│                      FIREBASE BACKEND                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │   Firestore     │  │ Auth        │  │  Storage     │    │
│  │   (Database)    │  │ (Email/Pass)│  │  (Images)    │    │
│  ├─────────────────┤  ├─────────────┤  ├──────────────┤    │
│  │ Collections:    │  │ • Users     │  │ • Product    │    │
│  │ • products      │  │ • Sessions  │  │   Images     │    │
│  │   - name        │  │             │  │              │    │
│  │   - price       │  │             │  │              │    │
│  │   - image       │  │             │  │              │    │
│  │   - category    │  │             │  │              │    │
│  └─────────────────┘  └─────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Customer Purchase Flow
```
Customer          Frontend         Backend         Firebase       WhatsApp
   │                 │               │                 │              │
   ├─ Browse ───────>│               │                 │              │
   │                 ├─ GET /api/products ──────────>│              │
   │                 │<─ products ───────────────────│              │
   │<─ Display ──────┤               │                 │              │
   │                 │               │                 │              │
   ├─ Add to cart ─->│               │                 │              │
   │<─ Cart updated ─┤               │                 │              │
   │                 │               │                 │              │
   ├─ Checkout ─────>│               │                 │              │
   │                 ├─ Generate WhatsApp Link ──────>│              │
   │                 │<─ Link ────────────────────────│              │
   │<─ Open WhatsApp ┤               │                 │              │
   │                 │               │                 │              ├─ Pre-filled message
   │─ Send Order ───────────────────────────────────────────────────>│
   │                 │               │                 │              │
   │<─ Confirmation ─────────────────────────────────────────────────│
```

### Admin Product Management Flow
```
Admin          Frontend         Backend         Firebase
  │               │               │                 │
  ├─ Login ──────>│               │                 │
  │               ├─ POST /auth ──────────────────>│
  │               │<─ Auth token ──────────────────│
  │<─ Dashboard ──┤               │                 │
  │               │               │                 │
  ├─ Add Product ─>│               │                 │
  │               ├─ POST /api/admin/products ────>│
  │               │<─ Success ─────────────────────│
  │<─ Reload ─────┤               │                 │
  │               │               │                 │
  ├─ Edit Product ─>│              │                 │
  │               ├─ PUT /api/admin/products ─────>│
  │               │<─ Updated ─────────────────────│
  │<─ Reload ─────┤               │                 │
  │               │               │                 │
  ├─ Delete Product>│              │                 │
  │               ├─ DELETE /api/admin/products ──>│
  │               │<─ Deleted ─────────────────────│
  │<─ Reload ─────┤               │                 │
```

## Component Architecture

```
App Root
├── Layout (Metadata, Fonts)
│
├── Pages/
│   ├── Home (/)
│   │   ├── Header (Nav + Admin Link)
│   │   ├── ProductGrid
│   │   │   └── ProductCard (Add to Cart Button)
│   │   └── Cart Widget
│   │       ├── CartItems
│   │       └── CheckoutButton (WhatsApp Link)
│   │
│   ├── AdminLogin (/admin/login)
│   │   └── AuthForm (Login/Signup Toggle)
│   │
│   └── AdminDashboard (/admin/dashboard)
│       ├── AdminNav (Logout + User Email)
│       ├── AddProductButton
│       ├── ProductForm
│       │   ├── TextInputs
│       │   ├── SelectCategory
│       │   ├── ImagePreview
│       │   └── SubmitButton
│       └── ProductList
│           └── ProductCard (Edit/Delete Buttons)
│
├── API Routes
│   ├── /api/products (GET)
│   └── /api/admin/products (POST, PUT, DELETE)
│
├── Services
│   ├── firebase (Auth, Firestore)
│   └── whatsapp (Link Generation)
│
└── Types
    └── Product, CartItem Interfaces
```

## Technology Stack

```
Frontend Layer
├── React 19 (UI Components)
├── Next.js 16 (Server-Side Rendering, API Routes)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
└── React Hook Form (Form Handling)

Backend Layer
├── Next.js API Routes (Serverless Functions)
└── Firebase SDK (Database, Auth)

External Services
├── Firebase Firestore (NoSQL Database)
├── Firebase Authentication (User Management)
└── WhatsApp Web API (Order Messaging)

Infrastructure
├── Vercel (Deployment, Hosting)
├── Firebase Project (Backend Services)
└── Domain Provider (DNS)
```

## Database Schema

```
Firebase Project
├── Authentication
│   ├── Users (Email/Password)
│   │   └── Admin Users
│   └── Sessions
│
├── Firestore
│   └── collections
│       └── products/
│           ├── {productId1}/
│           │   ├── name: "Diamond Ring"
│           │   ├── description: "Luxury diamond ring"
│           │   ├── price: 999.99
│           │   ├── image: "https://..."
│           │   ├── category: "rings"
│           │   ├── createdAt: 1707244800000
│           │   └── updatedAt: 1707244800000
│           │
│           ├── {productId2}/
│           │   ├── name: "Gold Necklace"
│           │   ├── description: "Elegant gold necklace"
│           │   ├── price: 599.99
│           │   ├── image: "https://..."
│           │   ├── category: "necklaces"
│           │   ├── createdAt: 1707244860000
│           │   └── updatedAt: 1707244860000
│           │
│           └── ...
│
└── Storage (Optional)
    └── product-images/
        ├── product1.jpg
        ├── product2.jpg
        └── ...
```

## Security Model

```
Public Access
├── GET /api/products (Unauthenticated)
└── View Home Page (Unauthenticated)

Authenticated Access
├── POST /api/admin/products (Logged-in Admin)
├── PUT /api/admin/products (Logged-in Admin)
├── DELETE /api/admin/products (Logged-in Admin)
├── View Admin Dashboard (Logged-in Admin)
└── Access /admin/* routes (Logged-in Admin)

Firebase Rules
├── Firestore
│   ├── Read Products: Allow (Public)
│   ├── Write Products: Allow (Auth Users Only)
│   └── Delete Products: Allow (Auth Users Only)
│
└── Authentication
    ├── Email/Password: Enabled
    ├── Sign Up: Enabled
    └── Sign In: Enabled
```

## Deployment Architecture

```
Development
├── Local Machine
│   ├── npm run dev
│   ├── http://localhost:3000
│   └── Connected to Firebase Project

Production (Vercel)
├── Vercel Edge Network
│   ├── Static Assets (CSS, JS)
│   ├── API Routes
│   └── Server-Side Rendering
│
└── Connected to Firebase Backend
    ├── Firestore (Realtime Database)
    ├── Authentication (User Management)
    └── Storage (Images)

Production (Firebase Hosting Alternative)
├── Firebase Hosting
│   ├── Static Assets
│   └── Cloud Functions (API)
│
└── Connected to Firebase Services
    ├── Firestore
    ├── Authentication
    └── Storage
```

## API Response Examples

### GET /api/products
```json
[
  {
    "id": "abc123",
    "name": "Diamond Ring",
    "description": "Luxury engagement ring",
    "price": 999.99,
    "image": "https://example.com/ring.jpg",
    "category": "rings",
    "createdAt": 1707244800000,
    "updatedAt": 1707244800000
  }
]
```

### POST /api/admin/products
```json
{
  "id": "xyz789",
  "message": "Product created successfully"
}
```

## Error Handling Flow

```
User Action
    ↓
Frontend Request
    ↓
API Route Handler
    ├─ Validation Error
    │  └─ Return 400 Bad Request
    │
    ├─ Auth Error
    │  └─ Return 401 Unauthorized
    │
    ├─ Database Error
    │  └─ Return 500 Server Error
    │
    └─ Success
       └─ Return 200 OK with Data

Frontend Error Handler
    ├─ Display Error Toast
    ├─ Log to Console
    └─ Optionally Retry
```

---

## System Requirements

- Node.js: >= 18.0
- npm: >= 9.0
- Firebase Account (Free tier sufficient)
- Modern Browser (Chrome, Safari, Firefox, Edge)
- Internet Connection
- WhatsApp Business Account (for WhatsApp features)

---

**Architecture designed for:** Serverless, Scalable, Real-time 💎
