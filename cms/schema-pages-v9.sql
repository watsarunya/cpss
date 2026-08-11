-- CP B&F CMS — Page Management schema v9
-- (1) ปุ่มของ section เลือกรูปแบบ/สีได้: button_style (text-link เดิม / primary / primary-outline)
--     + button_color (hex override เอง — ถ้าว่างใช้สี primary ของเว็บเป็น default)
-- (2) แต่ละรูปในกริดของ section ใส่ลิงก์แยกได้ (image_links — parallel array ตำแหน่งตรงกับ images)
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists button_style text not null default 'text-link';
alter table page_sections drop constraint if exists page_sections_button_style_check;
alter table page_sections add constraint page_sections_button_style_check
  check (button_style in ('text-link', 'primary', 'primary-outline'));

alter table page_sections add column if not exists button_color text not null default '';

alter table page_sections add column if not exists image_links text[] not null default '{}';
