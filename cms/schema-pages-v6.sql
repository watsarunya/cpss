-- CP B&F CMS — Page Management schema v6
-- เพิ่มตัวเลือกเปิด/ปิด grayscale filter สำหรับรูปภาพหลักของ section (collage) แยกจาก bg_grayscale เดิม
-- (bg_grayscale คุมพื้นหลัง full-bleed, images_grayscale คุมรูปภาพหลักที่เลือกไว้ในฟิลด์ "รูปภาพ")
-- default true เพื่อคงพฤติกรรมเดิม (ภาพขาวดำ เปลี่ยนเป็นสีตอน hover) ให้ section เก่าที่มีอยู่แล้วทั้งหมด
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists images_grayscale boolean not null default true;
