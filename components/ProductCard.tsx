'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export type Product = {
  id: string;
  name: string;
  price: number; // paise
  image_url: string | null;
  stock: number;
  category: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const outOfStock = product.stock <= 0;
  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2">
      <Link href={`/product/?id=${product.id}`} className="block">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded" />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">No image</div>
        )}
      </Link>
      <div className="flex-1">
        <Link href={`/product/?id=${product.id}`} className="font-medium text-sm line-clamp-2">{product.name}</Link>
        <div className="text-xs text-gray-500">{product.category}</div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold">₹{(product.price / 100).toFixed(2)}</span>
        <button
          disabled={outOfStock}
          onClick={() => add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
          className="text-xs px-3 py-1.5 rounded bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Out of stock' : 'Add'}
        </button>
      </div>
    </div>
  );
}
