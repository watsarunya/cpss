-- CP B&F CMS — seed หน้า career (ร่วมงานกับเรา) เข้าระบบ Page Management เต็มรูปแบบ
-- ผู้ใช้ขอ: 3 section เดิม (บริษัท CP B&F ดีอย่างไร?/Benefit/ทำไมต้องร่วมงานกับเรา?) แก้เนื้อหาได้จริงผ่าน
-- custom-html, ส่วน section "Apply now" (ฟอร์มสมัครงาน) เป็น "proxy section" (แค่จัดการพื้นหลัง+ลำดับ ไม่ได้
-- ย้ายเนื้อหาจริงเข้ามา เพราะมี JS ผูกอยู่จริง — dropdown ตำแหน่งงาน + อัปโหลดไฟล์/ส่งฟอร์มไป Edge Function
-- ดูหมายเหตุใน page-render.js's renderSections/isProxySection)
--
-- หมายเหตุการ migrate: ตัด <section class="career-intro">/<section class="career-benefits">/
-- <section class="career-features"> ชั้นนอกออก (เหลือแค่เนื้อหาข้างในเป็น body_th) เพราะ buildSection()
-- ของ page-render.js สร้าง <section class="page-section page-section--custom-html"> ครอบให้เองอยู่แล้ว —
-- ใช้ bg_type/bg_color ตั้งสีพื้นหลังจริงแทนการ hardcode background-color ไว้ใน body_th (ให้จัดการผ่าน CMS
-- ได้ตามระบบปกติ) ดึงค่าจริงจาก style.css: .career-intro/.career-features { background-color: var(--bg-main)
-- } = #ffffff, .career-benefits { background-color: var(--primary-color) } = #1b5ef9 — padding จะต่างจากเดิม
-- เล็กน้อย (.page-section ให้ padding: 30px 80px แทน 72px 50px เดิม) เป็น trade-off เดียวกับที่ยอมรับแล้วตอน
-- ย้าย Our Story/What We Do ของหน้าแรก (ดู seed-index-sections.sql)
--
-- ต้องรัน schema-pages.sql ถึง schema-pages-v7.sql ให้ครบก่อน ไม่งั้น insert นี้จะ error (คอลัมน์ไม่ครบ)
-- ปลอดภัยรันซ้ำได้ (ลบ pages row เดิม cascade ไป page_sections ก่อน insert ใหม่ทุกครั้ง)

do $$
declare
  v_page_id uuid;
begin
  -- ลบเพจเดิมถ้าเคย seed มาก่อน (cascade ลบ page_sections ของเพจนี้ไปด้วยอัตโนมัติ) กันซ้ำถ้ารันไฟล์นี้ซ้ำ
  delete from pages where page_key = 'career';

  insert into pages (page_key, slug, menu_item_id, title_th, title_en, is_standalone, is_active)
  values (
    'career', 'career', 'ea9cec7f-c558-4198-a371-6b4d4bff7b76',
    'ร่วมงานกับเรา', 'Careers', false, true
  )
  returning id into v_page_id;

  -- 1) บริษัท CP B&F ดีอย่างไร? — เนื้อหาเดิมทั้งหมดจาก career.html ย้ายมาเป็น custom-html แก้ไขได้ผ่าน
  -- "โค้ด HTML" ใน CMS — bg เดิม .career-intro { background-color: var(--bg-main) } = #ffffff
  insert into page_sections (page_id, anchor_id, layout, body_th, bg_type, bg_color, bg_opacity, bg_grayscale, is_active, sort_order)
  values (
    v_page_id, 'career-intro', 'custom-html',
    $body$<div class="section-container career-intro__grid">
  <div class="career-intro__media">
    <img src="raw/assets/image/group-asia-young-creative.jpg" alt="บรรยากาศการทำงานที่ CP B&amp;F (ภาพตัวอย่างชั่วคราว)" />
  </div>
  <div class="career-intro__copy">
    <h2 class="web-title">บริษัท CP B&amp;F ดีอย่างไร?</h2>
    <p class="web-description">
      เป็นบริษัทในเครือเจริญโภคภัณฑ์ เป็นผู้เชี่ยวชาญในธุรกิจเครื่องดื่มและอาหารที่มุ่งมั่นพัฒนาและส่งมอบผลิตภัณฑ์คุณภาพสูง
      สำหรับลูกค้ากลุ่มร้านอาหาร โรงแรม และคาเฟ่ รวมถึงตลาดค้าปลีก มุ่งเน้นการดำเนินธุรกิจที่เป็นมิตรกับสิ่งแวดล้อม
      เพื่อตอบสนองความต้องการที่เปลี่ยนแปลงของผู้บริโภค พร้อมกับการคัดเลือกวัตถุดิบคุณภาพสูง
      การพัฒนาสูตรที่ตอบโจทย์ผู้บริโภค และการควบคุมการผลิตที่ได้มาตรฐานสากล
    </p>
  </div>
</div>$body$,
    'color', '#ffffff', 100, 0, true, 0
  );

  -- 2) Benefit — เนื้อหาเดิมทั้งหมด (4 การ์ดสวัสดิการ) ย้ายมาเป็น custom-html — bg เดิม .career-benefits
  -- { background-color: var(--primary-color) } = #1b5ef9 (จำเป็นเพราะหัวข้อ "Benefit" เป็นตัวหนังสือสีขาว
  -- ต้องมีพื้นหลังเข้มถึงจะอ่านออก)
  insert into page_sections (page_id, anchor_id, layout, body_th, bg_type, bg_color, bg_opacity, bg_grayscale, is_active, sort_order)
  values (
    v_page_id, 'career-benefits', 'custom-html',
    $body$<div class="section-container">
  <div class="career-benefits__head">
    <h2 class="web-title" style="color:#ffffff;">Benefit</h2>
  </div>

  <div class="career-benefits__grid">
    <div class="career-benefit">
      <span class="career-benefit__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-7-10.5C5 6.5 8 4 12 6c4-2 7 .5 7 4.5C19 16.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </span>
      <h3 class="career-benefit__title">ประกันชีวิต</h3>
    </div>
    <div class="career-benefit">
      <span class="career-benefit__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9v6M9 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </span>
      <h3 class="career-benefit__title">ประกันสุขภาพ</h3>
    </div>
    <div class="career-benefit">
      <span class="career-benefit__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5v9M9.3 14.5c0 1.1 1.2 2 2.7 2s2.7-.8 2.7-1.8c0-1.2-1.1-1.6-2.7-2-1.6-.4-2.7-.9-2.7-2 0-1 1.2-1.8 2.7-1.8s2.7.7 2.7 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </span>
      <h3 class="career-benefit__title">เงินโบนัสตามผลงาน</h3>
    </div>
    <div class="career-benefit">
      <span class="career-benefit__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 8.5a2.5 2.5 0 1 0 0-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15 14.7c2.5.4 4.5 2.4 4.5 5.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </span>
      <h3 class="career-benefit__title">ประกันสังคม</h3>
    </div>
  </div>
</div>$body$,
    'color', '#1b5ef9', 100, 0, true, 1
  );

  -- 3) ทำไมต้องร่วมงานกับเรา? — เนื้อหาเดิมทั้งหมด ย้ายมาเป็น custom-html — bg เดิม .career-features
  -- { background-color: var(--bg-main) } = #ffffff
  insert into page_sections (page_id, anchor_id, layout, body_th, bg_type, bg_color, bg_opacity, bg_grayscale, is_active, sort_order)
  values (
    v_page_id, 'career-features', 'custom-html',
    $body$<div class="section-container">
  <div class="career-benefits__head">
    <h2 class="web-title">ทำไมต้องร่วมงานกับเรา?</h2>
    <p>สมัครงานกับ CP B&F เปิดโอกาสและสนับสนุนให้ทุกคนค้นพบศักยภาพ ความสามารถ เพื่อเติมเต็มโอกาสและประสบการณ์ที่หลากหลาย พร้อมส่งผ่านคุณค่าสู่สังคมไปด้วยกัน</p>
    <p>เรามุ่งมั่นที่จะเป็นผู้นำในอุตสาหกรรมด้านอาหารและเครื่องดื่มระดับโลก เพื่อช่วยยกระดับสุขภาพคุณภาพชีวิต มุ่งเน้นสร้างนวัตกรรมควบคู่ความเป็นมิตรต่อสิ่งแวดล้อม</p>
  </div>

  <div class="career-features__grid">
    <div class="career-feature">
      <span class="career-feature__icon" aria-hidden="true">
        <img src="raw/assets/icons/bus-station.png" width="70" height="70">
      </span>
      <h3 class="career-feature__title">การเดินทาง</h3>
      <p class="career-feature__text">510, 52, 1-1(29เก่า),555, 187 ,504</p>
    </div>

    <div class="career-feature">
      <span class="career-feature__icon" aria-hidden="true">
        <img src="raw/assets/icons/map.png" width="70" height="70">
      </span>
      <h3 class="career-feature__title">ที่ตั้งบริษัท</h3>
      <p class="career-feature__text">185 ซอยวิภาวดีรังสิต 62 (ศรีรับสุข) แขวงตลาดบางเขน เขตหลักสี่ จังหวัดกรุงเทพมหานคร 10210 ประเทศไทย</p>
    </div>

    <div class="career-feature">
      <span class="career-feature__icon" aria-hidden="true">
        <img src="raw/assets/icons/phone-call.png" width="70" height="70">
      </span>
      <h3 class="career-feature__title">ฝ่ายทรัพยากรบุคคล</h3>
      <p class="career-feature__text">อีเมล <a href="mailto:cpbfhr@cpbf.co.th">cpbfhr@cpbf.co.th</a> | โทร. <a href="tel:+66641565054">064-156-5054</a></p>
    </div>
  </div>
</div>$body$,
    'color', '#ffffff', 100, 0, true, 2
  );

  -- 4) Apply now — proxy section (ฟอร์มสมัครงานจริง มี JS ผูกอยู่ในหน้าเว็บโดยตรง ไม่ได้เก็บเนื้อหาจริงในนี้)
  -- bg เดิม .career-apply { background-color: var(--ci-blue) } = #1b5ef9 (ค่าเดียวกับ Benefit เพราะ
  -- --ci-blue กับ --primary-color เป็นค่าเดียวกันในไฟล์นี้) เพื่อให้ "จัดการรูปภาพ" ใน CMS แสดงค่าตรงกับที่
  -- ใช้งานจริงตั้งแต่แรก ไม่ใช่ค่าว่างเปล่า — ผลลัพธ์ตอน render จะเหมือนเดิมทุกประการ (สีซ้อนสีเดิมพอดี)
  -- จนกว่าแอดมินจะปรับเอง
  insert into page_sections (page_id, anchor_id, layout, body_th, bg_type, bg_color, bg_opacity, bg_grayscale, is_active, sort_order)
  values (
    v_page_id, 'apply-now', 'custom-html', '<!-- static-proxy -->', 'color', '#1b5ef9', 100, 0, true, 3
  );
end $$;
