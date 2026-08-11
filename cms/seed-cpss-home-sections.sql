-- CPSS — เนื้อหาหน้าแรกใหม่ทั้งหมด (custom-html sections) อ้างอิงดีไซน์จาก
-- https://cpss-service-th.pawinee-patch.chatgpt.site/
--
-- แต่ละ section ด้านล่างคือ 1 แถวใน page_sections (layout='custom-html') ผูกกับเพจ page_key='index'
-- (ต้องรัน cms/migration-cpss-fresh.sql ไปแล้วก่อน ถึงจะมีแถว pages.page_key='index' ให้ผูก) —
-- จัดการได้ทั้งหมดผ่าน cms/page-editor.html (เปิดเพจ "หน้าแรก"): แก้โค้ด HTML, สลับลำดับด้วยปุ่ม ▲▼,
-- ปิด/เปิดใช้งาน, ลบทิ้ง — ตรงตามที่ขอ ("section ที่สร้างต้องอยู่ใน custom html ในเมนูจัดการเพจของ cms")
--
-- รูปภาพทั้งหมดอ้างอิง raw/assets/assets/*.png และ raw/assets/spare-covers/*.jpg ที่มีอยู่ในโปรเจกต์แล้ว
-- (ชื่อไฟล์ตรงกับที่เว็บอ้างอิงใช้เป๊ะ) — ปุ่ม "แจ้งงานผ่าน LINE"/"แชตเลย" ลิงก์ไป LINE OA @033tlaat ตรงๆ
-- ฟอร์ม "REQUEST SERVICE VIA LINE" ทำงานผ่าน home-request-form.js (ไฟล์ใหม่ที่ root ของเว็บ, โหลดใน
-- index.html แล้ว) — ไม่มี backend: คัดลอกข้อความสรุปงานแล้วเปิดแชท LINE ให้ผู้ใช้กดส่งเอง
--
-- ปลอดภัยรันซ้ำได้ (ลบ 7 แถวเดิมที่ anchor_id ตรงกันก่อน insert ใหม่ทุกครั้ง เหมือน seed-index-sections.sql เดิม)

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from pages where page_key = 'index';
  if v_page_id is null then
    raise exception 'ไม่พบเพจ page_key=''index'' — ต้องรัน cms/migration-cpss-fresh.sql ก่อน';
  end if;

  delete from page_sections
    where page_id = v_page_id
      and anchor_id in ('ch-hero', 'ch-about', 'ch-services', 'ch-business', 'ch-parts-teaser', 'ch-centers', 'ch-contact');

  insert into page_sections (page_id, anchor_id, layout, sort_order, is_active, body_th) values

  -- 1) Hero
  (v_page_id, 'ch-hero', 'custom-html', 0, true, '
<section class="ch-hero" id="home">
  <div class="ch-hero-backdrop" aria-hidden="true"></div>
  <div class="ch-shell ch-hero-grid">
    <div>
      <p class="ch-eyebrow ch-eyebrow--light">PROFESSIONAL TECHNICAL SERVICE</p>
      <h1>ดูแลทุกเครื่อง<br><span>ให้ธุรกิจคุณเดินต่อ</span></h1>
      <p class="ch-hero-lead">บริการติดตั้ง ซ่อมแซม และบำรุงรักษาระบบทำความเย็น เครื่องชงกาแฟ และอุปกรณ์เชิงพาณิชย์ โดยทีมช่างผู้ชำนาญทั่วประเทศ</p>
      <div class="ch-hero-actions">
        <a class="ch-button" href="https://line.me/R/ti/p/@033tlaat" target="_blank" rel="noopener">แจ้งงานผ่าน LINE <b>↗</b></a>
        <a class="ch-button ch-button--ghost" href="#services">ดูบริการทั้งหมด</a>
      </div>
      <div class="ch-hero-points">
        <span><i>✓</i> PM &amp; CM ครบวงจร</span>
        <span><i>✓</i> ทีมช่างทั่วประเทศ</span>
        <span><i>✓</i> อะไหล่เครื่องชงกาแฟ</span>
      </div>
    </div>
    <aside class="ch-dispatch-card">
      <div class="ch-live"><span></span> SERVICE DESK</div>
      <h2>เครื่องชงมีปัญหา?</h2>
      <p>แจ้งรุ่นเครื่อง อาการ สถานที่ และช่วงเวลาที่สะดวก ทีมงานจะติดต่อกลับเพื่อประเมินงาน</p>
      <a href="https://line.me/R/ti/p/@033tlaat" target="_blank" rel="noopener">
        <small>LINE OFFICIAL</small>
        <strong>@033tlaat</strong>
        <em>แชตเลย →</em>
      </a>
    </aside>
  </div>
  <div class="ch-hero-strip">
    <div class="ch-shell ch-strip-grid">
      <div><strong>15</strong><span>ศูนย์ช่างทั่วประเทศ</span></div>
      <div><strong>PM + CM</strong><span>ป้องกันและแก้ไขครบวงจร</span></div>
      <div><strong>Parts</strong><span>อะไหล่และเอกสารประจำรุ่น</span></div>
      <div><strong>LINE</strong><span>ติดต่อทีมบริการได้สะดวก</span></div>
    </div>
  </div>
</section>
'),

  -- 2) About / Vision & Mission
  (v_page_id, 'ch-about', 'custom-html', 1, true, '
<section class="ch-about ch-section" id="about">
  <div class="ch-shell ch-about-grid">
    <div class="ch-about-media">
      <img src="raw/assets/assets/about-vision-v3.png" alt="ทีมผู้เชี่ยวชาญ CPSS วางแผนดูแลเครื่องชงกาแฟและระบบทำความเย็น" />
      <div><b>CPSS</b><span>Vision in action.<br>Service with purpose.</span></div>
    </div>
    <div class="ch-about-copy">
      <p class="ch-eyebrow ch-eyebrow--light">VISION &amp; MISSION</p>
      <h2>มาตรฐานที่แข็งแรง<br>บริการที่แม่นยำ</h2>
      <p class="ch-lead">ก่อตั้งในปี 2564 เพื่อให้บริการบริหารจัดการ ติดตั้ง บำรุงรักษา และซ่อมแซมอุปกรณ์เครื่องเย็นและเครื่องชงกาแฟสำหรับลูกค้าธุรกิจ</p>
      <div class="ch-vision-mission">
        <article>
          <small>VISION</small>
          <h3>วิสัยทัศน์</h3>
          <p>มุ่งเป็นผู้นำด้านโซลูชันระบบทำความเย็นและอุปกรณ์กาแฟครบวงจร ที่ลูกค้าไว้วางใจสูงสุด</p>
        </article>
        <article>
          <small>MISSION</small>
          <h3>พันธกิจ</h3>
          <p>ส่งมอบบริการมืออาชีพ รวดเร็ว แม่นยำ พัฒนาอย่างต่อเนื่อง และสร้างความสัมพันธ์ที่ยั่งยืน</p>
        </article>
      </div>
    </div>
  </div>
</section>
'),

  -- 3) Services
  (v_page_id, 'ch-services', 'custom-html', 2, true, '
<section class="ch-services ch-section" id="services">
  <div class="ch-shell">
    <div class="ch-section-heading">
      <div>
        <p class="ch-eyebrow">OUR SERVICES</p>
        <h2>งานบริการที่ธุรกิจ<br>วางใจได้</h2>
      </div>
    </div>
    <div class="ch-service-grid">
      <article class="ch-service-card">
        <div class="ch-service-photo"><img src="raw/assets/assets/service-coffee-v2.png" alt="ซ่อมแซมเครื่องชงกาแฟ" /><span>01</span></div>
        <div class="ch-service-content">
          <small>CM</small>
          <h3>ซ่อมแซมเครื่องชงกาแฟ</h3>
          <p>วิเคราะห์อาการ ซ่อมระบบ Auto และ Traditional รวมถึงเครื่องบดและระบบน้ำ</p>
          <a href="#contact">ขอรับบริการ <b>→</b></a>
        </div>
      </article>
      <article class="ch-service-card">
        <div class="ch-service-photo"><img src="raw/assets/assets/service-cold-v2.png" alt="ซ่อมระบบทำความเย็น" /><span>02</span></div>
        <div class="ch-service-content">
          <small>COLD</small>
          <h3>ซ่อมระบบทำความเย็น</h3>
          <p>ตู้แช่เย็น ตู้แช่แข็ง เครื่องปรับอากาศ และเครื่องผลิตน้ำแข็ง</p>
          <a href="#contact">ขอรับบริการ <b>→</b></a>
        </div>
      </article>
      <article class="ch-service-card">
        <div class="ch-service-photo"><img src="raw/assets/assets/service-pm-v2.png" alt="บำรุงรักษาเชิงป้องกัน" /><span>03</span></div>
        <div class="ch-service-content">
          <small>PM</small>
          <h3>บำรุงรักษาเชิงป้องกัน</h3>
          <p>ตรวจเช็คตามรอบ ลดความเสี่ยงจากเครื่องหยุดทำงาน และยืดอายุอุปกรณ์</p>
          <a href="#contact">ขอรับบริการ <b>→</b></a>
        </div>
      </article>
      <article class="ch-service-card">
        <div class="ch-service-photo"><img src="raw/assets/assets/service-install-v2.png" alt="ติดตั้งและทดสอบเครื่อง" /><span>04</span></div>
        <div class="ch-service-content">
          <small>INSTALL</small>
          <h3>ติดตั้งและทดสอบเครื่อง</h3>
          <p>ติดตั้งเครื่องชงกาแฟ ตู้แช่ และอุปกรณ์เชิงพาณิชย์ พร้อมทดสอบระบบ</p>
          <a href="#contact">ขอรับบริการ <b>→</b></a>
        </div>
      </article>
      <article class="ch-service-card">
        <div class="ch-service-photo"><img src="raw/assets/assets/service-overhaul-v2.png" alt="Overhaul และล้างเชิงลึก" /><span>05</span></div>
        <div class="ch-service-content">
          <small>OVERHAUL</small>
          <h3>Overhaul และล้างเชิงลึก</h3>
          <p>ล้างหม้อต้ม ล้างตะกรัน ตรวจสภาพชิ้นส่วน และคืนประสิทธิภาพให้เครื่อง</p>
          <a href="#contact">ขอรับบริการ <b>→</b></a>
        </div>
      </article>
    </div>
  </div>
</section>
'),

  -- 4) Business
  (v_page_id, 'ch-business', 'custom-html', 3, true, '
<section class="ch-business ch-section" id="business">
  <div class="ch-shell">
    <div class="ch-section-heading">
      <div>
        <p class="ch-eyebrow">OUR BUSINESS</p>
        <h2>เข้าใจอุปกรณ์<br>เข้าใจธุรกิจ</h2>
      </div>
      <p>ออกแบบการดูแลให้เหมาะกับรูปแบบการใช้งานของลูกค้าองค์กร ร้านค้า ร้านกาแฟ และระบบจำหน่ายอัตโนมัติ</p>
    </div>
    <div class="ch-business-grid">
      <article>
        <span>01</span>
        <img src="raw/assets/assets/display-freezers.png" alt="ตู้แช่ในร้านค้าปลีก" />
        <h3>Lotus''s</h3>
        <p>Service PM &amp; CM สำหรับตู้แช่ เครื่องปรับอากาศ เครื่องผลิตน้ำแข็ง และอุปกรณ์หน้าร้าน</p>
      </article>
      <article>
        <span>02</span>
        <img src="raw/assets/assets/service-coffee-v2.png" alt="ช่างดูแลเครื่องชงกาแฟ" />
        <h3>Coffee Business</h3>
        <p>ดูแลเครื่องชงกาแฟ เครื่องบด เครื่องปั่น เครื่องชงชา และระบบสนับสนุนร้านกาแฟ</p>
      </article>
      <article>
        <span>03</span>
        <img src="raw/assets/assets/vending-lotus-v3.png" alt="ทีมช่างดูแลตู้จำหน่ายสินค้าและกาแฟอัตโนมัติ" />
        <h3>Vending Machine</h3>
        <p>ตรวจเช็ค ซ่อมแซม และวางแผนบำรุงรักษาเครื่องจำหน่ายสินค้าอัตโนมัติ</p>
      </article>
      <article>
        <span>04</span>
        <img src="raw/assets/assets/service-overhaul-v2.png" alt="อะไหล่และชิ้นส่วนเครื่องชงกาแฟ" />
        <h3>Spare Parts</h3>
        <p>จำหน่ายอะไหล่เครื่องชงกาแฟ เครื่องบด และอุปกรณ์กาแฟ พร้อมเอกสาร Exploded View</p>
        <a href="#">ดูคลังเอกสารอะไหล่ →</a>
      </article>
    </div>
  </div>
</section>
'),

  -- 5) Spare parts teaser
  (v_page_id, 'ch-parts-teaser', 'custom-html', 4, true, '
<section class="ch-parts-teaser ch-section">
  <div class="ch-shell ch-parts-teaser-grid">
    <div>
      <p class="ch-eyebrow ch-eyebrow--light">COFFEE MACHINE SPARE PARTS</p>
      <h2>อะไหล่ตรงรุ่น<br>พร้อมเอกสารตรวจสอบ</h2>
      <p>จำหน่ายอะไหล่สำหรับเครื่องชงกาแฟและเครื่องบดหลายรุ่น พร้อมแคตตาล็อกและ Exploded View สำหรับตรวจสอบตำแหน่งชิ้นส่วนก่อนสั่งซื้อ</p>
      <a class="ch-button ch-button--white" href="#">เปิดคลังเอกสารอะไหล่</a>
    </div>
    <div class="ch-parts-preview">
      <img src="raw/assets/spare-covers/cover-01.jpg" alt="ตัวอย่างเอกสารอะไหล่เครื่องชงกาแฟ" />
      <img src="raw/assets/spare-covers/cover-05.jpg" alt="ตัวอย่าง Exploded View เครื่องชงกาแฟ" />
    </div>
  </div>
</section>
'),

  -- 6) Nationwide network / map
  (v_page_id, 'ch-centers', 'custom-html', 5, true, '
<section class="ch-centers ch-section" id="centers">
  <div class="ch-shell ch-centers-map-grid">
    <div class="ch-map-card">
      <img src="raw/assets/assets/service-map-v2.png" alt="แผนที่ประเทศไทยแบ่งสี 5 ภูมิภาคและแสดงจังหวัดที่มีทีมช่าง CPSS" />
      <span>● หมุดเรืองแสงแสดงจังหวัดที่มีทีมช่าง CPSS</span>
    </div>
    <div>
      <p class="ch-eyebrow ch-eyebrow--light">NATIONWIDE NETWORK</p>
      <h2>ทีมช่างครอบคลุม<br>5 ภูมิภาค</h2>
      <p class="ch-center-intro">ทีมประสานงานจะจัดช่างให้เหมาะกับประเภทเครื่อง ระยะทาง และความเร่งด่วนของหน้างาน</p>
      <div class="ch-region-list">
        <article><h3>กรุงเทพฯ และภาคกลาง</h3><p>กรุงเทพมหานคร · นครปฐม · สุพรรณบุรี</p></article>
        <article><h3>ภาคเหนือ</h3><p>เชียงใหม่ · กำแพงเพชร · พะเยา</p></article>
        <article><h3>ภาคตะวันออก</h3><p>ระยอง · ชลบุรี</p></article>
        <article><h3>ภาคตะวันออกเฉียงเหนือ</h3><p>นครราชสีมา · ขอนแก่น · ยโสธร · อุดรธานี</p></article>
        <article><h3>ภาคใต้</h3><p>นครศรีธรรมราช · สุราษฎร์ธานี · หาดใหญ่ (สงขลา)</p></article>
      </div>
    </div>
  </div>
</section>
'),

  -- 7) Contact / request form
  (v_page_id, 'ch-contact', 'custom-html', 6, true, '
<section class="ch-contact ch-section" id="contact">
  <div class="ch-shell ch-contact-grid">
    <div class="ch-contact-info">
      <p class="ch-eyebrow ch-eyebrow--light">CONTACT CPSS</p>
      <h2>แจ้งรายละเอียด<br>ผ่าน LINE</h2>
      <p>กรอกข้อมูลแล้วระบบจะเปิด LINE Official ของ CPSS พร้อมคัดลอกข้อความแจ้งงานไว้ให้ เพียงวางข้อความในแชตและกดส่ง</p>
      <div class="ch-contact-lines">
        <a href="tel:0944560660"><small>SERVICE HOTLINE</small><strong>094-456-0660</strong></a>
        <a href="https://line.me/R/ti/p/@033tlaat" target="_blank" rel="noopener"><small>LINE OFFICIAL</small><strong>@033tlaat</strong></a>
        <a href="mailto:cpsscenter@cpbf.co.th"><small>EMAIL</small><strong>cpsscenter@cpbf.co.th</strong></a>
      </div>
    </div>
    <form class="ch-request-form" id="cpssServiceRequestForm">
      <div class="ch-form-title"><span>REQUEST SERVICE VIA LINE</span><b>01</b></div>
      <div class="ch-form-grid">
        <label>ชื่อผู้ติดต่อ *<input required placeholder="ชื่อ–นามสกุล" name="name" id="cpssReqName" /></label>
        <label>เบอร์โทรศัพท์ *<input required type="tel" placeholder="08x-xxx-xxxx" name="phone" id="cpssReqPhone" /></label>
        <label>บริษัท / ร้านค้า<input placeholder="ชื่อบริษัทหรือสาขา" name="company" id="cpssReqCompany" /></label>
        <label>ประเภทเครื่อง *
          <select required name="equipment" id="cpssReqEquipment">
            <option value="" disabled selected>เลือกประเภทเครื่อง</option>
            <option>ตู้แช่ / ตู้เย็น</option>
            <option>เครื่องปรับอากาศ</option>
            <option>เครื่องผลิตน้ำแข็ง</option>
            <option>เครื่องชงกาแฟ / เครื่องบด</option>
            <option>เครื่องปั่น / เครื่องชงชา</option>
            <option>Vending Machine</option>
            <option>สั่งซื้ออะไหล่</option>
            <option>อื่น ๆ</option>
          </select>
        </label>
        <label class="ch-full">จังหวัด / สถานที่หน้างาน *<input required placeholder="ระบุจังหวัดและสถานที่" name="location" id="cpssReqLocation" /></label>
        <label class="ch-full">อาการและรายละเอียดงาน *<textarea required name="detail" id="cpssReqDetail" placeholder="อาการ รุ่นและจำนวนเครื่อง หรือรหัสอะไหล่ที่ต้องการ"></textarea></label>
      </div>
      <button class="ch-button ch-submit" type="submit">ส่งข้อมูลผ่าน LINE →</button>
      <p class="ch-form-status" id="cpssReqStatus"></p>
      <small class="ch-privacy">เพื่อความเป็นส่วนตัว ระบบจะไม่ส่งข้อมูลจนกว่าคุณจะยืนยันในแชต LINE</small>
    </form>
  </div>
</section>
');

end $$;
