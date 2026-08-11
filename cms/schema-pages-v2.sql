-- CP B&F CMS — Page Management schema v2
-- แก้ page_sections จาก image (เดี่ยว) เป็น images (หลายภาพ สูงสุด 4 รูป)
-- รันไฟล์นี้ถ้าเคยรัน schema-pages.sql เวอร์ชันแรกไปแล้ว (ตอนนั้นยังเป็นคอลัมน์ image เดี่ยว)
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists images text[] not null default '{}';

-- ย้ายข้อมูลเดิมจากคอลัมน์ image (ถ้ามี) เข้า images ก่อนลบทิ้ง
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'page_sections' and column_name = 'image'
  ) then
    update page_sections
      set images = array[image]
      where image is not null and image <> '' and (images is null or images = '{}');

    alter table page_sections drop column image;
  end if;
end $$;

alter table page_sections drop constraint if exists page_sections_images_check;
alter table page_sections add constraint page_sections_images_check
  check (array_length(images, 1) is null or array_length(images, 1) <= 4);
