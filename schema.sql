-- QR SİPARİŞ V1 - SUPABASE ŞEMASI

create extension if not exists pgcrypto;

create table if not exists restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Demo Cafe',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null default 'Diğer',
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  status text not null default 'new' check (status in ('new','preparing','ready','completed')),
  total numeric(10,2) not null default 0,
  customer_note text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  note text
);

alter table restaurant_settings enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Müşteri menüyü okuyabilir.
create policy "public read restaurant settings"
on restaurant_settings for select using (true);

create policy "public read active products"
on products for select using (is_active = true);

-- Müşteri sipariş oluşturabilir ve sipariş ürünlerini ekleyebilir.
create policy "public create orders"
on orders for insert to anon, authenticated
with check (
  char_length(table_number) between 1 and 20
  and status = 'new'
  and total >= 0
);

create policy "public create order items"
on order_items for insert to anon, authenticated
with check (
  quantity > 0
  and unit_price >= 0
  and exists (select 1 from orders o where o.id = order_id)
);

-- Admin/garson giriş yaptıktan sonra siparişleri okuyup güncelleyebilir.
create policy "authenticated read orders"
on orders for select to authenticated using (true);

create policy "authenticated update orders"
on orders for update to authenticated using (true) with check (true);

create policy "authenticated read order items"
on order_items for select to authenticated using (true);

-- Realtime
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;

-- Demo veri
insert into restaurant_settings (name)
select 'Demo Cafe'
where not exists (select 1 from restaurant_settings);

insert into products (name,description,price,category,sort_order)
select * from (values
('Klasik Burger','Dana köfte, cheddar, marul, domates',320,'Burgerler',1),
('Cheeseburger','Dana köfte, çift cheddar, turşu',350,'Burgerler',2),
('Patates','Çıtır patates',120,'Yan Ürünler',3),
('Cola','330 ml',70,'İçecekler',4),
('Su','500 ml',35,'İçecekler',5)
) as v(name,description,price,category,sort_order)
where not exists (select 1 from products);
