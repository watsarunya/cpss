-- CP B&F CMS — Page Management schema v4
-- เพิ่ม layout 'custom-html' — section แบบเขียน HTML เองได้ทั้งหมด (ไม่มีรูป/หัวข้อ/เนื้อหา/ปุ่มแบบฟอร์มปกติ
-- ใช้ body_th เก็บโค้ด HTML ดิบที่แอดมินพิมพ์เอง แล้ว sanitize ด้วย DOMPurify ก่อน render เหมือน section อื่น)
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections drop constraint if exists page_sections_layout_check;
alter table page_sections add constraint page_sections_layout_check
  check (layout in ('image-left', 'image-right', 'image-top', 'image-bottom', 'custom-html'));
