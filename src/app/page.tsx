import ProductCatalog from '@/components/ProductCatalog';
import { Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default async function Home() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Jewelry & More</h1>
                <p className="text-slate-600 text-sm mt-1">Premium Collection</p>
              </div>
              <a
                href="/admin/login"
                className="hidden text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Admin
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-2">
          <ProductCatalog initialProducts={products} />
        </main>
      </div>
    );
  } catch (err) {
    console.error('Error loading products on server:', err);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Jewelry & More</h1>
                <p className="text-slate-600 text-sm mt-1">Premium Collection</p>
              </div>
              <a
                href="/admin/login"
                className="hidden text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Admin
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-2">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Failed to load products</p>
          </div>
        </main>
      </div>
    );
  }
}
