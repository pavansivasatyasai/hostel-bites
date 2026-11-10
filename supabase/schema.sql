-- Run this in Supabase SQL editor

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price int not null,            -- paise
  image_url text,
  stock int not null default 0,
  category text,
  created_at timestamptz default now()
);

-- Orders (guest checkout)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  room_no text not null,
  total int not null,
  status text not null default 'placed',  -- placed / packed / delivered
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  qty int not null,
  price int not null
);

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Anyone can read products
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);

-- Anyone can insert orders (guest checkout)
drop policy if exists "insert orders" on public.orders;
create policy "insert orders" on public.orders for insert with check (true);

drop policy if exists "insert order_items" on public.order_items;
create policy "insert order_items" on public.order_items for insert with check (true);

-- Only authenticated (admin) users can read/update orders
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders for select using (auth.role() = 'authenticated');

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (auth.role() = 'authenticated');

drop policy if exists "admin read order_items" on public.order_items;
create policy "admin read order_items" on public.order_items for select using (auth.role() = 'authenticated');

-- Storage bucket for product images (create via dashboard or SQL)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
