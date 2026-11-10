import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer_name, phone, room_no, items, total } = body;

    // Verify signature
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const expected = await hmacSha256(secret, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (expected !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: cors });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ customer_name, phone, room_no, total, status: 'placed' })
      .select()
      .single();
    if (orderErr) throw orderErr;

    // Insert items + decrement stock
    for (const it of items) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: it.product_id,
        qty: it.qty,
        price: it.price,
      });
      // best-effort stock decrement
      const { data: prod } = await supabase.from('products').select('stock').eq('id', it.product_id).single();
      if (prod) {
        await supabase.from('products').update({ stock: Math.max(0, prod.stock - it.qty) }).eq('id', it.product_id);
      }
    }

    // Notify Telegram
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (token && chatId) {
      const lines = [
        `🛒 New order`,
        `Customer: ${customer_name}`,
        `Phone: ${phone}`,
        `Room: ${room_no}`,
        `Total: ₹${(total / 100).toFixed(2)}`,
        '',
        ...items.map((it: any) => `- ${it.qty}x (₹${(it.price / 100).toFixed(2)})`),
      ];
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
      });
    }

    return new Response(JSON.stringify({ ok: true, order_id: order.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
