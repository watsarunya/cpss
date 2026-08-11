-- CP B&F CMS — Product Management schema (categories + products)
-- รันหลัง schema.sql (ต้องมี extension pgcrypto + function set_updated_at() อยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว

create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null default '',
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_categories_sort_order_idx on product_categories (sort_order);

drop trigger if exists product_categories_set_updated_at on product_categories;
create trigger product_categories_set_updated_at
  before update on product_categories
  for each row
  execute function set_updated_at();

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_categories(id) on delete set null,
  name_th text not null,
  name_en text not null default '',
  sku text default '',
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  image text default '',
  description_th text default '',
  description_en text default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_sort_order_idx on products (sort_order);

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- RLS: อ่านได้แบบสาธารณะ (หน้าเว็บหลักต้องดึงสินค้า/หมวดหมู่ไปแสดง) แก้ไข/เพิ่ม/ลบได้เฉพาะ login แล้วเท่านั้น

alter table product_categories enable row level security;

drop policy if exists "public can read product_categories" on product_categories;
create policy "public can read product_categories"
  on product_categories for select
  using (true);

drop policy if exists "authenticated can insert product_categories" on product_categories;
create policy "authenticated can insert product_categories"
  on product_categories for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update product_categories" on product_categories;
create policy "authenticated can update product_categories"
  on product_categories for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete product_categories" on product_categories;
create policy "authenticated can delete product_categories"
  on product_categories for delete
  to authenticated
  using (true);

alter table products enable row level security;

drop policy if exists "public can read products" on products;
create policy "public can read products"
  on products for select
  using (true);

drop policy if exists "authenticated can insert products" on products;
create policy "authenticated can insert products"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update products" on products;
create policy "authenticated can update products"
  on products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete products" on products;
create policy "authenticated can delete products"
  on products for delete
  to authenticated
  using (true);

-- ข้อมูลเริ่มต้น: 5 หมวดหมู่เดิมที่เมนู "สินค้า" (submenu) และ products.html?category=... ใช้อยู่แล้ว
-- (คง slug เดิมไว้เป๊ะๆ กันลิงก์เมนู/URL เดิมทั้งเว็บพัง)
insert into product_categories (name_th, name_en, slug, sort_order) values
  ('เมล็ดกาแฟ', 'Coffee Beans', 'coffee-beans', 1),
  ('อุปกรณ์ร้านกาแฟ', 'Coffee Shop Equipment', 'coffee-equipment', 2),
  ('วัตถุดิบสำหรับเครื่องดื่ม', 'Beverage Ingredients', 'beverage-ingredients', 3),
  ('เครื่องดื่มพร้อมดื่ม (RTD)', 'Ready-to-Drink (RTD)', 'rtd', 4),
  ('น้ำดื่มพรีเมียม ฟูจิ', 'Fuji Premium Water', 'fuji-water', 5)
on conflict (slug) do nothing;

-- ข้อมูลสินค้าเริ่มต้น: ย้ายจากของเดิมที่ hardcode ไว้ใน products.html/online_shop.html/product-detail.html
insert into products (category_id, name_th, name_en, sku, price, stock, image, description_th, sort_order) values
  ((select id from product_categories where slug = 'coffee-beans'),
   'House Blend 100% Pure Roasted Coffee', 'House Blend 100% Pure Roasted Coffee', 'CPBF-CB-103', 340, 50,
   'raw/assets/image/New Project3.png',
   'เมล็ดกาแฟคั่วแท้ 100% คัดสรรจากแหล่งปลูกคุณภาพ คั่วสดใหม่เพื่อรักษากลิ่นหอมและรสชาติที่กลมกล่อม เหมาะสำหรับร้านกาแฟ โรงแรม และธุรกิจที่ต้องการวัตถุดิบมาตรฐานสากล ให้รสสัมผัสที่คงที่ทุกแก้ว พร้อมส่งตรงถึงหน้าร้านของคุณ',
   1),
  ((select id from product_categories where slug = 'coffee-beans'),
   'ดอยช้าง Thai Specialty Roast', 'Doi Chang Thai Specialty Roast', 'CPBF-CB-104', 380, 40,
   'raw/assets/image/hero-business-02.png', '', 2),
  ((select id from product_categories where slug = 'coffee-beans'),
   'Brazil Cerrado Imported Beans', 'Brazil Cerrado Imported Beans', 'CPBF-CB-105', 420, 30,
   'raw/assets/image/New Project3.png', '', 3),
  ((select id from product_categories where slug = 'coffee-equipment'),
   'เครื่องชงกาแฟเอสเพรสโซ่ Pro', 'Espresso Machine Pro', 'CPBF-EQ-201', 18500, 5,
   'raw/assets/image/cozy-coffee-shop-interior.jpg', '', 4),
  ((select id from product_categories where slug = 'coffee-equipment'),
   'เครื่องบดกาแฟมือหมุน', 'Manual Coffee Grinder', 'CPBF-EQ-202', 990, 20,
   'raw/assets/image/cozy-coffee-shop-interior.jpg', '', 5),
  ((select id from product_categories where slug = 'beverage-ingredients'),
   'CP B&F Beverage Creamer', 'CP B&F Beverage Creamer', 'CPBF-BI-301', 130, 60,
   'raw/assets/image/New Project1.png', '', 6),
  ((select id from product_categories where slug = 'beverage-ingredients'),
   'Instant Konjac Jelly', 'Instant Konjac Jelly', 'CPBF-BI-302', 330, 45,
   'raw/assets/image/New Project.png', '', 7),
  ((select id from product_categories where slug = 'beverage-ingredients'),
   'ชาเขียวมัทฉะผงคุณภาพพรีเมียม', 'Premium Matcha Green Tea Powder', 'CPBF-BI-303', 280, 35,
   'raw/assets/image/2148155123.jpg', '', 8),
  ((select id from product_categories where slug = 'beverage-ingredients'),
   'ผงโกโก้แท้ 100%', '100% Pure Cocoa Powder', 'CPBF-BI-304', 250, 40,
   'raw/assets/image/2148155123.jpg', '', 9),
  ((select id from product_categories where slug = 'beverage-ingredients'),
   'Coffee Flower Honey', 'Coffee Flower Honey', 'CPBF-BI-305', 160, 25,
   'raw/assets/image/New Project2.png', '', 10),
  ((select id from product_categories where slug = 'rtd'),
   'LUMi Sparkling Coffee รสทับทิม', 'LUMi Sparkling Coffee (Pomegranate)', 'CPBF-RTD-401', 129, 100,
   'raw/assets/image/New Project1.png', '', 11),
  ((select id from product_categories where slug = 'fuji-water'),
   'Fuji Premium Water 600ml', 'Fuji Premium Water 600ml', 'CPBF-FW-501', 15, 500,
   'raw/assets/image/download.jpeg', '', 12)
on conflict do nothing;
