-- CP B&F CMS — Page Management schema v5
-- เพิ่มรูปพื้นหลัง (background) แบบ full-bleed ให้ทุก section (รวม custom-html) ปรับ % โปร่งใส และ % grayscale ได้
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists bg_image text default '';
alter table page_sections add column if not exists bg_opacity integer not null default 100;
alter table page_sections add column if not exists bg_grayscale integer not null default 0;

alter table page_sections drop constraint if exists page_sections_bg_opacity_check;
alter table page_sections add constraint page_sections_bg_opacity_check
  check (bg_opacity between 0 and 100);

alter table page_sections drop constraint if exists page_sections_bg_grayscale_check;
alter table page_sections add constraint page_sections_bg_grayscale_check
  check (bg_grayscale between 0 and 100);
