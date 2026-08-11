-- CP B&F CMS — แก้ URL ที่ค้างชี้ไปหน้าเก่าที่ถูกเปลี่ยนชื่อไปแล้ว
--   about.html      -> our_story.html   (พบว่าคุณแก้เมนูหลัก "Our Story" เองแล้ว แต่เมนูย่อย 4 รายการยังไม่ได้แก้)
--   what-we-do.html -> our_service.html (เมนูหลัก "Our Service" ยังชี้ไปหน้าเดิมที่ไม่มีอยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว ปลอดภัย รันซ้ำได้ (idempotent)

update menu_items
set url = 'our_story.html' || substring(url from length('about.html') + 1)
where url like 'about.html%';

update menu_items
set url = 'our_service.html'
where url = 'what-we-do.html';
