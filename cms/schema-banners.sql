-- CP B&F CMS — Banner Management schema
-- รันหลัง schema.sql (ต้องมี extension pgcrypto + function set_updated_at() อยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว

create table if not exists banners (
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
  updated_at timestamptz not null default now()
);

create index if not exists banners_section_idx on banners (section, sort_order);

drop trigger if exists banners_set_updated_at on banners;
create trigger banners_set_updated_at
  before update on banners
  for each row
  execute function set_updated_at();

-- บังคับสูงสุด 5 แบนเนอร์ต่อ section (กันเกินโควตาแม้จะมีคนเลี่ยง UI ยิง insert ตรงๆ)
create or replace function check_banner_limit()
returns trigger as $$
begin
  if (select count(*) from banners where section = new.section) >= 5 then
    raise exception 'เกินโควตาแบนเนอร์สูงสุด 5 รายการต่อ section (%)', new.section;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists banners_check_limit on banners;
create trigger banners_check_limit
  before insert on banners
  for each row
  execute function check_banner_limit();

alter table banners enable row level security;

drop policy if exists "public can read banners" on banners;
create policy "public can read banners"
  on banners for select
  using (true);

drop policy if exists "authenticated can insert banners" on banners;
create policy "authenticated can insert banners"
  on banners for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update banners" on banners;
create policy "authenticated can update banners"
  on banners for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete banners" on banners;
create policy "authenticated can delete banners"
  on banners for delete
  to authenticated
  using (true);

-- ข้อมูลเริ่มต้น: 2 สไลด์ hero banner จริงที่ index.html ใช้อยู่ตอนนี้ + ตัวอย่าง KV banner จาก markup ที่เคย comment ไว้
insert into banners (section, image_th, image_en, title_th, title_en, description_th, description_en, button_text, link_url, sort_order) values
  ('hero',
   'raw/assets/image/Fuji_Water_1440x600.png', 'raw/assets/image/Fuji_Water_1440x600.png',
   'Fuji Water น้ำพรีเมียม จากแหล่งน้ำที่ดีที่สุดสำหรับคุณ', 'Fuji Water — Premium Water from the Finest Source for You',
   'สินค้าพรีเมียม', 'Premium Product',
   'ค้นหาพวกเรา', 'products.html', 0),
  ('hero',
   'raw/assets/image/OEM_Water.png', 'raw/assets/image/OEM_Water.png',
   'รับผลิต OEM น้ำดื่มบรรจุขวด ออกแบบแบรนด์ของคุณเอง', 'OEM bottled water manufacturing — design your own brand',
   'สินค้าพรีเมียม', 'Premium Product',
   'ค้นหาพวกเรา', 'products.html', 1),
  ('kv',
   'raw/assets/image/kv-banner-bottling.jpg', 'raw/assets/image/kv-banner-bottling.jpg',
   'LET''S CONNECT', 'LET''S CONNECT',
   '', '',
   'Reach Out', 'contact.html', 0)
on conflict do nothing;
