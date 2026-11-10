'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { createClient } from '@/lib/supabase';

declare global { interface Window { Razorpay: any } }

export default function Checkout() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  async function handlePay() {
    setError('');
    if (!name || !phone || !room) { setError('Please fill all fields.'); return; }
    if (items.length === 0) { setError('Cart is empty.'); return; }
    setLoading(true);
    try {
      // 1. Create Razorpay order via Edge Function
      const res = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const order = await res.json();
      if (!order.id) throw new Error(order.error || 'Failed to create order');

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Hostel Bites',
        description: 'Grocery delivery',
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify + record order via webhook-style Edge Function
          await fetch(`${supabaseUrl}/functions/v1/razorpay-webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer_name: name,
              phone,
              room_no: room,
              items: items.map((i) => ({ product_id: i.id, qty: i.qty, price: i.price })),
              total,
            }),
          });
          clear();
          router.push('/?ordered=1');
        },
        prefill: { name, contact: phone },
        theme: { color: '#16a34a' },
      });
      rzp.open();
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="space-y-3 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border rounded px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full border rounded px-3 py-2 text-sm" />
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room number (e.g. A-204)" className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div className="border rounded p-3 mb-4 text-sm">
        <div className="flex justify-between mb-1"><span>Items</span><span>{items.length}</span></div>
        <div className="flex justify-between font-bold"><span>Total</span><span>₹{(total / 100).toFixed(2)}</span></div>
      </div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading || items.length === 0}
        className="w-full py-2 rounded bg-green-600 text-white disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : `Pay ₹${(total / 100).toFixed(2)}`}
      </button>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Pay via UPI / card / netbanking. Cash on delivery available — contact admin.
      </p>
      {/* Razorpay checkout script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
