-- CP B&F CMS — Newsroom schema (categories + articles)
-- รันหลัง schema.sql (ต้องมี extension pgcrypto + function set_updated_at() อยู่แล้ว)
-- วางใน SQL Editor แล้ว Run ครั้งเดียว

create table if not exists news_categories (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null default '',
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_categories_sort_order_idx on news_categories (sort_order);

drop trigger if exists news_categories_set_updated_at on news_categories;
create trigger news_categories_set_updated_at
  before update on news_categories
  for each row
  execute function set_updated_at();

create table if not exists news_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references news_categories(id) on delete set null,
  title_th text not null,
  title_en text not null default '',
  image text default '',
  excerpt_th text not null default '',
  excerpt_en text default '',
  content_th text not null default '',
  content_en text default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_articles_category_id_idx on news_articles (category_id);
create index if not exists news_articles_created_at_idx on news_articles (created_at desc);

drop trigger if exists news_articles_set_updated_at on news_articles;
create trigger news_articles_set_updated_at
  before update on news_articles
  for each row
  execute function set_updated_at();

-- RLS: อ่านได้แบบสาธารณะ (หน้าเว็บหลักต้องดึงข่าว/บทความไปแสดง) แก้ไข/เพิ่ม/ลบได้เฉพาะ login แล้วเท่านั้น

alter table news_categories enable row level security;

drop policy if exists "public can read news_categories" on news_categories;
create policy "public can read news_categories"
  on news_categories for select
  using (true);

drop policy if exists "authenticated can insert news_categories" on news_categories;
create policy "authenticated can insert news_categories"
  on news_categories for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update news_categories" on news_categories;
create policy "authenticated can update news_categories"
  on news_categories for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete news_categories" on news_categories;
create policy "authenticated can delete news_categories"
  on news_categories for delete
  to authenticated
  using (true);

alter table news_articles enable row level security;

drop policy if exists "public can read news_articles" on news_articles;
create policy "public can read news_articles"
  on news_articles for select
  using (true);

drop policy if exists "authenticated can insert news_articles" on news_articles;
create policy "authenticated can insert news_articles"
  on news_articles for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update news_articles" on news_articles;
create policy "authenticated can update news_articles"
  on news_articles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete news_articles" on news_articles;
create policy "authenticated can delete news_articles"
  on news_articles for delete
  to authenticated
  using (true);

-- ข้อมูลเริ่มต้น: 3 หมวดหมู่เดิมที่ filter ในหน้า newsroom.html ใช้อยู่แล้ว (คง slug เดิมไว้เป๊ะๆ)
insert into news_categories (name_th, name_en, slug, sort_order) values
  ('ข่าวสาร', 'News', 'news', 1),
  ('กิจกรรม', 'Event', 'event', 2),
  ('บทความ', 'Article', 'blog', 3)
on conflict (slug) do nothing;

-- ข้อมูลบทความเริ่มต้น: ย้ายจากของเดิมที่ hardcode ไว้ใน index.html/newsroom.html/news-*.html
insert into news_articles (category_id, title_th, title_en, image, excerpt_th, content_th, sort_order) values
  ((select id from news_categories where slug = 'news'),
   'เปิดตัว "Beanie Coffee" Specialty Cloud Café ที่ต้องลอง!', 'Introducing Beanie Coffee Specialty Cloud Café',
   'raw/assets/News/new1.jpeg',
   'ร่วมสัมผัสประสบการณ์กาแฟสเปเชียลตี้แบบใหม่ กับบรรยากาศคาเฟ่สไตล์ Cloud Café ที่ออกแบบมาเพื่อทุกช่วงเวลาพักผ่อนของคุณ พร้อมเมนูซิกเนเจอร์ที่คัดสรรมาโดยเฉพาะ',
   '<p>Beanie Coffee แบรนด์กาแฟน้องใหม่จากทีมเถ้าแก่ ของเครือซีพี พร้อมมอบประสบการณ์กาแฟสุดพิเศษ ด้วยเมล็ดกาแฟหลากหลายสายพันธุ์ที่ผ่านการคัดสรรอย่างพิถีพิถัน ไม่ต้องเดินทางไกล!</p>' ||
   '<p>นี่คือสิ่งที่ทำให้ Beanie Coffee แตกต่างจากร้านกาแฟทั่วไป:</p>' ||
   '<h2>1. คอนเซปต์ร้าน Cloud Café</h2><p>Beanie Coffee ออกแบบมาในรูปแบบ Cloud Café ที่เน้นความสะดวกสบาย ลูกค้าสามารถสั่งล่วงหน้าผ่านแอปพลิเคชันและมารับที่ร้านได้ทันที ลดเวลารอคอย พร้อมพื้นที่นั่งชิลสไตล์มินิมอลสำหรับผู้ที่ต้องการแวะพัก</p>' ||
   '<h2>2. เมนูแนะนำ</h2><p>เมนูซิกเนเจอร์ของร้านคัดสรรจากเมล็ดกาแฟคุณภาพพรีเมียม ผสมผสานเทคนิคการชงที่ทันสมัย ให้รสชาติกลมกล่อมและมีเอกลักษณ์เฉพาะตัว เหมาะสำหรับทั้งคนรักกาแฟตัวจริงและผู้ที่เพิ่งเริ่มดื่มกาแฟ</p>' ||
   '<h2>3. ช่องทางการสั่งซื้อ</h2><p>ไม่ต้องเดินทางไกล! Pick up ได้ง่ายๆ ที่ร้าน หรือเลือกสั่ง Grab ส่งตรงถึงมือคุณ สะดวก รวดเร็ว ทุกที่ทุกเวลา</p>',
   1),
  ((select id from news_categories where slug = 'event'),
   'Beanie Coffee ชวนมาเจอกันที่ Kaset Fair!', 'Beanie Coffee at Kaset Fair',
   'raw/assets/News/news2.jpeg',
   'พบกับบูธ Beanie Coffee ในงาน Kaset Fair พร้อมเมนูพิเศษ กิจกรรมสนุกๆ และของรางวัลมากมายสำหรับผู้ที่มาเยี่ยมชมบูธของเราตลอดงาน ห้ามพลาดเด็ดขาด',
   '<p>ตั้งแต่วันที่ 31 ม.ค. - 8 ก.พ. 68 Beanie Coffee เปิดตัวในรูปแบบ Coffee Truck ครั้งแรก ในงานเกษตรแฟร์ มาพร้อมเมนูสุดพิเศษที่วางขายเฉพาะในงานเท่านั้น</p>' ||
   '<p>มาทำความรู้จักกับไฮไลต์ของงานในครั้งนี้กัน:</p>' ||
   '<h2>1. Coffee Truck ครั้งแรก</h2><p>นับเป็นครั้งแรกที่ Beanie Coffee นำรถ Coffee Truck ออกมาให้บริการนอกสถานที่ เพื่อให้ลูกค้าได้สัมผัสประสบการณ์กาแฟคุณภาพในบรรยากาศงานเกษตรแฟร์ที่คึกคัก</p>' ||
   '<h2>2. เมนูพิเศษเฉพาะงาน</h2><p>เมนูไฮไลต์ที่วางขายเฉพาะในงาน ได้แก่ Beanie Marshmallow และ Heartbeat Soda เครื่องดื่มรสชาติเอกลักษณ์ที่หาดื่มได้เฉพาะที่งานเกษตรแฟร์เท่านั้น</p>' ||
   '<h2>3. ร่วมงานได้ที่ไหน</h2><p>พบกับ Beanie Coffee Truck ได้ที่งานเกษตรแฟร์ ตั้งแต่วันที่ 31 มกราคม ถึง 8 กุมภาพันธ์ 2568 แวะมาชิมและพูดคุยกับทีมงานได้เลย</p>',
   2),
  ((select id from news_categories where slug = 'event'),
   'เก็บบรรยากาศเฮงรับตรุษจีน 2568!', 'Chinese New Year Celebration 2025',
   'raw/assets/News/new3.jpeg',
   'ฉลองเทศกาลตรุษจีนไปพร้อมกับทีมงาน CP B&F ด้วยกิจกรรมเสริมสิริมงคล อวยพรรับปีใหม่ พร้อมมอบความสุขและรอยยิ้มให้กับทุกคนในครอบครัวและลูกค้าทุกท่าน',
   '<p>ซีพี บีแอนด์เอฟ รวมพลังเปิดโชคดีต้อนรับปีใหม่จีน นำทีมโดยคุณสรรเสริญ สมัยสุต ประธานเจ้าหน้าที่บริหาร พร้อมผู้บริหารและพนักงาน ร่วมเฉลิมฉลองเทศกาลตรุษจีนไปพร้อมกัน</p>' ||
   '<p>บรรยากาศภายในงานเต็มไปด้วยความอบอุ่นและสีสัน:</p>' ||
   '<h2>1. พิธีเปิดโชคดีต้อนรับปีใหม่จีน</h2><p>ผู้บริหารระดับสูงนำทีมพนักงานร่วมพิธีเปิดโชคดี พร้อมกล่าวอวยพรปีใหม่จีน ขอให้ทุกคนในองค์กรมีความสุขและประสบความสำเร็จตลอดปี</p>' ||
   '<h2>2. กิจกรรมสร้างความสัมพันธ์</h2><p>ภายในงานมีกิจกรรมสันทนาการให้พนักงานได้ร่วมสนุก เสริมสร้างความสัมพันธ์อันดี ระหว่างทีมงานทุกฝ่าย ท่ามกลางบรรยากาศแห่งความเป็นสิริมงคล</p>' ||
   '<h2>3. อั่งเปาตั่วตั่วไก๊!</h2><p>ปิดท้ายงานด้วยการแจกอั่งเปาให้กับพนักงานทุกคน พร้อมคำอวยพร "อั่งเปาตั่วตั่วไก๊" ขอให้ทุกคนโชคดี มีเงินทองไหลมาเทมาตลอดปี</p>',
   3),
  ((select id from news_categories where slug = 'blog'),
   '5 เคล็ดลับชงกาแฟดริปที่บ้านให้อร่อยเหมือนร้าน', '5 Tips for Brewing Café-Quality Drip Coffee at Home',
   'raw/assets/image/hero-business-02.png',
   'แชร์เทคนิคง่ายๆ ตั้งแต่การเลือกเมล็ด บดกาแฟ ไปจนถึงอุณหภูมิน้ำที่เหมาะสม ช่วยให้คุณดื่มด่ำกาแฟแก้วโปรดได้ทุกเช้าโดยไม่ต้องออกจากบ้าน',
   '<p>แชร์เทคนิคง่ายๆ ตั้งแต่การเลือกเมล็ด บดกาแฟ ไปจนถึงอุณหภูมิน้ำที่เหมาะสม ช่วยให้คุณดื่มด่ำกาแฟแก้วโปรดได้ทุกเช้าโดยไม่ต้องออกจากบ้าน</p>',
   4)
on conflict do nothing;
