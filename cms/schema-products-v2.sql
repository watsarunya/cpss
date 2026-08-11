-- CP B&F CMS — Product Management schema v2
-- รันหลัง schema-products.sql
-- เพิ่มรองรับ "อัปโหลดภาพสินค้าได้สูงสุด 5 ภาพ กำหนดภาพปกได้"
-- คอลัมน์ images เก็บ URL ทุกภาพ (สูงสุด 5) โดยตัวแรก (index 0) คือภาพปก — คอลัมน์ image เดิม
-- ยังคงเก็บ URL ภาพปกไว้เหมือนเดิม (หน้าเว็บหลัก/การ์ดสินค้าที่มีอยู่แล้วอ้างอิง products.image
-- โดยตรง ไม่ต้องแก้โค้ดส่วนนั้น) วางใน SQL Editor แล้ว Run ครั้งเดียว

alter table products add column if not exists images text[] not null default '{}';
