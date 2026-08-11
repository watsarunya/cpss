-- CP B&F CMS — Page Management schema v8
-- เพิ่มการจัดตำแหน่งหัวข้อ (title) ของ section แบบปกติ (ไม่ใช่ custom-html): ซ้าย/กลาง/ขวา
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists heading_align text not null default 'left';
alter table page_sections drop constraint if exists page_sections_heading_align_check;
alter table page_sections add constraint page_sections_heading_align_check
  check (heading_align in ('left', 'center', 'right'));
