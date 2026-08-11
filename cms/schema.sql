-- CP B&F CMS — Menu Management schema
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > New query > วางไฟล์นี้ทั้งหมด > Run

create extension if not exists "pgcrypto";

create table if not exists menu_items (
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

create index if not exists menu_items_parent_id_idx on menu_items (parent_id);
create index if not exists menu_items_sort_order_idx on menu_items (sort_order);

-- อัปเดต updated_at อัตโนมัติทุกครั้งที่แก้ไข row
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists menu_items_set_updated_at on menu_items;
create trigger menu_items_set_updated_at
  before update on menu_items
  for each row
  execute function set_updated_at();

-- Row Level Security: อ่านได้แบบสาธารณะ (เว็บหลักต้องดึงเมนูไปแสดง)
-- แต่แก้ไข/เพิ่ม/ลบได้เฉพาะผู้ที่ login แล้วเท่านั้น (ผ่าน Supabase Auth)
alter table menu_items enable row level security;

drop policy if exists "public can read menu_items" on menu_items;
create policy "public can read menu_items"
  on menu_items for select
  using (true);

drop policy if exists "authenticated can insert menu_items" on menu_items;
create policy "authenticated can insert menu_items"
  on menu_items for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update menu_items" on menu_items;
create policy "authenticated can update menu_items"
  on menu_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete menu_items" on menu_items;
create policy "authenticated can delete menu_items"
  on menu_items for delete
  to authenticated
  using (true);

-- ข้อมูลตัวอย่างเริ่มต้น (ล้อจากเมนูจริงของเว็บ cpbf.co.th ตอนนี้) — ลบทิ้งได้ถ้าไม่ต้องการ
insert into menu_items (name_th, name_en, url, sort_order) values
  ('เรื่องราวของเรา', 'Our Story', 'about.html', 1),
  ('สินค้า', 'Products', 'products.html', 2),
  ('บริการเครื่องดื่มครบวงจร', 'Beverage as a Service', 'what-we-do.html', 3),
  ('คาเฟ่', 'Café', '#', 4),
  ('ข่าวสาร', 'Newsroom', 'newsroom.html', 5),
  ('ร่วมงานกับเรา', 'Careers', 'career.html', 6),
  ('ติดต่อเรา', 'Contact Us', 'contact.html', 7)
on conflict do nothing;
