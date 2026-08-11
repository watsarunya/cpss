-- CP B&F CMS — seed หน้าแรก (index) เข้าระบบ Page Management เต็มรูปแบบ
-- ผู้ใช้ขอ: "หน้าแรก" ต้องจัดการได้ผ่าน Page Management — Our Story/What We Do แก้เนื้อหาได้จริง (คงดีไซน์เดิม
-- ไว้ด้วย custom-html), ส่วน Online Shop/Newsroom/Our Partners/Contact Us เป็น "proxy section" (แค่จัดการ
-- พื้นหลัง+ลำดับ ไม่ได้ย้ายเนื้อหาจริงเข้ามา เพราะมี JS ผูกอยู่ — ดูหมายเหตุใน index-sections-render.js)
--
-- ต้องรัน schema-pages.sql ถึง schema-pages-v7.sql ให้ครบก่อน ไม่งั้น insert นี้จะ error (คอลัมน์ไม่ครบ)
-- ปลอดภัยรันซ้ำได้ (ใช้ on conflict ทับของเดิมด้วย page_id+anchor_id เป็น key เทียบเอง)

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from pages where page_key = 'index';
  if v_page_id is null then
    raise exception 'ไม่พบเพจ page_key=index ใน pages table — รัน schema-pages.sql ให้ครบก่อน';
  end if;

  -- ลบ section เดิมที่เคย seed จากไฟล์นี้มาก่อน (กันซ้ำถ้ารันไฟล์นี้ซ้ำ) — เช็คจาก anchor_id เฉพาะ 6 ตัวที่ใช้ในนี้เท่านั้น
  delete from page_sections
    where page_id = v_page_id
      and anchor_id in ('our-story', 'our-business', 'products', 'news-events', 'our-partners', 'contact-us');

  -- 1) Our Story — เนื้อหาเดิมทั้งหมดจาก index.html ย้ายมาเป็น custom-html แก้ไขได้ผ่าน "โค้ด HTML" ใน CMS
  insert into page_sections (page_id, anchor_id, layout, body_th, is_active, sort_order)
  values (
    v_page_id, 'our-story', 'custom-html',
    $body$<div class="section-container">
  <div class="about-story__head">
    <span class="section-eyebrow" data-en="Our Story">Our Story</span>
    <h2 class="web-title" data-en="The Start of Every Strong Partnership">จุดเริ่มต้นที่แข็งแกร่ง</h2>
  </div>

  <div class="about-story__grid">
    <div class="about-story__collage">
      <div class="about-story__collage-row">
        <div class="about-story__collage-item about-story__collage-item--wide">
          <img src="raw/assets/image/office-team-silhouette.jpg" alt="ทีมงานพูดคุยกันในออฟฟิศยามเย็น" data-en-alt="Team chatting in the office in the evening" />
        </div>
        <div class="about-story__collage-item">
          <img src="raw/assets/image/business-strategy-success-target-goals.jpg" alt="ทีมผู้บริหารวางแผนกลยุทธ์ธุรกิจ" data-en-alt="Executive team planning business strategy" />
        </div>
      </div>
      <div class="about-story__collage-item about-story__collage-item--full">
        <img src="raw/assets/image/cozy-coffee-shop-interior.jpg" alt="ทีมงานประชุมพูดคุยงานร่วมกัน" data-en-alt="Team meeting and discussing work together" />
      </div>
    </div>

    <div class="about-story__copy">
      <p class="about-story__text" data-en="Established in 2016, the company is a subsidiary of Charoen Pokphand Group (CP Group), specializing in the beverage and food business. It is committed to developing and delivering high-quality products for customers in the restaurant, hotel, and cafe sectors, as well as the retail market. The company focuses on environmentally friendly business practices to meet evolving consumer demands, along with the selection of high-quality raw materials, the development of consumer-centric formulas, and adherence to international production standards.">บริษัท ซีพี บีแอนด์เอฟ : ก่อตั้งขึ้นในปี พ.ศ. 2559 เป็นบริษัทใน "เครือเจริญโภคภัณฑ์" เป็นผู้เชี่ยวชาญในธุรกิจเครื่องดื่มและอาหารที่มุ่งมั่นพัฒนาและส่งมอบผลิตภัณฑ์คุณภาพสูง สำหรับลูกค้ากลุ่มร้านอาหาร โรงแรม และคาเฟ่ รวมถึงตลาดค้าปลีก มุ่งเน้นการดำเนินธุรกิจที่เป็นมิตรกับสิ่งแวดล้อม เพื่อตอบสนองความต้องการที่เปลี่ยนแปลงของผู้บริโภค พร้อมกับการคัดเลือกวัตถุดิบคุณภาพสูง การพัฒนาสูตรที่ตอบโจทย์ผู้บริโภค และการควบคุมการผลิตที่ได้มาตรฐานสากล</p>
      <p class="about-story__text" data-en="We are committed to being a global leader in the food and beverage industry, helping to improve health and quality of life. We focus on innovation coupled with environmental sustainability, prioritizing taste, health benefits, and leveraging technology to create customer satisfaction. We support our partners throughout the supply chain towards a sustainable future.">เรามุ่งมั่นที่จะเป็นผู้นำในอุตสาหกรรมด้านอาหารและเครื่องดื่มระดับโลก เพื่อช่วยยกระดับสุขภาพคุณภาพชีวิต มุ่งเน้นสร้างนวัตกรรมควบคู่ความเป็นมิตรต่อสิ่งแวดล้อม ให้ความสำคัญรสชาติ คุณสมบัติที่ดีกับสุขภาพ และใช้เทคโนโลยีในการสร้างความพึงพอใจแก่ลูกค้า สนับสนุนธุรกิจทั้งคู่ค้าตลอดห่วงโซ่อุปทานสู่อนาคตอย่างยั่งยืน</p>

      <div class="about-features">
        <div class="about-features__grid">
          <div class="about-feature">
            <span class="about-feature__icon" aria-hidden="true"><img src="raw/assets/icons/story1.png"></span>
            <p class="about-feature__title" data-en="Leader in Food &amp; Beverage">ผู้นำด้านอาหารและเครื่องดื่ม</p>
          </div>
          <div class="about-feature">
            <span class="about-feature__icon" aria-hidden="true"><img src="raw/assets/icons/story2.png"></span>
            <p class="about-feature__title" data-en="Manufactured with International Innovation">ผลิตสินค้าด้วยนวัตกรรมระดับสากล</p>
          </div>
          <div class="about-feature">
            <span class="about-feature__icon" aria-hidden="true"><img src="raw/assets/icons/story3.png"></span>
            <p class="about-feature__title" data-en="Behind Our Partners&#8217; Success Nationwide">เบื้องหลังความสำเร็จของคู่ค้าทั่วประเทศ</p>
          </div>
          <div class="about-feature">
            <span class="about-feature__icon" aria-hidden="true"><img src="raw/assets/icons/story4.png"></span>
            <p class="about-feature__title" data-en="Committed to Sustainable Development">ดำเนินธุรกิจตามแนวคิดพัฒนาที่ยั่งยืน</p>
          </div>
        </div>
      </div>

      <a href="our_story.html" class="about-story__cta" data-en="Read more">อ่านเพิ่มเติม →</a>
    </div>
  </div>
</div>$body$,
    true, 0
  );

  -- 2) What We Do — เนื้อหาเดิมทั้งหมดจาก index.html ย้ายมาเป็น custom-html แก้ไขได้ผ่าน "โค้ด HTML" ใน CMS
  insert into page_sections (page_id, anchor_id, layout, body_th, is_active, sort_order)
  values (
    v_page_id, 'our-business', 'custom-html',
    $body$<div class="section-container">
  <div class="business-section__header">
    <span class="section-eyebrow" data-en="What We Do">What We Do</span>
    <h2 class="web-title" data-th="ผลิตภัณฑ์ & บริการของเรา ">Our Products & Service</h2>
    <p class="web-description business-section__intro" data-en="CP B&amp;F is more than food and beverage &#8212; we deliver care, wellness, and flavor you can trust. Every product is crafted with innovation, environmental care, and a commitment to your everyday happiness.">CP B&amp;F มากกว่าสร้างสรรค์อาหารและเครื่องดื่ม เราส่งต่อความใส่ใจ สุขภาพดี และรสชาติที่คุณวางใจได้ ทุกผลิตภัณฑ์ออกแบบด้วยนวัตกรรม ใส่ใจสิ่งแวดล้อม และมุ่งมั่นเพื่อความสุขของคุณในทุกวัน</p>
    <h3 data-en="&quot;Choose Us&#8230; For a Better Quality of Life&quot;">"เลือกเรา…เพื่อคุณภาพชีวิตที่ดีกว่า"</h3>
  </div>

  <div class="business-accordion">
    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/hero-business-02.png" alt="Beans (ภาพตัวอย่างชั่วคราว)" data-en-alt="Beans (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="beans_ingredients.html"><h3 class="business-item__title">Cofee Beans & Ingredients</h3>
        <p class="business-item__desc" data-en="Handpicked coffee beans to build your own signature coffee brand">คัดสรรเมล็ดกาแฟ สร้างแบรนด์กาแฟเอกลักษณ์เฉพาะคุณ</p></a>
      </div>
    </article>

    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/water.jpeg" alt="OEM (ภาพตัวอย่างชั่วคราว)" data-en-alt="OEM (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="oem_water.html"><h3 class="business-item__title">น้ำดื่ม OEM</h3>
        <p class="business-item__desc" data-en="Full-service beverage manufacturing to help build your standout brand with high standards">บริการรับผลิตเครื่องดื่มแบบครบวงจร พร้อมสร้างสรรค์แบรนด์ปังด้วยมาตรฐานสูง</p></a>
      </div>
    </article>

    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/cup-dessert.jpg" alt="Catering (ภาพตัวอย่างชั่วคราว)" data-en-alt="Catering (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="catering.html"><h3 class="business-item__title">Catering</h3>
        <p class="business-item__desc" data-en="Premium beverage catering to refresh every important event">บริการจัดเลี้ยงเครื่องดื่มระดับพรีเมียม เติมความสดชื่นตอบโจทย์ทุกงานสำคัญ</p></a>
      </div>
    </article>

    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/coffee-beans.jpg" alt="Cafe' (ภาพตัวอย่างชั่วคราว)" data-en-alt="Cafe' (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="oem_beans.html"><h3 class="business-item__title">เมล็ดกาแฟ OEM</h3>
        <p class="business-item__desc" data-en="Caf&#233;-style coffee and beverages &#8212; rich, smooth, and distinctive in every cup">เมนูกาแฟและเครื่องดื่มสไตล์คาเฟ่ รสชาติเข้มข้น หอมนุ่ม โดดเด่นในทุกแก้ว</p></a>
      </div>
    </article>

    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/images.jpeg" alt="Ready To Drink (ภาพตัวอย่างชั่วคราว)" data-en-alt="Ready To Drink (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="lumi.html"><h3 class="business-item__title">LUMi</h3>
        <p class="business-item__desc" data-en="Ready-to-drink beverages &#8212; convenient, refreshing, and delicious on the go">เครื่องดื่มพร้อมดื่ม สะดวก สดชื่น รสชาติอร่อยลงตัว พกพาไปได้ทุกที่</p></a>
      </div>
    </article>

    <article class="business-item" tabindex="0">
      <img src="raw/assets/image/download.jpeg" alt="Premium water (ภาพตัวอย่างชั่วคราว)" data-en-alt="Premium water (temporary sample image)" class="business-item__img" />
      <span class="business-item__overlay" aria-hidden="true"></span>
      <div class="business-item__content">
        <a href="fuji_premium_water"><h3 class="business-item__title">Fuji Premium water</h3>
        <p class="business-item__desc" data-en="Premium clean drinking water &#8212; refreshing, safe, and elevating your health">น้ำดื่มสะอาดบริสุทธิ์ระดับพรีเมียม สดชื่น ปลอดภัย ยกระดับการดูแลสุขภาพ</p></a>
      </div>
    </article>
  </div>
</div>$body$,
    true, 1
  );

  -- 3-6) Proxy sections สำหรับ Online Shop/Newsroom/Our Partners/Contact Us — ไม่ได้เก็บเนื้อหาจริง (มี JS
  -- ผูกอยู่ในหน้าเว็บโดยตรงอยู่แล้ว) body_th เป็นแค่ marker คงที่ให้ index-sections-render.js รู้จำ
  -- bg_type/bg_color ตั้งเป็นสีพื้นหลังจริงที่ section นั้นใช้อยู่ปัจจุบัน (ดึงจาก background-color ใน
  -- style.css ของแต่ละ class ตรงๆ) เพื่อให้ "จัดการรูปภาพ" ใน CMS แสดงค่าตรงกับที่ใช้งานจริงตั้งแต่แรก
  -- ไม่ใช่ค่าว่างเปล่า — ผลลัพธ์ตอน render จะเหมือนเดิมทุกประการ (สีซ้อนสีเดิมพอดี) จนกว่าแอดมินจะปรับเอง
  insert into page_sections (page_id, anchor_id, layout, body_th, bg_type, bg_color, bg_opacity, bg_grayscale, is_active, sort_order)
  values
    -- .product-section { background-color: var(--bg-product-section) } = #f4f3f1
    (v_page_id, 'products', 'custom-html', '<!-- static-proxy -->', 'color', '#f4f3f1', 100, 0, true, 2),
    -- .news-section { background-color: #ffffff }
    (v_page_id, 'news-events', 'custom-html', '<!-- static-proxy -->', 'color', '#ffffff', 100, 0, true, 3),
    -- .partners-section { background-color: var(--bg-product-section) } = #f4f3f1 (ตัวแปรเดียวกับ Online Shop)
    (v_page_id, 'our-partners', 'custom-html', '<!-- static-proxy -->', 'color', '#f4f3f1', 100, 0, true, 4),
    -- .contact-section { background-color: var(--contact-dark) } = var(--primary-dark) = #123c9e
    (v_page_id, 'contact-us', 'custom-html', '<!-- static-proxy -->', 'color', '#123c9e', 100, 0, true, 5);
end $$;
