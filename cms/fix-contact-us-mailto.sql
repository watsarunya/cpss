-- CP B&F CMS — ปุ่ม/เมนู "Contact Us" (ติดต่อเรา) ทุกจุด เปลี่ยนเป็น mailto: แทนการไปหน้า contact.html
-- (เมนูหลักในเว็บโดน nav-render.js ดึงจากตาราง menu_items มาทับ static HTML เสมอ ต้องแก้ที่นี่ด้วย)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว ปลอดภัย รันซ้ำได้ (idempotent)

update menu_items
set url = 'mailto:cpbfhr@cpbf.co.th'
where parent_id is null
  and (name_en = 'Contact Us' or name_th = 'ติดต่อเรา')
  and url = 'contact.html';
