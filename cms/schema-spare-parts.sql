-- CPSS CMS — Spare Parts Library schema (จัดการเอกสาร PDF ที่แสดงในหน้า spare-part.html)
-- รันหลัง schema.sql (ต้องมี extension pgcrypto + function set_updated_at() อยู่แล้ว จากการรัน
-- cms/migration-cpss-fresh.sql ไปแล้ว) และรันหลัง cms/seed-spare-parts-page.sql เสมอ (ไฟล์นี้มี UPDATE
-- ท้ายไฟล์ที่ต้องการให้ page_sections ของเพจ spare-part มีอยู่ก่อนแล้ว — ถ้ารันสลับลำดับ UPDATE นั้นจะ
-- แค่ไม่มีผล ไม่ error) — วางใน SQL Editor แล้ว Run ครั้งเดียว ปลอดภัยรันซ้ำได้ (idempotent)

create table if not exists spare_parts_documents (
  id uuid primary key default gen_random_uuid(),
  brand text not null default '',
  title text not null,
  description text default '',
  cover_image text default '',
  pdf_url text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists spare_parts_documents_sort_order_idx on spare_parts_documents (sort_order);

drop trigger if exists spare_parts_documents_set_updated_at on spare_parts_documents;
create trigger spare_parts_documents_set_updated_at
  before update on spare_parts_documents
  for each row
  execute function set_updated_at();

-- RLS: อ่านได้แบบสาธารณะ (หน้า spare-part.html ต้องดึงเอกสารไปแสดง) แก้ไข/เพิ่ม/ลบได้เฉพาะ login แล้วเท่านั้น
alter table spare_parts_documents enable row level security;

drop policy if exists "public can read spare_parts_documents" on spare_parts_documents;
create policy "public can read spare_parts_documents"
  on spare_parts_documents for select
  using (true);

drop policy if exists "authenticated can insert spare_parts_documents" on spare_parts_documents;
create policy "authenticated can insert spare_parts_documents"
  on spare_parts_documents for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update spare_parts_documents" on spare_parts_documents;
create policy "authenticated can update spare_parts_documents"
  on spare_parts_documents for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete spare_parts_documents" on spare_parts_documents;
create policy "authenticated can delete spare_parts_documents"
  on spare_parts_documents for delete
  to authenticated
  using (true);

-- ย้ายข้อมูล 15 เอกสารเดิมที่เคย hardcode ไว้ใน cms/seed-spare-parts-page.sql (custom-html แบบ static)
-- เข้าตารางนี้ ให้จัดการผ่าน CMS ได้ทันที (ไฟล์ PDF/รูปหน้าปกยังอยู่ที่เดิม ไม่ต้องอัปโหลดใหม่)
-- ปลอดภัยรันซ้ำได้ (ลบของเดิมที่ title ตรงกันก่อน insert ใหม่ — เฉพาะตอนที่ตารางยังว่างอยู่เท่านั้น
-- เช็คด้วย "on conflict do nothing" ไม่ได้เพราะไม่มี unique constraint บน title ตั้งใจ ให้แก้ไขซ้ำได้อิสระ
-- ผ่าน CMS — ใช้ where not exists กันการ insert ซ้ำจากการรัน migration นี้ซ้ำแทน)
insert into spare_parts_documents (brand, title, description, cover_image, pdf_url, sort_order, is_active)
select * from (values
  ('ASCASO', 'Ascaso Dream Zero', '', 'raw/assets/spare-covers/cover-01.jpg', 'raw/assets/spare-parts/Ascaso%20Dream%20Zero%20Exploded%20View.pdf', 0, true),
  ('CASADIO', 'Casadio Undici Compact', '', 'raw/assets/spare-covers/cover-02.jpg', 'raw/assets/spare-parts/CASADIO%20UNDICI%20COMPACT%20-%20SP%20Catalog.pdf', 1, true),
  ('RANCILIO', 'Classe 5 USB', '', 'raw/assets/spare-covers/cover-03.jpg', 'raw/assets/spare-parts/Classe%205%20USB%20Exploded%20View.pdf', 2, true),
  ('SAECO', 'Saeco Perfetta', '', 'raw/assets/spare-covers/cover-04.jpg', 'raw/assets/spare-parts/Despiece_SAECO-PERFETTA_2019-09.pdf', 3, true),
  ('EGRO', 'Egro One', '', 'raw/assets/spare-covers/cover-05.jpg', 'raw/assets/spare-parts/Egro%20One%20Exploded%20View%20updated%2007.09.17.pdf', 4, true),
  ('HK', 'HK-K96L', '', 'raw/assets/spare-covers/cover-06.jpg', 'raw/assets/spare-parts/HK-K96L%20Explosive%20View.pdf', 5, true),
  ('GAGGIA', 'La Decisa', '', 'raw/assets/spare-covers/cover-07.jpg', 'raw/assets/spare-parts/LA%20DECISA%20EXPLODED%20VIEW.pdf', 6, true),
  ('M12', 'M12', '', 'raw/assets/spare-covers/cover-08.jpg', 'raw/assets/spare-parts/M12%20Exploded%20View%20V1-20201021.pdf', 7, true),
  ('NUOVA SIMONELLI', 'MDX On Demand', '', 'raw/assets/spare-covers/cover-09.jpg', 'raw/assets/spare-parts/MDX%20ON%20DEMAND%202018_06.pdf', 8, true),
  ('NECTA', 'Necta Kalea', '', 'raw/assets/spare-covers/cover-10.jpg', 'raw/assets/spare-parts/Necta_Kalea_SpareParts.pdf', 9, true),
  ('RANCILIO', 'Rancilio Kyro 65 OD', '', 'raw/assets/spare-covers/cover-11.jpg', 'raw/assets/spare-parts/Rancilio%20KYRO%2065OD%20Exploded%20View.pdf', 10, true),
  ('NUOVA SIMONELLI', 'Appia Life 2-3 Group', '', 'raw/assets/spare-covers/cover-12.jpg', 'raw/assets/spare-parts/SP%20APPIA%20LIFE%202-3GR%20UpdateCode.CPB_F.pdf', 11, true),
  ('NUOVA SIMONELLI', 'MDXS Doser', '', 'raw/assets/spare-covers/cover-13.jpg', 'raw/assets/spare-parts/SP%20MDXS%20DOSER%202021_03.pdf', 12, true),
  ('NUOVA SIMONELLI', 'MDXS On Demand', '', 'raw/assets/spare-covers/cover-14.jpg', 'raw/assets/spare-parts/SP%20MDXS%20OD%20NS%202020_11.pdf', 13, true),
  ('NUOVA SIMONELLI', 'Oscar II', '', 'raw/assets/spare-covers/cover-15.jpg', 'raw/assets/spare-parts/SP%20OSCAR%20II%202022_03.pdf', 14, true)
) as seed(brand, title, description, cover_image, pdf_url, sort_order, is_active)
where not exists (select 1 from spare_parts_documents);

-- แทนที่การ์ดเอกสาร 15 อัน (static hardcode) ใน section "ch-spare-library" ของเพจ spare-part ด้วยกริดว่าง
-- เปล่า — ตอนนี้ spare-parts-library.js (เขียนใหม่แล้ว) จะดึงรายการจริงจากตาราง spare_parts_documents
-- ข้างบนมาสร้างการ์ดเองแทน ทำให้แก้ไข/เพิ่ม/ลบ/จัดลำดับเอกสารผ่าน CMS มีผลจริงบนหน้าเว็บทันที
-- (เดิมต้องแก้โค้ด HTML ของ section ตรงๆ ผ่าน cms/page-editor.html ถึงจะเปลี่ยนรายการเอกสารได้)
-- ปลอดภัยรันซ้ำได้ (เขียนทับ body_th เดิมทุกครั้งที่รัน)
update page_sections
set body_th = '
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
      <div class="ch-document-grid" id="sparePartsDocGrid"></div>
      <aside class="ch-pdf-preview">
        <div>
          <span><small id="sparePartsPreviewBrand"></small><strong id="sparePartsPreviewName"></strong></span>
          <a id="sparePartsPreviewLink" href="#" target="_blank" rel="noopener">เปิด PDF เต็ม ↗</a>
        </div>
        <iframe id="sparePartsPreviewFrame" title="พรีวิวเอกสาร"></iframe>
      </aside>
    </div>
  </div>
</section>
'
where anchor_id = 'ch-spare-library'
  and page_id = (select id from pages where page_key = 'spare-part');
