'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  room_no: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { qty: number; price: number; products: { name: string } | null }[];
};

export default function Admin() {
  const [supabase, setSupabase] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [err, setErr] = useState('');

  useEffect(() => {
    const c = createClient();
    setSupabase(c);
    c.auth.getSession().then(({ data }: any) => setSession(data.session));
    const { data: sub } = c.auth.onAuthStateChange((_e: any, s: any) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadOrders() {
    if (!supabase) return;
    let q = supabase.from('orders').select('*, order_items(qty, price, products(name))').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders((data as any) ?? []);
  }

  useEffect(() => { if (session && supabase) loadOrders(); }, [session, filter, supabase]); // eslint-disable-line

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  }

  async function logout() { if (supabase) await supabase.auth.signOut(); }

  async function markStatus(id: string, status: string) {
    if (!supabase) return;
    await supabase.from('orders').update({ status }).eq('id', id);
    loadOrders();
  }

  if (!session) {
    return (
      <div className="max-w-sm mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={login} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border rounded px-3 py-2 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2 text-sm" />
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button className="w-full py-2 rounded bg-green-600 text-white">Login</button>
        </form>
        <p className="text-xs text-gray-400 mt-4">Create your admin user in Supabase Auth dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="placed">Placed</option>
            <option value="packed">Packed</option>
            <option value="delivered">Delivered</option>
          </select>
          <button onClick={logout} className="text-sm text-gray-500 underline">Logout</button>
        </div>
      </div>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold">{o.customer_name}</span>
                <span className="text-gray-500 text-sm ml-2">{o.phone} · Room {o.room_no}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{o.status}</span>
            </div>
            <ul className="text-sm text-gray-600 mb-2">
              {o.order_items.map((it, idx) => (
                <li key={idx}>{it.products?.name ?? 'Product'} × {it.qty}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className="font-bold">₹{(o.total / 100).toFixed(2)}</span>
              <div className="flex gap-2">
                {o.status === 'placed' && (
                  <button onClick={() => markStatus(o.id, 'packed')} className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white">Mark Packed</button>
                )}
                {o.status === 'packed' && (
                  <button onClick={() => markStatus(o.id, 'delivered')} className="text-xs px-3 py-1.5 rounded bg-green-600 text-white">Mark Delivered</button>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">{new Date(o.created_at).toLocaleString()}</div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500">No orders.</p>}
      </div>
    </div>
  );
}
