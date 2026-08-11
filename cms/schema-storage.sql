-- CP B&F CMS — Storage bucket สำหรับอัปโหลดรูปภาพ (Menu icon/image, Banner image TH/EN)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว ปลอดภัย รันซ้ำได้ (idempotent)

insert into storage.buckets (id, name, public)
values ('cms-uploads', 'cms-uploads', true)
on conflict (id) do nothing;

-- อ่านไฟล์ได้แบบสาธารณะ (เว็บหลักต้องโหลดรูปไปแสดง) แต่อัปโหลด/ลบได้เฉพาะผู้ที่ login แล้วเท่านั้น
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
