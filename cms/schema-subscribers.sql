-- CP B&F CMS — Subscribers (footer newsletter signup) schema
-- รันหลัง schema.sql (ต้องมี extension pgcrypto อยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx on subscribers (created_at desc);

alter table subscribers enable row level security;

-- ฟอร์ม subscribe ที่ footer เป็นสาธารณะ (ไม่ login) ต้อง insert ได้ แต่ห้ามอ่าน/แก้/ลบ
drop policy if exists "public can insert subscribers" on subscribers;
create policy "public can insert subscribers"
  on subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated can read subscribers" on subscribers;
create policy "authenticated can read subscribers"
  on subscribers for select
  to authenticated
  using (true);

drop policy if exists "authenticated can delete subscribers" on subscribers;
create policy "authenticated can delete subscribers"
  on subscribers for delete
  to authenticated
  using (true);
