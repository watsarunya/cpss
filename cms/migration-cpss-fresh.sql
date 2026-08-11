-- ============================================================================
-- CPSS — fresh schema bundle for a NEW, separated Supabase project
-- (project: jimgurxijwgnrtvoqidx — confirmed separate from the old cpbf.co.th project)
--
-- วิธีใช้: เปิด Supabase Dashboard ของ project ใหม่ > SQL Editor > New query
-- วางไฟล์นี้ทั้งหมด > Run (ครั้งเดียว)
--
-- ไฟล์นี้รวม cms/schema*.sql ทุกไฟล์ (v2-v9 ทั้งหมด) เข้าเป็นไฟล์เดียว โดย:
--   1) ตัด "ข้อมูลตัวอย่าง" (insert seed) ของ CP B&F เดิมออกทั้งหมด (เมนู/แบนเนอร์/สินค้า/ข่าว/16 หน้าเนื้อหา
--      ของ B&F) เพราะเป็นคนละแบรนด์ คนละเนื้อหา ไม่เกี่ยวกับ CPSS เลย — ให้สร้างเมนู/เนื้อหาจริงของ CPSS เอง
--      ผ่านหน้า CMS แทน (จัดการเมนู/จัดการแบนเนอร์/รายการเพจ ฯลฯ)
--   2) ใส่ DROP TABLE ก่อนสร้างใหม่ทุกตาราง เพราะ project นี้เคยมีตารางชื่อเดียวกันอยู่ก่อนแล้ว
--      (menu_items/banners/pages/page_sections/news_categories/news_articles) แต่เป็นคนละ schema
--      (คอลัมน์ไม่ตรงกับที่โค้ดเว็บนี้ต้องการ เช่น menu_items.name_th ไม่มีอยู่จริง) — ยืนยันกับผู้ใช้แล้วว่า
--      ข้อมูลเดิมใน project นี้ไม่สำคัญ ล้างทิ้งได้
--   3) เก็บ 1 แถวเดียวไว้ใน pages (page_key='index') กัน index.html redirect ไป 404 ทันที
--      (page-render.js's init() จะ redirect ไป 404.html ถ้าหา page_key='index' ไม่เจอ)
--
-- ⚠️ รันได้ครั้งเดียวเท่านั้นแบบปลอดภัย — ถ้ารันซ้ำ DROP TABLE จะลบข้อมูลที่สร้างผ่าน CMS ไปแล้วทิ้งด้วย
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 0) ล้างตารางเดิมที่ schema ไม่ตรงกับโค้ดเว็บนี้ทิ้งก่อน (ยืนยันกับผู้ใช้แล้วว่าไม่สำคัญ)
-- ----------------------------------------------------------------------------
drop table if exists page_sections cascade;
drop table if exists pages cascade;
drop table if exists news_articles cascade;
drop table if exists news_categories cascade;
drop table if exists products cascade;
drop table if exists product_categories cascade;
drop table if exists subscribers cascade;
drop table if exists banners cascade;
drop table if exists menu_items cascade;

-- ----------------------------------------------------------------------------
-- 1) menu_items (cms/schema.sql — ไม่รวม seed เมนู B&F เดิม)
-- ----------------------------------------------------------------------------
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references menu_items(id) on delete cascade,
  name_th text not null,
  name_en text not null,
  url text default '',
  icon text default '',
  image_url text default '',
  open_new_tab boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_parent_id_idx on menu_items (parent_id);
create index menu_items_sort_order_idx on menu_items (sort_order);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger menu_items_set_updated_at
  before update on menu_items
  for each row
  execute function set_updated_at();

alter table menu_items enable row level security;

create policy "public can read menu_items"
  on menu_items for select
  using (true);

create policy "authenticated can insert menu_items"
  on menu_items for insert
  to authenticated
  with check (true);

create policy "authenticated can update menu_items"
  on menu_items for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete menu_items"
  on menu_items for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 2) banners (schema-banners.sql + v2 + v3 + v4 — ไม่รวม seed แบนเนอร์ B&F เดิม)
-- ----------------------------------------------------------------------------
create table banners (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('hero', 'kv')),
  image_th text default '',
  image_en text default '',
  title_th text default '',
  title_en text default '',
  description_th text default '',
  description_en text default '',
  button_text text default '',
  link_url text default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  page_url text default '',
  text_align text not null default 'left' check (text_align in ('left', 'right', 'center'))
);

create index banners_section_idx on banners (section, sort_order);
create index banners_page_url_idx on banners (section, page_url, sort_order);

create trigger banners_set_updated_at
  before update on banners
  for each row
  execute function set_updated_at();

-- โควตาสูงสุด 5 แบนเนอร์ต่อหน้า (hero: ต่อ page_url, kv: ต่อ page_url เหมือนกันตาม v3)
create or replace function check_banner_limit()
returns trigger as $$
begin
  if (select count(*) from banners where section = new.section and page_url = new.page_url) >= 5 then
    raise exception 'เกินโควตาแบนเนอร์สูงสุด 5 รายการต่อหน้า (%)', new.page_url;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger banners_check_limit
  before insert on banners
  for each row
  execute function check_banner_limit();

alter table banners enable row level security;

create policy "public can read banners"
  on banners for select
  using (true);

create policy "authenticated can insert banners"
  on banners for insert
  to authenticated
  with check (true);

create policy "authenticated can update banners"
  on banners for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete banners"
  on banners for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3) storage bucket สำหรับรูปที่อัปโหลดผ่าน CMS (schema-storage.sql)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cms-uploads', 'cms-uploads', true)
on conflict (id) do nothing;

drop policy if exists "public can read cms-uploads" on storage.objects;
create policy "public can read cms-uploads"
  on storage.objects for select
  using (bucket_id = 'cms-uploads');

drop policy if exists "authenticated can upload to cms-uploads" on storage.objects;
create policy "authenticated can upload to cms-uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-uploads');

drop policy if exists "authenticated can update cms-uploads" on storage.objects;
create policy "authenticated can update cms-uploads"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-uploads')
  with check (bucket_id = 'cms-uploads');

drop policy if exists "authenticated can delete cms-uploads" on storage.objects;
create policy "authenticated can delete cms-uploads"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-uploads');

-- ----------------------------------------------------------------------------
-- 4) subscribers (schema-subscribers.sql) — เว็บ CPSS นี้ไม่มีฟอร์ม subscribe ใน footer แล้ว
--    แต่สร้างตารางไว้เผื่ออนาคต/เผื่อ subscribe.js ยังถูกเรียกใช้อยู่ที่หน้าอื่น ไม่กระทบอะไรถ้าไม่ได้ใช้
-- ----------------------------------------------------------------------------
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index subscribers_created_at_idx on subscribers (created_at desc);

alter table subscribers enable row level security;

create policy "public can insert subscribers"
  on subscribers for insert
  to anon, authenticated
  with check (true);

create policy "authenticated can read subscribers"
  on subscribers for select
  to authenticated
  using (true);

create policy "authenticated can delete subscribers"
  on subscribers for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 5) product_categories + products (schema-products.sql + v2 — ไม่รวม seed สินค้า B&F เดิม)
--    เก็บไว้เผื่อ CPSS ขายอะไหล่ผ่าน CMS ในอนาคต — โปรเจกต์นี้ไม่มี cart/checkout ตามที่ตกลงกันไว้
-- ----------------------------------------------------------------------------
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null default '',
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_categories_sort_order_idx on product_categories (sort_order);

create trigger product_categories_set_updated_at
  before update on product_categories
  for each row
  execute function set_updated_at();

create table products (
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
  updated_at timestamptz not null default now(),
  images text[] not null default '{}'
);

create index products_category_id_idx on products (category_id);
create index products_sort_order_idx on products (sort_order);

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

alter table product_categories enable row level security;

create policy "public can read product_categories"
  on product_categories for select
  using (true);

create policy "authenticated can insert product_categories"
  on product_categories for insert
  to authenticated
  with check (true);

create policy "authenticated can update product_categories"
  on product_categories for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete product_categories"
  on product_categories for delete
  to authenticated
  using (true);

alter table products enable row level security;

create policy "public can read products"
  on products for select
  using (true);

create policy "authenticated can insert products"
  on products for insert
  to authenticated
  with check (true);

create policy "authenticated can update products"
  on products for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete products"
  on products for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 6) news_categories + news_articles (schema-news.sql — ไม่รวม seed ข่าว B&F เดิม)
-- ----------------------------------------------------------------------------
create table news_categories (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null default '',
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_categories_sort_order_idx on news_categories (sort_order);

create trigger news_categories_set_updated_at
  before update on news_categories
  for each row
  execute function set_updated_at();

create table news_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references news_categories(id) on delete set null,
  title_th text not null,
  title_en text not null default '',
  image text default '',
  excerpt_th text not null default '',
  excerpt_en text default '',
  content_th text not null default '',
  content_en text default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_articles_category_id_idx on news_articles (category_id);
create index news_articles_created_at_idx on news_articles (created_at desc);

create trigger news_articles_set_updated_at
  before update on news_articles
  for each row
  execute function set_updated_at();

alter table news_categories enable row level security;

create policy "public can read news_categories"
  on news_categories for select
  using (true);

create policy "authenticated can insert news_categories"
  on news_categories for insert
  to authenticated
  with check (true);

create policy "authenticated can update news_categories"
  on news_categories for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete news_categories"
  on news_categories for delete
  to authenticated
  using (true);

alter table news_articles enable row level security;

create policy "public can read news_articles"
  on news_articles for select
  using (true);

create policy "authenticated can insert news_articles"
  on news_articles for insert
  to authenticated
  with check (true);

create policy "authenticated can update news_articles"
  on news_articles for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete news_articles"
  on news_articles for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 7) pages + page_sections (schema-pages.sql + v2..v9 รวมกันเป็นเวอร์ชันล่าสุดเดียว)
--    ไม่รวม seed 16 หน้าเนื้อหาของ B&F เดิม — ใส่แค่แถวเดียว page_key='index' กัน index.html
--    ถูก page-render.js redirect ไปหน้า 404 ทันทีตอนเปิดเว็บครั้งแรก (ดูหมายเหตุท้ายไฟล์)
-- ----------------------------------------------------------------------------
create table pages (
  id uuid primary key default gen_random_uuid(),
  page_key text unique,
  slug text not null unique,
  menu_item_id uuid references menu_items(id) on delete set null,
  title_th text not null,
  title_en text not null default '',
  is_standalone boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pages_page_key_idx on pages (page_key);
create index pages_slug_idx on pages (slug);
create index pages_menu_item_id_idx on pages (menu_item_id);

create trigger pages_set_updated_at
  before update on pages
  for each row
  execute function set_updated_at();

create table page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  anchor_id text not null default '',
  layout text not null default 'image-left'
    check (layout in ('image-left', 'image-right', 'image-top', 'image-bottom', 'custom-html')),
  images text[] not null default '{}'
    check (array_length(images, 1) is null or array_length(images, 1) <= 4),
  heading_th text default '',
  heading_en text default '',
  heading_align text not null default 'left'
    check (heading_align in ('left', 'center', 'right')),
  body_th text default '',
  body_en text default '',
  button_text_th text default '',
  button_text_en text default '',
  button_link text default '',
  button_link_en text default '',
  button_style text not null default 'text-link'
    check (button_style in ('text-link', 'primary', 'primary-outline')),
  button_color text not null default '',
  image_links text[] not null default '{}',
  bg_image text default '',
  bg_opacity integer not null default 100 check (bg_opacity between 0 and 100),
  bg_grayscale integer not null default 0 check (bg_grayscale between 0 and 100),
  images_grayscale boolean not null default true,
  bg_type text not null default 'image' check (bg_type in ('image', 'color', 'gradient')),
  bg_color text default '',
  bg_gradient_from text default '',
  bg_gradient_to text default '',
  bg_gradient_direction text not null default 'to bottom'
    check (bg_gradient_direction in ('to bottom', 'to left')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index page_sections_page_id_idx on page_sections (page_id);
create index page_sections_sort_order_idx on page_sections (sort_order);

create trigger page_sections_set_updated_at
  before update on page_sections
  for each row
  execute function set_updated_at();

alter table pages enable row level security;

create policy "public can read pages"
  on pages for select
  using (true);

create policy "authenticated can insert pages"
  on pages for insert
  to authenticated
  with check (true);

create policy "authenticated can update pages"
  on pages for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete pages"
  on pages for delete
  to authenticated
  using (true);

alter table page_sections enable row level security;

create policy "public can read page_sections"
  on page_sections for select
  using (true);

create policy "authenticated can insert page_sections"
  on page_sections for insert
  to authenticated
  with check (true);

create policy "authenticated can update page_sections"
  on page_sections for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete page_sections"
  on page_sections for delete
  to authenticated
  using (true);

-- เพจ "หน้าแรก" เปล่าๆ 1 แถว — จำเป็นต้องมีแถวนี้ ไม่งั้น page-render.js's init() จะหา
-- page_key='index' ไม่เจอแล้ว redirect index.html ไปหน้า 404 ทันทีตั้งแต่เปิดเว็บครั้งแรก
insert into pages (page_key, slug, title_th, title_en, is_standalone) values
  ('index', 'index', 'หน้าแรก', 'Homepage', false)
on conflict (page_key) do nothing;

-- ============================================================================
-- เสร็จแล้ว — ขั้นตอนถัดไป (ทำผ่าน cms/index.html หลัง deploy เท่านั้น เพราะต้อง login ก่อน RLS ถึงจะให้เขียนได้):
--   1) สร้างบัญชีแอดมิน CMS คนแรกด้วยมือผ่าน Supabase Dashboard > Authentication > Users > Add user
--      (ใส่ email + password เอง, ติ๊ก "Auto Confirm User") — หลังจากนั้นค่อยใช้ cms/admins.html
--      (ต้อง deploy Edge Function manage-admins ก่อน) สร้างแอดมินคนถัดไปได้จากใน CMS เอง
--   2) เข้า cms/index.html (จัดการเมนู) สร้างเมนู CPSS จริง (เกี่ยวกับเรา/ธุรกิจของเรา/บริการทั้งหมด/
--      ศูนย์บริการช่าง ตามที่ตกลงกันไว้)
--   3) เข้า cms/pages.html สร้างเพจ/section ของหน้าแรกและหน้าอื่นๆ ตามจริง
-- ============================================================================
