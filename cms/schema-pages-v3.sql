-- CP B&F CMS — Page Management schema v3
-- เพิ่ม button_link_en (ปุ่ม/ลิงก์ ฝั่งหน้ารายการต้องรองรับ TH/EN ทั้งคู่ตามที่ผู้ใช้ขอ)
-- ปลอดภัยรันซ้ำได้ (idempotent)

alter table page_sections add column if not exists button_link_en text default '';
