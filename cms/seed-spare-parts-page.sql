-- CPSS — เนื้อหาเพจ "Spare part" (คลังเอกสารอะไหล่เครื่องชงกาแฟ) อ้างอิงดีไซน์จาก
-- https://cpss-service-th.pawinee-patch.chatgpt.site/spare-parts
--
-- 3 section ด้านล่างคือ 3 แถวใน page_sections (layout='custom-html') ผูกกับเพจ page_key='spare-part'
-- (แถวนี้ถูกสร้างให้อัตโนมัติแล้วโดย backfillMissingPages() ใน cms/pages.js ตอนเปิด cms/pages.html
-- ครั้งแรกหลังสร้างเมนู "Spare part" ใต้ "ธุรกิจของเรา") — จัดการได้ทั้งหมดผ่าน cms/page-editor.html
-- (เปิดเพจ "Spare part"): แก้โค้ด HTML, สลับลำดับ, ปิด/เปิดใช้งาน, ลบทิ้ง
--
-- รูปหน้าปกอ้างอิง raw/assets/spare-covers/cover-01.jpg ถึง cover-15.jpg และไฟล์ PDF จริงใน
-- raw/assets/spare-parts/ (เปลี่ยนชื่อโฟลเดอร์จาก "spare-parts copy" เป็น "spare-parts" แล้ว) —
-- ปุ่มคลิกเลือกเอกสารทำงานผ่าน spare-parts-library.js (ไฟล์ใหม่ที่ root ของเว็บ ต้อง include ใน
-- promo.html ด้วย — ดูหมายเหตุท้ายไฟล์นี้)
--
-- ปลอดภัยรันซ้ำได้ (ลบ 3 แถวเดิมที่ anchor_id ตรงกันก่อน insert ใหม่ทุกครั้ง)

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from pages where page_key = 'spare-part';
  if v_page_id is null then
    raise exception 'ไม่พบเพจ page_key=''spare-part'' — ต้องเปิด cms/pages.html ให้ backfillMissingPages() สร้างเพจนี้ก่อน (ผูกกับเมนู "Spare part" ใต้ "ธุรกิจของเรา")';
  end if;

  delete from page_sections
    where page_id = v_page_id
      and anchor_id in ('ch-spare-hero', 'ch-spare-library', 'ch-parts-cta');

  insert into page_sections (page_id, anchor_id, layout, sort_order, is_active, body_th) values

  -- 1) Hero
  (v_page_id, 'ch-spare-hero', 'custom-html', 0, true, '
<section class="ch-spare-hero">
  <div class="ch-shell">
    <p class="ch-eyebrow ch-eyebrow--light">SPARE PARTS LIBRARY</p>
    <h1>เอกสารอะไหล่<br><span>เครื่องชงกาแฟ</span></h1>
    <p>เลือกดูแคตตาล็อกและ Exploded View แต่ละรุ่น เพื่อระบุชิ้นส่วนก่อนสอบถามราคาและสั่งซื้อกับ CPSS</p>
    <div class="ch-hero-actions">
      <a class="ch-button" href="https://line.me/R/ti/p/@033tlaat" target="_blank" rel="noopener">สอบถามอะไหล่ทาง LINE</a>
      <a class="ch-button ch-button--ghost" href="index.html#services">กลับไปหน้าบริการ</a>
    </div>
  </div>
</section>
'),

  -- 2) Document library + PDF preview (interactive — คลิกการ์ดสลับพรีวิวขวา ผ่าน spare-parts-library.js)
  (v_page_id, 'ch-spare-library', 'custom-html', 1, true, '
<section class="ch-spare-library ch-section">
  <div class="ch-shell">
    <div class="ch-section-heading">
      <div>
        <p class="ch-eyebrow">DOCUMENT PREVIEW</p>
        <h2>เลือกเอกสารตามรุ่น</h2>
      </div>
      <p>พรีวิวเอกสารได้ทันที หรือเปิดไฟล์ PDF เต็มในแท็บใหม่เพื่อค้นหาและขยายรายละเอียดชิ้นส่วน</p>
    </div>
    <div class="ch-document-layout">
      <div class="ch-document-grid" id="sparePartsDocGrid">
        <button type="button" class="ch-document-card is-selected" data-pdf="raw/assets/spare-parts/Ascaso%20Dream%20Zero%20Exploded%20View.pdf" data-brand="ASCASO" data-name="Ascaso Dream Zero">
          <img src="raw/assets/spare-covers/cover-01.jpg" alt="หน้าปก Ascaso Dream Zero" />
          <span><small>ASCASO</small><strong>Ascaso Dream Zero</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/CASADIO%20UNDICI%20COMPACT%20-%20SP%20Catalog.pdf" data-brand="CASADIO" data-name="Casadio Undici Compact">
          <img src="raw/assets/spare-covers/cover-02.jpg" alt="หน้าปก Casadio Undici Compact" />
          <span><small>CASADIO</small><strong>Casadio Undici Compact</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/Classe%205%20USB%20Exploded%20View.pdf" data-brand="RANCILIO" data-name="Classe 5 USB">
          <img src="raw/assets/spare-covers/cover-03.jpg" alt="หน้าปก Classe 5 USB" />
          <span><small>RANCILIO</small><strong>Classe 5 USB</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/Despiece_SAECO-PERFETTA_2019-09.pdf" data-brand="SAECO" data-name="Saeco Perfetta">
          <img src="raw/assets/spare-covers/cover-04.jpg" alt="หน้าปก Saeco Perfetta" />
          <span><small>SAECO</small><strong>Saeco Perfetta</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/Egro%20One%20Exploded%20View%20updated%2007.09.17.pdf" data-brand="EGRO" data-name="Egro One">
          <img src="raw/assets/spare-covers/cover-05.jpg" alt="หน้าปก Egro One" />
          <span><small>EGRO</small><strong>Egro One</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/HK-K96L%20Explosive%20View.pdf" data-brand="HK" data-name="HK-K96L">
          <img src="raw/assets/spare-covers/cover-06.jpg" alt="หน้าปก HK-K96L" />
          <span><small>HK</small><strong>HK-K96L</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/LA%20DECISA%20EXPLODED%20VIEW.pdf" data-brand="GAGGIA" data-name="La Decisa">
          <img src="raw/assets/spare-covers/cover-07.jpg" alt="หน้าปก La Decisa" />
          <span><small>GAGGIA</small><strong>La Decisa</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/M12%20Exploded%20View%20V1-20201021.pdf" data-brand="M12" data-name="M12">
          <img src="raw/assets/spare-covers/cover-08.jpg" alt="หน้าปก M12" />
          <span><small>M12</small><strong>M12</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/MDX%20ON%20DEMAND%202018_06.pdf" data-brand="NUOVA SIMONELLI" data-name="MDX On Demand">
          <img src="raw/assets/spare-covers/cover-09.jpg" alt="หน้าปก MDX On Demand" />
          <span><small>NUOVA SIMONELLI</small><strong>MDX On Demand</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/Necta_Kalea_SpareParts.pdf" data-brand="NECTA" data-name="Necta Kalea">
          <img src="raw/assets/spare-covers/cover-10.jpg" alt="หน้าปก Necta Kalea" />
          <span><small>NECTA</small><strong>Necta Kalea</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/Rancilio%20KYRO%2065OD%20Exploded%20View.pdf" data-brand="RANCILIO" data-name="Rancilio Kyro 65 OD">
          <img src="raw/assets/spare-covers/cover-11.jpg" alt="หน้าปก Rancilio Kyro 65 OD" />
          <span><small>RANCILIO</small><strong>Rancilio Kyro 65 OD</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/SP%20APPIA%20LIFE%202-3GR%20UpdateCode.CPB_F.pdf" data-brand="NUOVA SIMONELLI" data-name="Appia Life 2-3 Group">
          <img src="raw/assets/spare-covers/cover-12.jpg" alt="หน้าปก Appia Life 2-3 Group" />
          <span><small>NUOVA SIMONELLI</small><strong>Appia Life 2-3 Group</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/SP%20MDXS%20DOSER%202021_03.pdf" data-brand="NUOVA SIMONELLI" data-name="MDXS Doser">
          <img src="raw/assets/spare-covers/cover-13.jpg" alt="หน้าปก MDXS Doser" />
          <span><small>NUOVA SIMONELLI</small><strong>MDXS Doser</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/SP%20MDXS%20OD%20NS%202020_11.pdf" data-brand="NUOVA SIMONELLI" data-name="MDXS On Demand">
          <img src="raw/assets/spare-covers/cover-14.jpg" alt="หน้าปก MDXS On Demand" />
          <span><small>NUOVA SIMONELLI</small><strong>MDXS On Demand</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
        <button type="button" class="ch-document-card" data-pdf="raw/assets/spare-parts/SP%20OSCAR%20II%202022_03.pdf" data-brand="NUOVA SIMONELLI" data-name="Oscar II">
          <img src="raw/assets/spare-covers/cover-15.jpg" alt="หน้าปก Oscar II" />
          <span><small>NUOVA SIMONELLI</small><strong>Oscar II</strong><em>พรีวิวเอกสาร →</em></span>
        </button>
      </div>
      <aside class="ch-pdf-preview">
        <div>
          <span><small id="sparePartsPreviewBrand">ASCASO</small><strong id="sparePartsPreviewName">Ascaso Dream Zero</strong></span>
          <a id="sparePartsPreviewLink" href="raw/assets/spare-parts/Ascaso%20Dream%20Zero%20Exploded%20View.pdf" target="_blank" rel="noopener">เปิด PDF เต็ม ↗</a>
        </div>
        <iframe id="sparePartsPreviewFrame" title="พรีวิวเอกสาร Ascaso Dream Zero" src="raw/assets/spare-parts/Ascaso%20Dream%20Zero%20Exploded%20View.pdf#view=FitH"></iframe>
      </aside>
    </div>
  </div>
</section>
'),

  -- 3) Bottom CTA
  (v_page_id, 'ch-parts-cta', 'custom-html', 2, true, '
<section class="ch-parts-cta">
  <div class="ch-shell">
    <div>
      <p class="ch-eyebrow ch-eyebrow--light">NEED A PART?</p>
      <h2>ส่งรุ่นเครื่องหรือรหัสอะไหล่<br>ให้ทีม CPSS ตรวจสอบ</h2>
    </div>
    <a class="ch-button ch-button--white" href="https://line.me/R/ti/p/@033tlaat" target="_blank" rel="noopener">LINE @033tlaat</a>
  </div>
</section>
');

end $$;

-- เพจ "หน้าแรก" มี 2 ลิงก์ที่เคยใส่ href="#" ไว้ชั่วคราว (ยังไม่มีเพจ spare-part ตอนนั้น) — แก้ให้ชี้ไปเพจนี้จริง
-- ตอนนี้ (การ์ด "Spare Parts" ใน section ธุรกิจของเรา + ปุ่ม "เปิดคลังเอกสารอะไหล่" ใน section parts-teaser)
-- ปลอดภัยรันซ้ำได้ (no-op ถ้าแก้ไปแล้ว เพราะ href="#" จะไม่แมตช์อีก)
update page_sections
  set body_th = replace(body_th, 'href="#">ดูคลังเอกสารอะไหล่', 'href="spare-part.html">ดูคลังเอกสารอะไหล่')
  where anchor_id = 'ch-business' and body_th like '%href="#">ดูคลังเอกสารอะไหล่%';

update page_sections
  set body_th = replace(body_th, 'href="#">เปิดคลังเอกสารอะไหล่', 'href="spare-part.html">เปิดคลังเอกสารอะไหล่')
  where anchor_id = 'ch-parts-teaser' and body_th like '%href="#">เปิดคลังเอกสารอะไหล่%';
