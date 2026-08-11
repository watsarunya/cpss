-- CP B&F CMS — Page Management schema v7
-- เพิ่มรูปแบบพื้นหลังของ section ให้เลือกได้ 3 แบบ: รูปภาพ (เดิม) / สีพื้น / Gradient เส้นตรง
-- bg_image/bg_opacity/bg_grayscale เดิมยังใช้เหมือนเดิมสำหรับ bg_type = 'image'
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists bg_type text not null default 'image';
alter table page_sections drop constraint if exists page_sections_bg_type_check;
alter table page_sections add constraint page_sections_bg_type_check
  check (bg_type in ('image', 'color', 'gradient'));

alter table page_sections add column if not exists bg_color text default '';
alter table page_sections add column if not exists bg_gradient_from text default '';
alter table page_sections add column if not exists bg_gradient_to text default '';
alter table page_sections add column if not exists bg_gradient_direction text not null default 'to bottom';
alter table page_sections drop constraint if exists page_sections_bg_gradient_direction_check;
alter table page_sections add constraint page_sections_bg_gradient_direction_check
  check (bg_gradient_direction in ('to bottom', 'to left'));
