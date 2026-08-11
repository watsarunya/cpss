-- CP B&F CMS — seed เมนูย่อย (dropdown) ของ 4 เมนูหลักที่มีอยู่จริงบนเว็บตอนนี้
-- รันหลัง schema.sql (ต้องมีเมนูหลัก 7 รายการอยู่แล้ว) — วางใน SQL Editor แล้ว Run ครั้งเดียว
-- หมายเหตุ: แก้ url ของ "เมล็ดกาแฟ"/"Catering" ใน "บริการเครื่องดื่มครบวงจร" จาก " beans.html"/" catering.html"
--           (มีช่องว่างนำหน้า เป็นบั๊กเดิมในโค้ด HTML) เป็น "beans.html"/"catering.html" ให้ถูกต้อง

-- เรื่องราวของเรา (Our Story)
insert into menu_items (parent_id, name_th, name_en, url, image_url, sort_order) values
  ((select id from menu_items where name_th = 'เรื่องราวของเรา' and parent_id is null), 'ประวัติความเป็นมา', 'History', 'about.html#history', 'raw/assets/image/office-team-silhouette.jpg', 1),
  ((select id from menu_items where name_th = 'เรื่องราวของเรา' and parent_id is null), 'วิสัยทัศน์ & พันธกิจ', 'Vision & Mission', 'about.html#vision-mission', 'raw/assets/image/business-strategy-success-target-goals.jpg', 2),
  ((select id from menu_items where name_th = 'เรื่องราวของเรา' and parent_id is null), 'รางวัลและความสำเร็จ', 'Awards & Achievements', 'about.html#awards', 'raw/assets/image/career.jpg', 3),
  ((select id from menu_items where name_th = 'เรื่องราวของเรา' and parent_id is null), 'ความยั่งยืน', 'Sustainability', 'about.html#sustainability', 'raw/assets/image/sustainable-energy-campaign-hand-holding-tree-light-bulb-media-remix.jpg', 4);

-- สินค้า (Products)
insert into menu_items (parent_id, name_th, name_en, url, image_url, sort_order) values
  ((select id from menu_items where name_th = 'สินค้า' and parent_id is null), 'เมล็ดกาแฟ', 'Coffee Beans', 'products.html?category=coffee-beans', 'raw/assets/image/hero-business-02.png', 1),
  ((select id from menu_items where name_th = 'สินค้า' and parent_id is null), 'อุปกรณ์ร้านกาแฟ', 'Coffee Shop Equipment', 'products.html?category=coffee-equipment', 'raw/assets/image/cozy-coffee-shop-interior.jpg', 2),
  ((select id from menu_items where name_th = 'สินค้า' and parent_id is null), 'วัตถุดิบสำหรับเครื่องดื่ม', 'Beverage Ingredients', 'products.html?category=beverage-ingredients', 'raw/assets/image/2148155123.jpg', 3),
  ((select id from menu_items where name_th = 'สินค้า' and parent_id is null), 'เครื่องดื่มพร้อมดื่ม (RTD)', 'Ready-to-Drink (RTD)', 'products.html?category=rtd', 'raw/assets/image/rtd.jpg', 4),
  ((select id from menu_items where name_th = 'สินค้า' and parent_id is null), 'น้ำดื่มพรีเมียม ฟูจิ', 'Fuji Premium Water', 'products.html?category=fuji-water', 'raw/assets/image/download.jpeg', 5);

-- บริการเครื่องดื่มครบวงจร (Beverage as a Service)
insert into menu_items (parent_id, name_th, name_en, url, image_url, sort_order) values
  ((select id from menu_items where name_th = 'บริการเครื่องดื่มครบวงจร' and parent_id is null), 'น้ำดื่ม', 'Drinking Water', 'oem_water.html', 'raw/assets/image/water.jpeg', 1),
  ((select id from menu_items where name_th = 'บริการเครื่องดื่มครบวงจร' and parent_id is null), 'เมล็ดกาแฟ', 'Coffee Beans', 'beans.html', 'raw/assets/image/hero-business-02.png', 2),
  ((select id from menu_items where name_th = 'บริการเครื่องดื่มครบวงจร' and parent_id is null), 'Catering', 'Catering', 'catering.html', 'raw/assets/image/high-angle-catering-food.jpg', 3),
  ((select id from menu_items where name_th = 'บริการเครื่องดื่มครบวงจร' and parent_id is null), 'VENDING', 'VENDING', 'vending.html', 'raw/assets/image/Vending.jpg', 4);

-- คาเฟ่ (Café)
insert into menu_items (parent_id, name_th, name_en, url, image_url, sort_order) values
  ((select id from menu_items where name_th = 'คาเฟ่' and parent_id is null), 'Beanie', 'Beanie', 'beanie.html', 'raw/assets/image/Cafe/Beanie.jpg', 1),
  ((select id from menu_items where name_th = 'คาเฟ่' and parent_id is null), 'Jungle', 'Jungle', 'jungle.html', 'raw/assets/image/Cafe/Jungle.jpg', 2),
  ((select id from menu_items where name_th = 'คาเฟ่' and parent_id is null), 'Arabitia', 'Arabitia', 'arabitia.html', 'raw/assets/image/Cafe/Arabitia.jpg', 3);
