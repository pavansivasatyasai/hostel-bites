'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function Cart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/" className="text-green-600 underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="border rounded p-3 flex items-center gap-3">
            {i.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.image_url} alt={i.name} className="w-12 h-12 object-cover rounded" />
            )}
            <div className="flex-1">
              <div className="font-medium text-sm">{i.name}</div>
              <div className="text-xs text-gray-500">₹{(i.price / 100).toFixed(2)} each</div>
            </div>
            <input
              type="number"
              min={0}
              value={i.qty}
              onChange={(e) => setQty(i.id, Number(e.target.value))}
              className="w-14 border rounded px-2 py-1 text-sm"
            />
            <button onClick={() => remove(i.id)} className="text-red-500 text-sm">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="font-bold">Total: ₹{(total / 100).toFixed(2)}</span>
        <div className="flex gap-2">
          <button onClick={clear} className="px-3 py-2 text-sm border rounded">Clear</button>
          <Link href="/checkout/" className="px-4 py-2 text-sm bg-green-600 text-white rounded">Checkout</Link>
        </div>
      </div>
    </div>
  );
}
