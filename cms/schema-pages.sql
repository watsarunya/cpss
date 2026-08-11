-- CP B&F CMS — Page Management schema (pages + page_sections)
-- รันหลัง schema.sql (ต้องมี extension pgcrypto + function set_updated_at() อยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว

create table if not exists pages (
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

create index if not exists pages_page_key_idx on pages (page_key);
create index if not exists pages_slug_idx on pages (slug);
create index if not exists pages_menu_item_id_idx on pages (menu_item_id);

drop trigger if exists pages_set_updated_at on pages;
create trigger pages_set_updated_at
  before update on pages
  for each row
  execute function set_updated_at();

create table if not exists page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  anchor_id text not null default '',
  layout text not null default 'image-left'
    check (layout in ('image-left', 'image-right', 'image-top', 'image-bottom')),
  images text[] not null default '{}'
    check (array_length(images, 1) is null or array_length(images, 1) <= 4),
  heading_th text default '',
  heading_en text default '',
  body_th text default '',
  body_en text default '',
  button_text_th text default '',
  button_text_en text default '',
  button_link text default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_sections_page_id_idx on page_sections (page_id);
create index if not exists page_sections_sort_order_idx on page_sections (sort_order);

drop trigger if exists page_sections_set_updated_at on page_sections;
create trigger page_sections_set_updated_at
  before update on page_sections
  for each row
  execute function set_updated_at();

-- RLS: อ่านได้แบบสาธารณะ (หน้าเว็บหลักต้องดึงเพจ/section ไปแสดง) แก้ไข/เพิ่ม/ลบได้เฉพาะ login แล้วเท่านั้น

alter table pages enable row level security;

drop policy if exists "public can read pages" on pages;
create policy "public can read pages"
  on pages for select
  using (true);

drop policy if exists "authenticated can insert pages" on pages;
create policy "authenticated can insert pages"
  on pages for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update pages" on pages;
create policy "authenticated can update pages"
  on pages for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete pages" on pages;
create policy "authenticated can delete pages"
  on pages for delete
  to authenticated
  using (true);

alter table page_sections enable row level security;

drop policy if exists "public can read page_sections" on page_sections;
create policy "public can read page_sections"
  on page_sections for select
  using (true);

drop policy if exists "authenticated can insert page_sections" on page_sections;
create policy "authenticated can insert page_sections"
  on page_sections for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update page_sections" on page_sections;
create policy "authenticated can update page_sections"
  on page_sections for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete page_sections" on page_sections;
create policy "authenticated can delete page_sections"
  on page_sections for delete
  to authenticated
  using (true);

-- ข้อมูลเริ่มต้น: 16 หน้าเนื้อหาที่ผูกกับเมนูหลัก/เมนูย่อยจริงตอนนี้ (แทนที่เนื้อหาทั้งหน้า)
-- + index/online_shop (เพิ่ม section เสริมแบบ additive เท่านั้น ไม่แทนที่ของเดิม)
-- menu_item_id อ้างจาก UUID จริงใน Supabase ณ วันที่เขียน migration นี้ (ตรวจสอบแล้วผ่าน REST API)
-- ทุกเพจเริ่มต้นไม่มี page_sections ใดๆ (ค่าว่าง) — ดูหมายเหตุใน CLAUDE.md เรื่องการย้ายเนื้อหาเดิม
insert into pages (page_key, slug, menu_item_id, title_th, title_en, is_standalone) values
  ('our_story', 'our_story', 'bf185c91-fbe9-4579-8124-5142c3c98d03', 'เกี่ยวกับเรา', 'Our Story', false),
  ('our_service', 'our_service', '73e0bc6a-7786-4aa1-a13a-0013c80837ae', 'บริการของเรา', 'Our Service', false),
  ('beans_ingredients', 'beans_ingredients', '79f18511-eec0-45d1-9ab6-f20affa2dff2', 'เมล็ดกาแฟและวัตถุดิบ', 'Coffee Beans & Ingredients', false),
  ('coffee_shop_equipment', 'coffee_shop_equipment', 'bab9c40c-dc4f-48c8-aeb3-0c7356133fda', 'อุปกรณ์ร้านกาแฟ', 'Coffee Shop Equipment', false),
  ('beverage_ingredients', 'beverage_ingredients', 'bc8ba3ca-56f0-4d79-af8f-539b0ecd18c0', 'วัตถุดิบสำหรับเครื่องดื่ม', 'Beverage Ingredients', false),
  ('lumi', 'lumi', '0cea878c-12cf-4d4d-8642-fd0fccd6fdaa', 'LUMi', 'LUMi', false),
  ('fuji_premium_water', 'fuji_premium_water', 'e9ef6576-499a-4ee9-82f3-38076950abc8', 'น้ำดื่มพรีเมียม ฟูจิ', 'Fuji Premium Water', false),
  ('oem_water', 'oem_water', 'bcd9dbff-5a43-4687-999a-e16520368e87', 'น้ำดื่ม OEM', 'OEM Water', false),
  ('oem_beans', 'oem_beans', 'aac9371f-b278-4ae1-a498-b931686c0e0c', 'เมล็ดกาแฟ OEM', 'OEM Coffee Beans', false),
  ('catering', 'catering', '70bd7148-33a5-406c-9c49-70c8afd29477', 'ธุรกิจ Catering', 'Catering', false),
  ('snack_box', 'snack_box', 'a92622cb-71f1-4aeb-a148-86b8e780fe12', 'ชุดของว่าง', 'Snack Box', false),
  ('coffee_shop', 'coffee_shop', 'a2dc346f-0829-4454-9bf6-821b11cc4660', 'ธุรกิจกาแฟ', 'Coffee Shop', false),
  ('fix_repair', 'fix_repair', '0366294c-6d5f-42ac-b460-e5527201da65', 'บริการดูแลและซ่อมอุปกรณ์', 'Fix & Repair', false),
  ('vending', 'vending', null, 'ตู้จำหน่ายอัตโนมัติ', 'Vending', false),
  ('jungle', 'jungle', '8cd403e3-3299-41ab-bdad-1d10b9b78d97', 'Jungle', 'Jungle', false),
  ('arabitia', 'arabitia', '45d78377-a857-43fc-a724-67c2e4b1a7a2', 'Arabitia', 'Arabitia', false),
  ('index', 'index', null, 'หน้าแรก (ส่วนเสริม)', 'Home (extra sections)', false),
  ('online_shop', 'online_shop', '6ab51f6c-e4a9-4a00-81b1-3b9199f33a03', 'ช้อปออนไลน์ (ส่วนเสริม)', 'Online Shop (extra sections)', false)
on conflict (page_key) do nothing;
