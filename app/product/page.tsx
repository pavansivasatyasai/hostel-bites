'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import type { Product } from '@/components/ProductCard';

function ProductView() {
  const params = useSearchParams();
  const id = params.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const supabase = createClient();
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      setProduct(data as Product);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!product) return <p className="text-gray-500">Product not found.</p>;

  return (
    <div className="max-w-md mx-auto">
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
      )}
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-500 text-sm mb-2">{product.category}</p>
      <p className="text-xl font-bold mb-4">₹{(product.price / 100).toFixed(2)}</p>
      <p className="text-sm mb-4">Stock: {product.stock}</p>
      <button
        disabled={product.stock <= 0}
        onClick={() => add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
        className="w-full py-2 rounded bg-green-600 text-white disabled:bg-gray-300"
      >
        {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
      <ProductView />
    </Suspense>
  );
}
