-- Run once in Supabase Dashboard > SQL Editor.
create table if not exists public.items (
  id text primary key, name text not null, price integer not null check(price > 0),
  stock integer not null default 0 check(stock >= 0), emoji text not null default '🍪', image_url text
);
create table if not exists public.orders (
  id bigint generated always as identity primary key, created_at timestamptz not null default now(),
  customer_name text not null, customer_phone text not null, room text not null,
  notes text not null default '', lines jsonb not null, total integer not null check(total >= 0),
  status text not null default 'New' check(status in ('New','Preparing','Ready','Delivered','Cancelled'))
);
alter table public.items add column if not exists image_url text;\nalter table public.items enable row level security;
alter table public.orders enable row level security;
create policy "Anyone can view menu" on public.items for select using (true);
create policy "Signed-in owner manages menu" on public.items for all to authenticated using (true) with check (true);
create policy "Anyone can place an order" on public.orders for insert with check (true);
create policy "Signed-in owner views and updates orders" on public.orders for select to authenticated using (true);
create policy "Signed-in owner updates order status" on public.orders for update to authenticated using (true) with check (true);
grant select on public.items to anon, authenticated;
grant insert, update, delete on public.items to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
insert into public.items(id,name,price,stock,emoji) values
('chips','Classic salted chips',20,12,'🥔'),('noodles','Instant noodles',30,10,'🍜'),('choco','Chocolate bar',25,8,'🍫'),('cookies','Choco chip cookies',35,7,'🍪'),('soda','Chilled soda',25,9,'🥤'),('munch','Masala snack mix',20,11,'🥨') on conflict(id) do nothing;
-- Atomic order placement: stock is checked and reduced in one database transaction.
create or replace function public.place_order(p_name text,p_phone text,p_room text,p_notes text,p_lines jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare line jsonb; itemrow public.items%rowtype; calc_total integer:=0; out_lines jsonb:='[]'::jsonb; new_id bigint;
begin
 if length(trim(p_name))=0 or length(trim(p_phone))=0 or length(trim(p_room))=0 then raise exception 'Name, phone and room are required'; end if;
 if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 then raise exception 'Choose at least one item'; end if;
 for line in select value from jsonb_array_elements(p_lines) loop
   select * into itemrow from public.items where id=line->>'id' for update;
   if not found then raise exception 'An item is no longer available'; end if;
   if (line->>'qty')::integer<1 or itemrow.stock<(line->>'qty')::integer then raise exception 'Not enough stock for %',itemrow.name; end if;
   update public.items set stock=stock-(line->>'qty')::integer where id=itemrow.id;
   calc_total:=calc_total+itemrow.price*(line->>'qty')::integer;
   out_lines:=out_lines||jsonb_build_array(jsonb_build_object('name',itemrow.name,'qty',(line->>'qty')::integer,'price',itemrow.price));
 end loop;
 insert into public.orders(customer_name,customer_phone,room,notes,lines,total) values(trim(p_name),trim(p_phone),trim(p_room),coalesce(p_notes,''),out_lines,calc_total) returning id into new_id;
 return jsonb_build_object('id',new_id,'total',calc_total,'lines',out_lines);
end; $$;
grant execute on function public.place_order(text,text,text,text,jsonb) to anon, authenticated;
