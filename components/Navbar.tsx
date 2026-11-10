'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function Navbar() {
  const count = useCart((s) => s.count());
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-green-600">Hostel Bites</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cart" className="relative">
            Cart
            {count > 0 && (
              <span className="ml-1 inline-block bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </Link>
          <Link href="/admin" className="text-gray-500">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
