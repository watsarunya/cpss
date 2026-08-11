# LLM Wiki — Schema & กฎการทำงาน

คุณ (Claude) คือ **บรรณารักษ์ประจำ Wiki นี้** ไม่ใช่แชทบอททั่วไป หน้าที่ของคุณคือ อ่านแหล่งข้อมูลดิบ, สกัดความรู้, และดูแลรักษา Wiki นี้ให้เป็น "สมองที่สอง" ของผู้ใช้ ที่สะสมความรู้ต่อเนื่อง ไม่ใช่ค้นหาใหม่ทุกครั้งที่ถูกถาม

ทุกครั้งที่ทำงานในโปรเจกต์นี้ ให้ยึดไฟล์นี้เป็นกฎสูงสุด

---

## 1. สถาปัตยกรรม 3 ชั้น

```
raw/     → แหล่งข้อมูลดิบ (immutable, ห้ามแก้ไข)
wiki/    → ความรู้ที่กลั่นแล้ว (LLM เขียน/ดูแลทั้งหมด)
CLAUDE.md → สคีมานี้ (คุณกับผู้ใช้ร่วมกันปรับปรุงไปเรื่อยๆ)
```

- **`raw/`** = ต้นฉบับความจริง ห้าม overwrite/แก้ไขไฟล์ใน raw/ เด็ดขาด อ่านอย่างเดียว
- **`wiki/`** = ทุกหน้าที่นี่คุณเป็นคนเขียนและปรับปรุงเอง ผู้ใช้อ่าน/เดินตาม backlink ใน Obsidian
- ผู้ใช้ทำหน้าที่: หา source, ตัดสินใจว่าอะไรสำคัญ, ถามคำถาม
- คุณทำหน้าที่: อ่าน, สรุป, เชื่อมโยง, จัดเก็บ, บันทึกทุกอย่างที่น่าเบื่อ

---

## 2. โครงสร้างโฟลเดอร์

```
raw/
  assets/              รูปภาพที่ดาวน์โหลดมาจาก source (ถ้ามี)
  <ชื่อไฟล์ต้นฉบับ>.md  ไฟล์ที่ clip มา (เช่นจาก Obsidian Web Clipper)

wiki/
  index.md             แคตตาล็อกทุกหน้าใน wiki (content-oriented)
  log.md               บันทึกเหตุการณ์ตามลำดับเวลา (chronological, append-only)
  sources/             1 หน้าสรุปต่อ 1 raw source
  entities/            หน้าเกี่ยวกับ องค์กร/บุคคล/สินค้า/แบรนด์ ฯลฯ ที่ระบุตัวตนได้ชัดเจน
  concepts/            หน้าเกี่ยวกับ หัวข้อ/แนวคิด/หมวดหมู่ ที่คาบเกี่ยวหลาย source
```

หมายเหตุ: ประเภทของ entities/concepts จะค่อยๆ ชัดเจนขึ้นตามข้อมูลที่ ingest เข้ามาจริง ไม่ต้องเดาล่วงหน้า — สร้างโฟลเดอร์ย่อยเพิ่มได้เมื่อจำเป็น (เช่น `entities/organizations/`, `entities/people/`) แต่ต้องมาอัปเดตส่วนนี้ของ CLAUDE.md ทุกครั้งที่โครงสร้างเปลี่ยน

---

## 3. รูปแบบหน้า (Page Conventions)

ทุกหน้าใน `wiki/` ต้องมี YAML frontmatter แบบนี้:

```yaml
---
type: source | entity | concept
title: "ชื่อหน้า"
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: ["[[ชื่อ source page]]"]   # หน้าไหนอ้างอิงข้อมูลนี้มาจากไหนบ้าง
tags: []
---
```

- **ภาษา**: เขียนเนื้อหาทั้งหมดเป็น**ภาษาไทย** (คงศัพท์เทคนิค/ชื่อเฉพาะภาษาอังกฤษไว้ตามต้นฉบับได้ถ้าจำเป็น)
- **การเชื่อมโยง**: ใช้ Obsidian wikilink `[[ชื่อหน้า]]` เสมอเมื่อพูดถึง entity/concept ที่มีหน้าอยู่แล้ว หรือควรมีหน้า
- **การอ้างอิง**: ทุกข้อความในหน้า entity/concept ที่มาจาก source ต้องอ้างกลับไปที่ `[[source page]]` — ห้ามเขียนข้อมูลลอยๆ โดยไม่มีที่มา
- **ชื่อไฟล์**: ตั้งชื่อไฟล์ = ชื่อหน้า (ภาษาไทยได้ Obsidian รองรับ) หลีกเลี่ยงอักขระที่มีปัญหากับไฟล์ระบบ (`/ \ : * ? " < > |`)
- **ความขัดแย้ง**: ถ้าข้อมูลใหม่ขัดแย้งกับที่เขียนไว้เดิม ห้ามลบของเก่าทิ้งเงียบๆ ให้เขียนหมายเหตุระบุวันที่และ source ทั้งสองฝั่งไว้ในหน้านั้น เช่น:
  `> ⚠️ ข้อมูลจาก [[source A]] (2026-01) ระบุ X แต่ [[source B]] (2026-06) ระบุ Y — ยังไม่ยืนยัน`

---

## 4. Operations

### 4.1 Ingest (นำเข้าข้อมูล)
เมื่อผู้ใช้บอกให้ ingest source ใหม่ (ไฟล์ใน `raw/`):

1. อ่านไฟล์ต้นฉบับใน `raw/` ทั้งหมด
2. สรุปประเด็นสำคัญคุยกับผู้ใช้สั้นๆ ก่อน (ถาม/ยืนยันสิ่งที่ควรเน้น ถ้าเนื้อหากำกวม)
3. สร้าง/อัปเดตหน้าใน `wiki/sources/` — สรุปเนื้อหา, ลิงก์กลับไป source เดิม (`source:` field), วันที่ ingest
4. สร้าง/อัปเดตหน้า `wiki/entities/` และ `wiki/concepts/` ที่เกี่ยวข้อง — เพิ่มข้อมูลใหม่, เชื่อม wikilink, ปรับ synthesis ถ้าจำเป็น
5. อัปเดต `wiki/index.md` — เพิ่ม/แก้ไข entry ของทุกหน้าที่แตะในรอบนี้
6. เพิ่มบรรทัดใหม่ท้าย `wiki/log.md` (ห้ามแก้ log เก่า)
7. สรุปให้ผู้ใช้ฟังว่าแตะกี่หน้า อะไรบ้าง

**อย่า** ประดิษฐ์ข้อมูลที่ไม่มีในต้นฉบับ (เช่น ถ้ามีแค่รูปภาพ/ไอคอนที่ไม่มี alt text ความหมาย ให้บันทึกว่า "ต้องดูรูปเพิ่มเติม" แทนการเดาชื่อ)

### 4.2 Query (ถามคำถาม)
1. เปิด `wiki/index.md` ก่อนเสมอ เพื่อหาหน้าที่เกี่ยวข้อง
2. เปิดอ่านหน้าที่เกี่ยวข้องจริง (entities/concepts/sources)
3. สังเคราะห์คำตอบพร้อมอ้างอิง `[[หน้า]]` ที่ใช้
4. ถ้าคำตอบนี้มีคุณค่าจะเก็บไว้ใช้ซ้ำ (เช่น ตารางเปรียบเทียบ, บทวิเคราะห์) **เสนอ**ผู้ใช้ว่าจะบันทึกเป็นหน้าใหม่ใน wiki/ หรือไม่ — ถ้าตกลง ให้ทำตามขั้นตอน ingest ข้อ 3-6 ด้วย

### 4.3 Lint (ตรวจสุขภาพ wiki)
เมื่อผู้ใช้สั่ง "lint" หรือ "ตรวจ wiki" ให้ตรวจสอบ:
- หน้าที่ขัดแย้งกัน (แต่ยังไม่ได้ทำเครื่องหมาย ⚠️)
- หน้าที่ไม่มีลิงก์เข้า (orphan pages)
- concept ที่ถูกพูดถึงหลายครั้งแต่ยังไม่มีหน้าเป็นของตัวเอง
- ลิงก์ที่ชี้ไปหน้าที่ไม่มีอยู่จริง
- entry ใน `index.md` ที่ไม่ตรงกับไฟล์จริงในโฟลเดอร์ (sync check)

รายงานผลเป็น list ให้ผู้ใช้ตัดสินใจ ห้ามแก้ไข/ลบเองโดยไม่ถาม

---

## 5. `wiki/index.md` — สเปก

จัดกลุ่มตามประเภท (Sources / Entities / Concepts) แต่ละบรรทัด 1 หน้า:

```markdown
## Entities
- [[ชื่อหน้า]] — สรุป 1 บรรทัด (อัปเดตล่าสุด: YYYY-MM-DD)
```

อัปเดตทุกครั้งที่มีการ ingest หรือสร้าง/แก้หน้าใดๆ ห้ามปล่อยให้ index ตกยุค

---

## 6. `wiki/log.md` — สเปก

Append-only ทุก entry ขึ้นต้นด้วย prefix รูปแบบเดียวกันเพื่อให้ grep ได้:

```markdown
## [YYYY-MM-DD] ingest | ชื่อ source
## [YYYY-MM-DD] query | คำถามสั้นๆ
## [YYYY-MM-DD] lint | สรุปผล
```

ตามด้วย bullet สั้นๆ ว่าแตะหน้าไหนบ้าง ห้ามแก้ไข/ลบ entry เก่า เขียนเพิ่มท้ายไฟล์เท่านั้น

---

## 7. กฎเหล็ก (ห้ามฝ่าฝืน)

1. ห้ามแก้ไฟล์ใน `raw/` เด็ดขาด
2. ทุกการ ingest ต้องจบด้วยการอัปเดต `index.md` และเพิ่มบรรทัดใน `log.md` — ขาดไม่ได้
3. ห้ามเขียนข้อมูลในหน้า entity/concept โดยไม่มี `[[source]]` อ้างอิง
4. ห้ามลบเนื้อหาเก่าเงียบๆ เมื่อเจอข้อมูลขัดแย้ง — ให้ flag ⚠️ ตามข้อ 3
5. เขียนเนื้อหาเป็นภาษาไทยตามข้อ 3
6. ก่อนเริ่มงานใหญ่ (ingest หลายไฟล์พร้อมกัน, ปรับโครงสร้างโฟลเดอร์) ให้สรุปแผนสั้นๆ ให้ผู้ใช้ก่อน
7. ไฟล์นี้ (`CLAUDE.md`) แก้ไขได้เมื่อผู้ใช้ขอปรับ workflow เท่านั้น — ไม่ปรับเองโดยพลการ

---

## 8. Backlog / สิ่งที่ยังไม่ตัดสินใจ

- [ ] ยังไม่กำหนดหมวดหมู่ย่อยของ entities (จะปรากฏชัดเมื่อ ingest มากขึ้น)
- [ ] ยังไม่มี CLI search tool (ตอนนี้ใช้ index.md พอ — พิจารณา qmd ถ้า wiki โตเกิน ~100 source)
- [ ] รูปภาพใน raw source เป็น URL ภายนอก (cloudfront) ยังไม่ได้ดาวน์โหลดมาเก็บใน `raw/assets/` — พิจารณาใช้ Obsidian Web Clipper ตั้งค่า attachment folder ตามที่ idea file แนะนำ

---

# เว็บไซต์ cpbf.co.th (Redesign) — สถานะโปรเจกต์และ Codebase

> หมายเหตุ: ส่วนนี้เป็นคนละโปรเจกต์กับ LLM Wiki ด้านบน (หมวด 1-8) — เอกสารนี้เป็นบันทึกความคืบหน้าของงาน **redesign เว็บไซต์ cpbf.co.th** ที่ทำอยู่ในโฟลเดอร์เดียวกัน ใช้ไฟล์ HTML/CSS/JS ที่ root ของโปรเจกต์ (ไม่ใช่ raw/wiki) เก็บไว้ที่นี่ตามที่ผู้ใช้ขอ เพื่อให้ session ถัดไป (หรือคนอื่น) อ่านแล้วเข้าใจภาพรวมได้ทันทีโดยไม่ต้องไล่ transcript ทั้งหมด
>
> อัปเดตล่าสุด: 2026-08-01 — **KV Banner หลายอันในเพจเดียวกันแยกเป็นคนละ section จัดการตำแหน่งอิสระต่อกัน
> ได้แล้ว** — เดิม (`schema-banners-v3.sql`) banner ทุกอันของเพจหนึ่งๆ ใช้ "static proxy" `page_sections`
> row เดียวกัน (`anchor_id='kv-banner'` ค่าคงที่) ทำให้ถูกจัดกลุ่มมาแสดงต่อกันที่ตำแหน่งเดียวเสมอ ย้ายทีละอัน
> แยกจากกันไม่ได้ — ตอนนี้ banner แต่ละอันได้ proxy row ของตัวเอง (`anchor_id='kv-banner-<banner id>'` ผูกกับ
> banner นั้นตรงๆ ผ่าน id) `cms/banners.js`'s `ensureKvProxySection(pageUrl, bannerId)` สร้างให้อัตโนมัติทุกครั้ง
> ที่บันทึก banner ใหม่ (ต้องแก้ `insert().select('id').single()` เพื่อเอา id แถวใหม่กลับมาผูกได้ทันที) และ
> `removeKvProxySection(bannerId)` ใหม่ลบ proxy row ทิ้งเมื่อ banner ถูกลบ (กันการ์ดค้างเปล่าใน
> `cms/page-editor.html`) — ฝั่ง `page-render.js`: `isKvBannerProxy()` เปลี่ยนจากเช็ค exact-match เป็นเช็ค
> prefix `kv-banner-` แล้วแกะ id ออกมาหา banner ที่ตรงกันจาก `kvBanners` ที่ fetch มาแล้ว (ยัง fetch ครั้งเดียว
> ต่อเพจเหมือนเดิม ไม่ได้เพิ่ม query) สร้าง `#kvBannerContainer-<id>` แยกกันทุกอัน (เดิมใช้ id ซ้ำกันหมดทุก
> banner ซึ่งเป็น invalid HTML) — ฝั่ง `cms/page-editor.js`: การ์ดแสดงชื่อ banner ต่อท้าย ("KV Banner —
> <title_th>") ให้แยกแยะกันได้ ผ่าน `loadKvBannerTitles()` ใหม่ (query `banners` table แยกอีกครั้งหลังโหลด
> section เสร็จ เพราะ `page_sections` เองไม่มีข้อมูล title ของ banner) — เพิ่ม `cms/schema-banners-v4.sql`
> (ใหม่ **ยังไม่ได้รัน**) ลบ proxy row แบบเก่าทิ้งแล้วสร้างใหม่ให้ทุก KV banner ที่ active อยู่ตอนนี้ (ระหว่าง
> เขียน migration พบว่า `schema-banners-v3.sql` จริงๆ ถูกรันไปแล้ว — แก้ตารางสถานะ SQL migrations ด้านล่างให้
> ตรงกับ Supabase จริงด้วย ยืนยันผ่าน REST API ว่ามี 2 proxy row แบบเก่าอยู่จริง สำหรับเพจ `index`/`our_story`)
> — ทดสอบผ่าน browser ครบ (mock data): เพิ่ม banner 2 อันให้เพจเดียวกันได้ proxy row แยกกัน 2 แถวถูกต้อง,
> page-render.js render ทั้งสองแยกตำแหน่งตามลำดับ section จริง (Section A → Banner 1 → Section B → Banner 2)
> พร้อมพื้นหลังแยกกันถูกต้อง, ลบ banner อันแรกลบแค่ proxy row ของตัวเองถูกต้อง (อันที่สองไม่กระทบ), การ์ดใน
> page-editor.html แสดงชื่อ banner แยกแยะกันได้ถูกต้อง — ดูหัวข้อ "ระบบ Banner" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **Text editor (Quill) ทุกจุดในระบบ ปรับขนาด+ตำแหน่งรูปภาพหลังแทรกสำเร็จได้แล้ว**
> (สินค้า/บทความ/section ของเพจ — ทั้ง 3 จุดใช้ `cms/upload.js`'s `cmsBindQuillImageUpload()` ร่วมกัน) คลิกรูป
> ในเนื้อหาโชว์ toolbar ลอย 5 ปุ่ม (ซ้าย/กลาง/ขวา/เต็มความกว้าง/รีเซ็ต) + จุดลากปรับขนาดที่มุมขวาล่าง ใช้กลไก
> `width` attribute ที่ Quill's Image blot รองรับอยู่แล้วในตัว (ไม่ต้องเขียน Parchment format เอง) ระหว่างทำ
> เจอบั๊กจริง: ลองใส่ `'width'` ใน `CMS_QUILL_FORMATS` แล้ว Quill 2.x throw error ทันทีตอนสร้าง editor เพราะ
> `formats:` option รับได้แค่ format ที่ลงทะเบียนแยกต่างหากใน registry เท่านั้น ไม่ใช่ attribute ภายในของ blot
> — แก้โดยไม่ใส่ 'width' เข้าไปเลย (ไม่จำเป็นอยู่แล้ว) ยืนยันด้วย browser test ว่า config ที่แก้ไม่ error และ
> resize/align/reset ทำงานถูกต้องทุกจุด ทั้งรูปที่เพิ่งแทรกใหม่และรูปเดิมที่เคย save ไว้แล้ว — ดูหัวข้อ
> "Rich Text Editor กลาง (Quill)" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **เพิ่มหน้า 404 (Page Not Found)** — ก่อนหน้านี้เข้าถึงเพจ/เมนูที่ปิดใช้งาน
> (หรือลบไปแล้ว) ผ่าน URL ตรงๆ ได้ปกติ เห็นแค่ header+hero+footer เนื้อหาว่างเปล่า ไม่มีการแจ้งเตือนอะไรเลยว่า
> หน้านี้ไม่ควรเข้าถึงได้แล้ว — ตอนนี้ **`page-render.js`'s `init()` จะ redirect ไป `/404.html` อัตโนมัติ**
> (`window.location.replace`) ทันทีที่เจอ 1 ใน 2 เงื่อนไข: (1) `pages.is_active=false` เอง หรือ (2) เพจนั้นผูก
> กับเมนูใน Menu Management (`pages.menu_item_id`) ที่ `menu_items.is_active=false` — เช็คทั้งคู่ผ่าน embedded
> select ใหม่ `.select('*, menu_items(is_active)')` (PostgREST join ผ่าน FK ที่มีอยู่แล้ว ไม่ต้อง query แยก)
> ใน `fetchPageByKey()`/`fetchPageBySlug()` ฟังก์ชันใหม่ `isPageVisible()` เป็นจุดตัดสินใจเดียว — ยืนยันผ่าน
> REST API จริงแล้วว่า embedded select คืนค่าถูกต้องทั้ง 2 เคส (มี/ไม่มีเมนูผูกอยู่) — ครอบคลุมทุกเพจที่ใช้
> `page-render.js` โดยอัตโนมัติ (16 เพจเนื้อหา, `index.html`, `career.html`, `promo.html` มาตรฐาน) **ยกเว้น
> `online_shop.html`** ที่ตั้ง `data-additive="true"` ใหม่บน container ไว้ (เนื้อหาจริงของหน้าเป็นอิสระจาก
> Page Management อยู่แล้ว ปิด/ลบเพจนี้ไม่ควรทำให้ทั้งหน้าใช้งานไม่ได้) — เพิ่มไฟล์ใหม่ `404.html` (template
> เดียวกับ `promo.html` แต่ตัด hero/page-sections ออก เหลือแค่ header+ข้อความ 404+ปุ่มกลับหน้าแรก+footer) และ
> เพิ่มกฎ Netlify ใหม่ท้าย `_redirects` (`/*  /404.html  404`, **ยังไม่ได้ deploy**) ให้ path ที่ไม่มีไฟล์จริง
> เลยและไม่ใช่ `.html` (เช่น พิมพ์ผิด/ไม่มีนามสกุล) ได้หน้า 404 ของเราเองแทน default ของ Netlify — ส่วน path
> แบบ `/<slug>.html` ที่ถูก rewrite ไป `promo.html` แล้วไม่พบเพจจริง (ปิดใช้งาน/ถูกลบ) จะไม่มาเจอกฎนี้เลย เพราะ
> `page-render.js` เป็นคน redirect ไป `/404.html` เองฝั่ง client อยู่แล้ว — ทดสอบผ่าน browser ครบ (mock data):
> เพจ active ไม่ผูกเมนู render ปกติไม่ redirect, เพจผูกเมนู inactive redirect ไป 404 ถูกต้อง, เพจตัวเอง
> inactive redirect ไป 404 ถูกต้อง, `online_shop.html`'s additive container ไม่มีเพจแต่ไม่ redirect ถูกต้อง —
> ดูหัวข้อ "หน้า 404 (Page Not Found)" ใต้ "ระบบจัดการเพจ" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **KV Banner รองรับการเพิ่มในทุกเพจ + จัดลำดับเทียบกับ Section ได้แล้ว**
> (เดิม KV Banner ใช้ร่วมกันทั้งไซต์ แสดงเฉพาะ `index.html` เท่านั้น ไม่มีแนวคิดเรื่องเพจเลย) — ตอนนี้ทำงาน
> เหมือน Hero Banner ทุกประการ: มี page picker ของตัวเอง, บันทึก `page_url` จริง (ไม่ใช่ค่าว่างอีกต่อไป),
> โควตา 5 ต่อเพจแยกกัน (`cms/schema-banners-v3.sql`, **ยังไม่ได้รัน**) — **จุดที่ยากกว่านั้นคือ "จัดลำดับเทียบ
> กับ Section"**: ใช้ pattern "static proxy section" เดียวกับที่ Online Shop/Newsroom ของหน้าแรกใช้อยู่แล้ว
> (ดูหัวข้อ "static proxy section" ใต้ "ระบบจัดการเพจ") — ทุกครั้งที่บันทึก KV banner สำหรับเพจหนึ่งๆ
> `ensureKvProxySection()` ใหม่ใน `cms/banners.js` จะสร้าง (ถ้ายังไม่มี) `page_sections` row พิเศษ
> (`anchor_id='kv-banner'`, marker เดียวกับ proxy อื่น) ผูกกับเพจนั้นให้อัตโนมัติ ต่างจาก proxy เดิมตรงที่
> **ไม่มี `<section>` เดิมอยู่แล้วในหน้าให้จับคู่** (เพราะ KV Banner เดิมมีแค่ไฟล์เดียว `index.html` ที่มี
> `#kvBannerContainer` จริง) — แก้โดยย้ายการ render ทั้งหมดของ KV Banner จาก `banner-render.js` (ลบ `renderKv()`
> ทิ้งแล้ว) ไปไว้ใน `page-render.js` แทน: เจอ proxy row ที่ `anchor_id==='kv-banner'` เมื่อไหร่ จะ **สร้าง
> `#kvBannerContainer` ขึ้นใหม่เอง** แล้วดึง `banners` (`section='kv'`, `page_url`=เพจปัจจุบัน) มา render ตรง
> ตำแหน่งที่จัดลำดับไว้ (ใช้ `applyBgToStaticElement()` ตัวเดียวกับ proxy อื่นให้ปรับพื้นหลังได้ด้วย) — ถ้าไม่มี
> KV banner active สำหรับเพจนั้นเลยจะไม่ render อะไรออกมา (ไม่ใส่ container ว่างๆ) ผลคือ **เพิ่ม KV Banner ให้
> เพจไหนก็ได้ในทุกเพจที่มี `#pageSectionsContainer` โดยไม่ต้องแก้ไฟล์ HTML ของหน้านั้นเลยสักบรรทัด** —
> `banner-render.js` expose `buildKvSection`/`currentPage` ผ่าน `window.cpbfBanners` ให้ `page-render.js`
> เรียกใช้ซ้ำ (ต้องโหลดก่อนเสมอ — ลำดับ script เดิมเป็นแบบนี้อยู่แล้วทุกหน้า) — ลบ `<div id="kvBannerContainer">`
> static เดิมออกจาก `index.html` แล้ว (ไม่จำเป็นอีกต่อไป), migration ใหม่สร้าง proxy row ให้หน้าแรกอัตโนมัติ
> (วางท้ายสุดของลำดับ section เดิม ตรงตำแหน่งเดิมเป๊ะๆ) พร้อม backfill `page_url='index.html'` ให้ข้อมูล KV
> เดิม 2 แถวที่มีอยู่แล้ว — ทดสอบผ่าน browser ครบ (mock data): proxy section render ถูกตำแหน่ง+พื้นหลังถูกต้อง,
> ไม่มี KV banner ก็ข้ามไปเงียบๆ ถูกต้อง, บันทึก KV banner ที่เพจอื่น (`our_story.html`) สร้าง proxy row ใหม่
> ถูกต้อง + idempotent (เพิ่ม KV banner ที่ 2 ให้เพจเดียวกันไม่สร้าง proxy ซ้ำ) — ดูหัวข้อ "ระบบ Banner" และ
> "static proxy section" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **ปรับปรุง "รายการเพจ" 5 จุดตาม feedback**: (1) ชื่อเพจ (EN) เป็น required
> field แล้วในฟอร์มเพิ่มเพจ standalone (2) Slug auto-fill จากชื่อเพจ (EN) แบบ real-time ขณะพิมพ์ หยุด
> auto-fill ทันทีที่แก้ slug เอง (3) **แก้บั๊กพื้นหลัง gradient "ใช้งานไม่ได้ไม่แสดงผล"** — พบว่าเป็นบั๊ก
> `[hidden]` แบบเดียวกับที่เจอมาแล้ว 2 ครั้ง (`.cms-field` มี `display:flex` ชนกับ `[hidden]` ของ browser
> specificity เท่ากัน แต่มาทีหลังชนะ) ทำให้ฟิลด์พื้นหลังทั้ง 3 กลุ่ม (รูปภาพ/สีพื้น/gradient) โชว์พร้อมกันหมด
> ตลอดเวลา ไม่ใช่บั๊กที่ save/render logic เลย (ทดสอบแยกแล้วว่าถูกต้องมาตลอด) — แก้ด้วยกฎเดียว
> `.cms-field[hidden] { display:none }` (4) **ปุ่ม (CTA) ของ section เลือกรูปแบบ (Text Link เดิม/Primary/
> Primary Outline) + สีเองได้แล้ว** ตามตัวอย่าง "Primary Outline" ที่ผู้ใช้ระบุ อ้างอิง token สีเดียวกับปุ่ม
> อื่นในเว็บ (5) **แต่ละรูปในกริดของ section ใส่ลิงก์แยกได้แล้ว** (ไม่บังคับ ต่อรูป) — เพิ่มคอลัมน์ใหม่ 3 ตัว
> (`button_style`/`button_color`/`image_links`) ใน `cms/schema-pages-v9.sql` (**ยังไม่ได้รัน**) — ทดสอบผ่าน
> browser ครบทุกจุดแล้ว (รวม save payload/drag-reorder ที่ link ต้องเลื่อนตามรูปถูกต้อง) — ระหว่างตรวจสอบ
> เจอด้วยว่า **`schema-pages-v2.sql` ถึง `v8.sql` และ seed 2 ไฟล์ (index/career) ที่เอกสารเดิมบอกว่ายังไม่ได้
> รัน จริงๆ แล้วรันไปหมดแล้ว** (ผู้ใช้รันเองนอก session) แก้ตารางสถานะ SQL migrations ให้ตรงกับ Supabase จริง
> แล้ว (ยืนยันผ่าน REST API 2026-07-31) — ดูหัวข้อ "ระบบจัดการเพจ" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **เพิ่มปุ่ม Export Excel (.xlsx) ให้หน้า Subscribe** (`cms/subscribers.html`) —
> export รายชื่อผู้สมัครทั้งหมดเป็นไฟล์ `.xlsx` จริงฝั่ง client ผ่านไลบรารี SheetJS (CDN ใหม่ `xlsx@0.18.5`)
> ชื่อไฟล์ `subscribe_ddmmyyyy_hhmm.xlsx`, คอลัมน์ Email/วันที่/เวลาตรงกับตารางบนหน้าจอ, ขึ้น toast "Export
> ไฟล์สำเร็จ" เมื่อเสร็จ — ทดสอบผ่าน browser จริงแล้ว (spy บน `XLSX.writeFile` ยืนยันชื่อไฟล์/เนื้อหาถูกต้อง)
> ดูหัวข้อ "ระบบ Subscribe" ด้านล่าง
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **ปรับหน้าตาช่องอัปโหลดรูปภาพให้เหมือนกันทุกจุดในทั้ง CMS (7 จุด)** ตามตัวอย่าง
> ที่ผู้ใช้ส่งมา (กล่องเส้นประ ไอคอน "คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง" + ข้อความ "รองรับรูปภาพ jpg, jpeg,
> png ขนาดไม่เกิน 5 MB") — เพิ่ม **รองรับลากไฟล์จาก desktop มาวางได้จริง** ด้วย (ของเดิมไม่มีเลยสักที่ มีแค่ปุ่ม
> "📤 อัปโหลด" เฉยๆ) แก้ `cms/upload.js`'s `cmsBindImageUpload()` ให้รับ dropzone element เพิ่ม ผูก
> click+drag-drop เข้าด้วยกัน ใช้กับ 5 จุดที่เป็น single-image field (เมนู/บทความ/Banner TH+EN/พื้นหลัง
> section) — ส่วน multi-image gallery (สินค้า/รูป section สูงสุด 4-5 ภาพ) ปรับปุ่ม "+" ให้มีไอคอน+ป้ายกำกับ
> แทนเครื่องหมาย "+" เฉยๆ พร้อม drag-drop เข้าปุ่มนั้นโดยตรง แล้วเพิ่มข้อความช่วยเหลือไว้ใต้กริดแทน (พื้นที่ใน
> กริด 96×96px ไม่พอใส่ข้อความเต็มแบบกล่องใหญ่) — ระหว่างทำเจอบั๊กจริง (ไม่ใช่แค่ในทฤษฎี): การส่ง
> `handleImageFileSelected` ตรงๆ เป็น event listener ทำให้ browser ส่ง `Event` object เข้ามาแทน `File` พัง
> validation ทันที แก้แล้วด้วยการห่อเป็น anonymous function — ทดสอบผ่าน browser ครบทั้ง 7 จุดแล้ว รวมถึง
> ยืนยัน drag-and-drop ทำงานจริงผ่าน synthetic event ไม่ใช่แค่หน้าตา — **ไม่ได้แก้ชนิดไฟล์ที่ระบบรองรับจริง**
> (`cmsUploadImage()` ยังรับ WEBP/GIF/SVG ได้เหมือนเดิม กว้างกว่าข้อความที่โชว์ — ตั้งใจไม่แก้เพราะผู้ใช้ขอแค่
> ปรับ UI/ข้อความ) — ดูหัวข้อ "Dropzone อัปโหลดรูปภาพกลาง" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **ปรับหน้า "รายการสินค้า" (`cms/products.html`/`products.js`) 3 จุดตาม
> feedback**: (1) เอาคอลัมน์ "สต็อก" ออกจากตาราง list (2) เอาฟิลด์ "จำนวนสต็อก" ออกจากฟอร์ม add/edit
> (เปลี่ยนเป็น hidden input ค่าคงที่ 9999 แทน — ไม่ใช่ 0 เพื่อไม่ให้สินค้าใหม่โดนเช็ค isOutOfStock ฝั่งเว็บหลัก
> พาไปแสดงเป็น "สินค้าหมด" โดยไม่ตั้งใจ) (3) เพิ่มลิมิตตัวอักษรของรายละเอียดสินค้าจาก 1,000 เป็น 5,000
> ตัวอักษร (แก้ค่าคงที่เดียวใน `products.js` ที่ counter/auto-truncate/validation ทั้งหมดผูกกับอยู่แล้ว) —
> ลบ `updateStock()`/`.cms-stock-input` CSS ที่ไม่มีที่เรียกใช้อีกทิ้งไปด้วย ทดสอบผ่าน browser แล้วว่าตาราง
> เหลือ 5 คอลัมน์ถูกต้อง, ฟอร์มไม่มีฟิลด์สต็อกให้เห็น (hidden input value=9999 ถูกต้อง), และ counter ขึ้น
> "0 / 5000" ทั้ง TH/EN — ดูหัวข้อ "ระบบจัดการสินค้า" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **ปรับ state machine ทั้งหมดของระบบ LINE Login ให้ตรงกับสเปกที่ผู้ใช้ระบุ
> ละเอียดขึ้น**: (1) **`localStorage['cpbf-line-profile']` เปลี่ยนความหมาย** จากเดิม "login LINE สำเร็จแล้ว"
> เป็น **"ยืนยันแล้วว่าเป็นเพื่อนกับ OA จริง"** เท่านั้น — save ก็ต่อเมื่อ push เข้าแชทลูกค้าสำเร็จจริง
> (`customerOk===true`) เท่านั้น ถ้ายังไม่เพิ่มเพื่อน (หรือเคยเพิ่มแล้ว unfriend ภายหลัง) จะไม่ save/ลบทิ้งทันที
> — ผลคือกด "สั่งซื้อผ่าน LINE" ครั้งถัดไปจะ redirect ไป LINE Login **ใหม่ทั้งหมดทุกครั้ง** (ขอสิทธิ์ → เพิ่ม
> เพื่อน) จนกว่าจะเพิ่มเพื่อนสำเร็จจริง ตรงตามที่ผู้ใช้ระบุ ("เริ่ม flow ใหม่ตั้งแต่ต้น") — ถ้าเปลี่ยนเบราว์เซอร์/
> ล้างแคชแล้วเคยเพิ่มเพื่อนจริงมาก่อน (ฝั่ง LINE) การ push จะสำเร็จทันทีข้ามขั้นเพิ่มเพื่อนซ้ำได้เองโดยไม่ต้อง
> เขียนโค้ดเพิ่ม เพราะ friend status เป็นความจริงฝั่ง LINE ไม่ใช่แค่ cache ของเรา (2) **cart.html ไม่เคลียร์
> ตะกร้าอีกต่อไปจนกว่าจะยืนยันว่าส่งออเดอร์เข้าแชทลูกค้าสำเร็จจริง** — `openLineOrder()` เปลี่ยนเป็น async คืน
> `{success, redirected, lineUrl, autoOpened}` ให้ caller ตัดสินใจเอง (เหมือนกรณีไม่ได้กด add to cart ตามที่
> ผู้ใช้เทียบไว้) — เพิ่ม state ใหม่บน `line-callback.html`: "ยังไม่ได้รับคำสั่งซื้อของคุณ" (ไอคอน warning
> สีเหลือง ใหม่) แสดงตอน resume order แล้วพบว่ายังไม่ได้เพิ่มเพื่อน พร้อมลิงก์ "กลับไปสั่งซื้ออีกครั้ง" —
> ทดสอบผ่าน browser ครบทุก state แล้ว (ไม่มี profile → เก็บ pending order ถูกต้องไม่เคลียร์ตะกร้า, มี profile
> เดิมแต่ push ล้มเหลว (unfriend ไปแล้ว) → ไม่เคลียร์ตะกร้า + ลบ profile cache ทิ้งถูกต้อง, มี profile จริง →
> เคลียร์ตะกร้าถูกต้อง, หน้า callback แสดง warning state ถูกต้องเมื่อ resume แล้วไม่ผ่าน) — ดูหัวข้อ
> "ระบบสั่งซื้อผ่าน LINE" ด้านล่างสำหรับรายละเอียดเต็ม
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **เพิ่มระบบ LINE Login เพื่อรวมแชทสั่งซื้อผ่าน LINE ให้เป็นแชทเดียวกันระหว่าง
> ลูกค้ากับแอดมิน** (โค้ดครบแล้ว แต่**ยังไม่ได้ deploy/ตั้งค่าอะไรเลยสักอย่าง** ดู "สิ่งที่ต้องทำต่อ" ข้อ 0c) —
> บริบท: ระบบเดิม (`send-line-order` Edge Function ที่ deploy อยู่แล้วนอก session นี้) push แจ้งออเดอร์ใหม่ไปหา
> **แอดมินคนเดียว** (`LINE_ADMIN_USER_ID` คงที่) แยกขาดจากแชทจริงที่ลูกค้าเปิดเองผ่าน deep link
> `line.me/R/oaMessage/@cpbf` — ไม่มีทางรู้ว่าออเดอร์ไหนตรงกับแชทไหนของลูกค้าคนไหน เพราะ push message
> ต้องใช้ LINE userId จริงถึงจะส่งเข้าแชท 1:1 ของคนนั้นได้ตรงๆ ซึ่งระบบเดิมไม่มีทางรู้ userId ของลูกค้าเลย —
> แก้ด้วย **LINE Login (OAuth 2.1)**: บังคับให้ลูกค้า login ด้วย LINE ก่อนสั่งซื้อผ่าน LINE ได้ (login ครั้ง
> เดียวจำไว้ในเบราว์เซอร์นั้นตลอด ตามที่ตกลงกันไว้) ได้ userId+ชื่อ+รูปโปรไฟล์จริงมา แล้ว push ข้อความยืนยัน
> เข้า **แชทจริงของลูกค้าคนนั้นโดยตรง** (`to: lineUserId`) เพิ่มอีกช่องทางหนึ่ง (คงการ push แจ้งแอดมินแบบเดิม
> ไว้เป็น backup ด้วย) ผลคือแอดมินเปิด LINE Official Account Manager แล้วเห็นข้อความยืนยันออเดอร์อยู่ใน
> แชทจริงของลูกค้าคนนั้นเลย พร้อมชื่อ+รูปโปรไฟล์จริง ตอบกลับต่อได้ในแอปทันที —
>
> **ไฟล์ใหม่**: `line-login.js` (โมดูลกลาง รวม `openLineOrder`/`notifyAdminAuto`/LINE Login flow ที่เคย
> copy-paste แยกกัน 4 ที่ใน `cart.html`/`index.html`/`online_shop.html`/`product-detail.html` ให้เหลือจุด
> เดียว), `line-callback.html` (หน้าที่ LINE redirect กลับมาหลัง login — แลก code เป็น profile, resume
> คำสั่งซื้อที่ค้างไว้อัตโนมัติ, โชว์ปุ่ม "เพิ่มเราเป็นเพื่อนใน LINE"), `supabase/functions/
> line-login-exchange/index.ts` (Edge Function ใหม่ — แลก code เป็น token/profile โดยใช้ Channel secret
> ฝั่ง server เท่านั้น), `supabase/functions/send-line-order/index.ts` (**เก็บซอร์สเดิมที่ผู้ใช้ส่งมาไว้ใน
> repo ครั้งแรก** พร้อมแก้ไขให้รับ `lineUserId`/`lineDisplayName` เพิ่ม — เดิมไม่มีไฟล์นี้ใน repo เลย
> deploy อยู่แยกนอก session ทั้งหมด)
>
> **แก้ไฟล์เดิม 4 ไฟล์**: ลบ inline `<script>` block เดิม (`isMobileDevice`/`notifyAdminAuto`/
> `openLineOrder`/modal-close-listener) ออกจาก `cart.html`/`index.html`/`online_shop.html`/
> `product-detail.html` ทั้งหมด แทนที่ด้วย `<script src="line-login.js">` ตัวเดียว (ไม่กระทบ
> `products-render.js`'s ปุ่ม "Shop with LINE" หรือ `product-detail.html`'s ปุ่ม "Shop with LINE" เลย
> เพราะทั้งคู่เรียกผ่าน `window.openLineOrder` ที่ `line-login.js` ยังคง alias ไว้เหมือนเดิม — ครอบคลุม
> "ทุกช่องทาง" ที่มีปุ่มสั่งซื้อผ่าน LINE ในเว็บโดยอัตโนมัติ)
>
> **การทดสอบ**: ทดสอบ client-side logic ผ่าน browser สำเร็จ (mock `fetch`/`localStorage`/`sessionStorage`)
> — path ยังไม่ login: กด "สั่งซื้อผ่าน LINE" แล้วเก็บ pending order ใน sessionStorage ถูกต้อง +
> redirect ไป `access.line.me` จริง (ยืนยันด้วยการที่ browser tool บล็อกโดเมนนั้นเพราะไม่ได้อนุมัติไว้ก่อน
> — เป็นหลักฐานว่า redirect ไปโดเมนจริงสำเร็จ) — path login แล้ว: mock `fetch`/`window.open` ยืนยันว่า
> body ที่ส่งไป `send-line-order` มี `lineUserId`/`lineDisplayName` ถูกต้อง และ desktop แสดง modal
> ยืนยันแทนการเปิด deep link ตรงๆ (ตาม `isMobileDevice()` เดิม) — `line-callback.html`: mock
> `line-login-exchange`/`send-line-order` แล้วยืนยันว่า `handleLineCallback()` เช็ค `state` ถูกต้อง, เซฟ
> profile ลง localStorage, resume pending order, และ UI แสดงชื่อ/รูป/ปุ่มเพิ่มเพื่อน/ลิงก์แชทถูกต้องทั้งหมด
> — **ยังไม่ได้ทดสอบ OAuth round-trip จริงกับ LINE** เพราะ callback URL ต้องเป็นโดเมน HTTPS ที่ลงทะเบียนไว้
> เป๊ะๆ (`https://cpbf.co.th/line-callback.html`) ทดสอบผ่าน `file://`/`localhost` ไม่ได้เลย
>
> อัปเดตก่อนหน้าในวันเดียวกัน: **เพิ่มปุ่ม "← กลับหน้ารายการ" ที่ sticky bottom bar ของ `cms/page-editor.html`**
> (ลิงก์ `<a href="pages.html">` ธรรมดา วางฝั่งซ้ายตรงข้ามปุ่ม "บันทึกการเปลี่ยนแปลงทั้งหมด" — ปรับ
> `.cms-sticky-bottombar` ใน `cms/style.css` จาก `justify-content:flex-end` เป็น `space-between` +
> `align-items:center` เพื่อดันสองปุ่มไปคนละฝั่ง) เดิมมีแค่ breadcrumb ด้านบนสุดของหน้าที่กลับไปหน้ารายการเพจได้
> (`CMS / Page Management` ลิงก์ไป `pages.html`) แต่ต้องเลื่อนขึ้นไปบนสุดของเพจ ซึ่งไม่สะดวกเวลาแก้ไข section
> หลายรายการแล้วอยู่ล่างสุดของหน้า — ทดสอบด้วยการโหลด static HTML ตรงๆ (ตัด script ออกเพื่อเลี่ยง auth
> redirect ไป login.html) ยืนยันด้วย screenshot แล้วว่าปุ่มแสดงตำแหน่งถูกต้อง —
>
> ก่อนหน้านั้นในวันเดียวกัน: **ปรับหน้า `cms/admins.html` 2 จุดตาม feedback**: (1) เอาคอลัมน์
> "สถานะรหัสผ่าน" (badge "ยังไม่ได้ตั้งรหัสผ่านเอง") ออกจากตารางรายชื่อแอดมินแล้ว (ตัดทั้ง `<th>` ใน
> `admins.html` และ `tdStatus` ใน `admins.js` — ปรับ `colSpan` ของแถว empty-state จาก 6 เหลือ 5 ให้ตรงกับ
> จำนวนคอลัมน์ใหม่ด้วย) (2) แก้ style ช่องรหัสผ่านเริ่มต้นใน modal "รหัสผ่านเริ่มต้น" ให้หน้าตาเหมือนฟิลด์
> ทั่วไป (เช่น "ชื่อที่แสดง") — สาเหตุเดิม: ช่องนี้เป็นแค่ `.cms-color-field` ลอยๆ ไม่ได้ห่อด้วย `.cms-field`
> เลย ทำให้ไม่โดน selector `.cms-field input[type="text"]` ที่ให้ height/padding/border/radius มาตรฐาน
> (pattern เดียวกับที่ `.cms-color-field` ใช้ใน `cms/page-editor.html`'s bg-color picker ซึ่ง**ถูก**ห่อด้วย
> `.cms-field` มาโดยตลอด — จุดนี้ตกหล่นตอนสร้างหน้า admins.html) — แก้โดยห่อด้วย `<div class="cms-field">`
> พร้อม `<label>` "รหัสผ่านเริ่มต้นสำหรับ &lt;email&gt;" (ย้ายข้อความอีเมลจาก `<p class="cms-section-hint">`
> เดิมมาเป็น `<span id="passwordModalEmailHint">` ซ้อนอยู่ใน label แทน ปรับ `admins.js`'s
> `openPasswordModal()` ให้ set แค่อีเมลลงไป ไม่ต้องต่อ string เอง) — ทดสอบผ่าน browser จริงแล้วทั้งสองจุด
> (ตาราง 4 คอลัมน์ถูกต้อง, ช่องรหัสผ่านมี label + border/height มาตรฐานตรงกับฟิลด์อื่นแล้ว)
>
> ก่อนหน้านั้นในวันเดียวกัน: **เพจ standalone เปิดผ่าน URL สะอาด `<slug>.html` แทน `promo.html?slug=...`
> แล้ว + ปรับ Menu Management 4 จุด** —
> **(1) เพจ standalone**: เพิ่มไฟล์ `_redirects` ใหม่ที่ root (Netlify rewrite rule — เว็บนี้ static site
> ไม่มี server เขียนไฟล์ .html ใหม่ตอน runtime ไม่ได้จริงๆ ต้องอาศัย rewrite ระดับ hosting แทน: request ไปที่
> `/<slug>.html` ที่ไม่มีไฟล์จริงจะถูก rewrite แบบ 200 (ไม่ใช่ redirect 301/302 — address bar ไม่เปลี่ยน) ไป
> โหลด `promo.html?slug=<slug>` แทน โดยไม่กระทบไฟล์ .html จริงที่มีอยู่แล้วเลยเพราะ Netlify เช็คไฟล์จริงก่อน
> เสมอ) — `promo.html` อ่าน slug จาก URL ได้ 2 ทางแล้ว (query string เดิม + path ของ URL เอง เป็น fallback
> สำหรับตอนเข้าผ่าน URL สะอาดที่ address bar ไม่มี query string ให้เห็น) — อัปเดต `cms/pages.js`/
> `cms/page-editor.js`/`cms/banners.js` ให้ใช้ `<slug>.html` เป็น URL/คีย์ page_url แทน
> `promo.html?slug=...` ทุกจุดที่แสดง/บันทึก — **เพิ่ม guard ใหม่**: ตอนสร้างเพจ standalone เช็คด้วย fetch
> HEAD ว่า slug ที่ตั้งชนกับไฟล์ .html จริงที่มีอยู่แล้วไหม (เช่น slug "career") ถ้าชนจะ block ไว้พร้อมข้อความ
> เตือน เพราะไม่งั้นเพจนั้นจะเปิดไม่ได้เลยแบบเงียบๆ (Netlify serve ไฟล์จริงเสมอ ไม่มีวัน rewrite ให้) — ทดสอบ
> แล้วว่า credential ทดสอบใน browser จริง (แต่ทดสอบ negative case ของ collision guard ไม่ได้สมบูรณ์เพราะ
> ข้อจำกัดของ `file://` protocol — HEAD request ไปที่ไฟล์ไม่มีจริงจะ throw error แทนที่จะได้ 404 ปกติเหมือน
> HTTP server จริง ทำให้ fallback "ถือว่ามีอยู่จริงไว้ก่อน" ของ `checkFileExists()` (pattern เดียวกับที่
> `cms/menu.js` ใช้อยู่แล้ว) ทำงานเสมอในสภาพแวดล้อมทดสอบนี้ — ยืนยันแล้วว่า positive case (slug ชนไฟล์จริง
> เช่น "career") ทำงานถูกต้อง 100%) — **ยังไม่ได้ deploy `_redirects` ขึ้น Netlify จริง** ต้อง deploy
> ก่อนถึงจะใช้งาน URL สะอาดได้จริงบน production
>
> **(2) Menu Management**: ลบปุ่ม "ขยายทั้งหมด" ออก (default ขยายอยู่แล้วทุกแถว ปุ่มนี้ไม่มีประโยชน์ซ้ำซ้อน) —
> เพิ่มพื้นหลังสีเทาอ่อนให้แถวเมนูหลัก (depth 0) ต่างจากเมนูย่อย (depth 1) ชัดเจน (`.cms-menu-row[data-depth="0"]`)
> — **เมนูย่อยสร้างได้แค่ 1 ชั้นเท่านั้น (รวมเมนูหลัก = 2 ระดับ)**: dropdown "Parent" ตอนสร้าง/แก้ไขเมนูกรองให้
> เหลือแค่เมนูระดับบนสุดเท่านั้น (ไม่ไล่แสดงเมนูย่อยเป็นตัวเลือกต่ออีกต่อไป), เพิ่ม guard ตอน submit อีกชั้น
> (เผื่อ dropdown มีตัวเลือกหลุดมาได้ยังไงก็ตาม) — **เอาปุ่ม "+ ย่อย" ออกจากแถวเมนูย่อย (depth 1)** เหลือแค่แถว
> เมนูหลัก (depth 0) เท่านั้นที่กดสร้างเมนูย่อยได้ (แก้ปัญหาที่ผู้ใช้เจอ: เดิมกดสร้างเมนูย่อยซ้อนเมนูย่อยได้
> แต่ผลลัพธ์ไม่แสดงผลตามที่ตั้งใจ) — ทดสอบผ่าน mock data 2 เมนูหลัก + 2 เมนูย่อยใน browser จริง ยืนยันแล้วว่า:
> พื้นหลังแถวถูกสี, ปุ่ม "+ ย่อย" แสดงเฉพาะ depth 0, dropdown Parent กรองถูกต้อง (ระหว่างทดสอบเจอ debug
> artifact ของ test harness เอง 2 จุด ไม่ใช่บั๊กจริง — เจอ context การ debug session นี้ยาวจนต้องเปิด tab
> ใหม่ + เช็ค stylesheet cache เพื่อยืนยัน)
>
> ก่อนหน้านั้นในวันเดียวกัน: **เพิ่มระบบจัดการแอดมิน CMS (CRUD)** — จัดการ `auth.users` ของ Supabase Auth
> ตรงๆ ไม่มีตาราง `admins` แยก เพราะระบบเดิมไม่มี role/สิทธิ์ย่อยอยู่แล้ว (ทุกคน login สำเร็จ = แอดมินเต็ม
> สิทธิ์) — **⚠️🔧 ต้อง deploy Edge Function ใหม่เองก่อนใช้งานได้**:
> `supabase/functions/manage-admins/index.ts` (ไฟล์ใหม่ **ยังไม่ได้ deploy**) เพราะ list/create/update/
> delete ผู้ใช้ต้องใช้ service_role key เท่านั้น (`supabase.auth.admin.*`) ซึ่งห้ามอยู่ฝั่ง client เด็ดขาด
> Edge Function เลยเป็นตัวกลางเดียวที่แตะ service_role ได้ (ตรวจ JWT ผู้เรียกก่อนทุกครั้ง) — แอดมินใหม่ที่
> สร้างผ่านระบบนี้ได้**รหัสผ่านสุ่มอัตโนมัติ 14 ตัวอักษร** พร้อม `email_confirm:true` ทำให้ **login ได้ทันที
> ไม่ต้องกดยืนยันอีเมล** ตามที่ผู้ใช้ขอ, รหัสผ่านที่สุ่มได้แสดงให้คัดลอกครั้งเดียวหลังสร้าง (ไม่เก็บ/แสดงซ้ำ) —
> หลัง login ครั้งแรกด้วยรหัสสุ่มนี้ จะมี modal เสนอให้ตั้งรหัสผ่านใหม่เอง**แบบไม่บังคับ** กด "ข้ามไปก่อน" ได้
> (ไม่ถามซ้ำในเซสชันเบราว์เซอร์เดียวกัน แต่กลับมาถามใหม่ทุก login จนกว่าจะตั้งจริง) — สร้างหน้าใหม่
> `cms/admins.html`/`admins.js` (เมนู sidebar ใหม่ "ระบบ" > "จัดการแอดมิน" เพิ่มลิงก์ในทุกหน้า CMS ที่มี
> shell แล้วทั้ง 10 หน้า) รองรับ list/add/edit(ชื่อที่แสดงเท่านั้น)/reset password/delete — ป้องกันลบบัญชี
> ตัวเอง (ซ่อนปุ่มลบในแถวตัวเองตั้งแต่ฝั่ง UI + guard ซ้ำฝั่ง server) และป้องกันลบแอดมินคนสุดท้ายของระบบ —
> ทดสอบ UI/JS ทั้งหมดผ่าน mock fetch แทน Edge Function จริงแล้ว (list/create/edit/reset/delete/ตั้ง
> รหัสผ่านใหม่/self-delete guard ทำงานถูกต้องหมด) แต่**ยังไม่ได้ทดสอบกับ Edge Function ที่ deploy จริง**
> เพราะยังไม่ได้ deploy และไม่มี credential แอดมินจริงให้ login ทดสอบ — ดูหัวข้อ "ระบบจัดการแอดมิน CMS"
> ด้านล่างสำหรับรายละเอียดเต็ม
>
> ก่อนหน้านั้น (2026-07-30): **เคลียร์โค้ด/ไฟล์ที่ไม่ได้ใช้ทั้งเว็บไซต์ เตรียม deploy** (git init ครั้งแรกก่อน
> ทำ เพื่อให้ revert ได้ถ้าพลาด) — ตรวจสอบทุก class selector ใน `style.css`/`cms/style.css` เทียบกับการใช้งาน
> จริงทั้งหมด (root *.html/*.js + `cms/*.html/*.js/*.sql`) แบบ 4 รอบ (รอบแรกพบ false positive เยอะมากจาก
> class ที่สร้างด้วย JS string concatenation เช่น `page-section--` + layout, จาก comment เก่าที่พูดถึงชื่อ
> class ที่ลบไปแล้ว, จาก HTML ที่ comment ปิดไว้ (`<!-- ... -->`), และจาก section ที่ชื่อดูเหมือนของเก่าทั้งที่
> เนื้อหาข้างในยังใช้จริงอยู่ เช่น "Career Page — Coming Soon style" ที่จริงคือ CSS ของฟอร์มสมัครงานจริงตอนนี้
> — ต้องเปิดอ่านเนื้อหาทุก section ก่อนลบเสมอ ห้ามเชื่อแค่ชื่อ comment) **ลบ CSS ที่ยืนยันแล้วว่าตายจริง
> ~2,460 บรรทัด** (`style.css` 7,539 → 5,207 บรรทัด, `cms/style.css` 1,634 → 1,573 บรรทัด) ส่วนใหญ่เป็นซาก
> ดีไซน์เก่าก่อน redesign หลายรอบ (about.html เดิม, what-we-do.html เดิม, career.html แบบ "coming soon"
> เดิม, products.html เดิมที่ถูกลบไฟล์ไปแล้ว, หน้า beanie/jungle/arabitia แบบเดิมก่อนย้ายเข้า Page
> Management, nav dropdown แบบ multi-column เดิมก่อนเปลี่ยนเป็น mega-menu gallery, news-card/product-card
> เดิมก่อนเปลี่ยนเป็น blog-card/shop-card, ปุ่ม "View more" ของ cart.html ที่ element เป้าหมายถูกลบไปแล้ว
> จริงๆ) พร้อม**ลบไฟล์ที่ไม่มีอะไรอ้างอิงเลย**: `partials.js`/`header.html`/`footer.html` (ระบบ fetch
> header/footer แบบเก่า เลิกใช้ไปนานแล้ว — ลบ dead event listener ที่รอ event `partialsLoaded` ใน `i18n.js`
> ด้วย), `news2.jpg` (รูปลอยไม่มีที่ไหนอ้างถึง) — ลบ script "view-more toggle" ที่ตายจริงใน `cart.html` (อ้างถึง
> `#viewMoreButton`/`#productGrid` ที่ไม่มีอยู่ในหน้าจริงแล้ว) และลบ markup ที่ comment ปิดไว้ถาวรใน
> `newsroom.html` (section "Featured Story" เดิม อ้างอิง `news-beanie-launch.html` ที่ถูกลบไปแล้ว) —
> **ของที่เจอแต่ตั้งใจไม่ลบ** (ความเสี่ยงต่ำแต่ไม่ชัดเจนพอ): `.shop-card.is-search-highlight` ใน `style.css`
> (คอมเมนต์บอกว่าเป็นฟีเจอร์ไฮไลต์การ์ดสินค้าตอนกดมาจากผลค้นหา แต่ `site-search.js` ไม่เคยเซ็ต class นี้จริง
> — ดูเหมือนฟีเจอร์ที่ทำค้างไว้ ไม่ใช่ซากเก่า จึงไม่ลบ), `.cms-btn--danger` ใน `cms/style.css` (ปุ่ม
> variant สีแดงทั่วไปที่ยังไม่มีหน้าไหนเรียกใช้ อาจเป็น utility เผื่อไว้) — ยืนยันด้วย browser จริงหลังลบ
> เสร็จ: ตรวจ index.html/career.html/newsroom.html/cart.html/coffee_shop.html (เพจ Page Management แบบ
> เนื้อหาว่าง)/`cms/login.html` ไม่มี console error และหน้าตาถูกต้องทุกหน้า — **ยังไม่ได้ตัดสินใจ** (ถามผู้ใช้
> ไปแล้วรอคำตอบ): โฟลเดอร์ `design/` (wireframe ต้นแบบเก่า ไม่เคยถูกโหลดจริงในเว็บ มีแค่ comment เก่าพาดพิงถึง
> เป็นเอกสารประวัติ), `Archive.zip` (ไฟล์ backup ของผู้ใช้เอง ณ 2026-07-24), `.obsidian/`/`.DS_Store` (ไม่ใช่
> ไฟล์เว็บไซต์ ไม่ควรอยู่ใน deploy bundle แต่ก็ไม่ใช่ "โค้ดที่ไม่ได้ใช้" ในความหมายเดียวกัน)
>
> ก่อนหน้านั้นในวันเดียวกัน: **ปรับส่วนจัดการ section ทุกหน้า 2 จุด**: (1) layout `image-top`/`image-bottom`
> เปลี่ยนจาก collage แบบ masonry (ใช้ร่วมกับ image-left/right) มาเป็น **แถวเดียว 1-4 รูป ขนาดเท่ากัน กึ่งกลาง
> แถว จำนวนคอลัมน์ auto ตามจำนวนรูปที่ใส่จริง** — ฟังก์ชันใหม่ `buildImageRowHtml()` ใน `page-render.js` +
> CSS `.page-section__image-row` ใน `style.css` (image-left/right ยังใช้ collage เดิมไม่เปลี่ยน — ทดสอบแล้ว
> ว่าไม่ regression) — (2) **section แบบปกติ (ไม่ใช่ custom-html) กำหนดตำแหน่งหัวข้อได้แล้ว** ซ้าย/กลาง/ขวา
> ผ่าน align picker ใหม่ใน `cms/page-editor.js` (reuse `.cms-align-picker` เดียวกับ Banner Management)
> เก็บใน `page_sections.heading_align` คอลัมน์ใหม่ (`cms/schema-pages-v8.sql`, **ยังไม่ได้รัน**) จำกัดผลแค่
> `<h2>` หัวข้อเท่านั้น ไม่กระทบเนื้อหา/ปุ่มด้านล่าง — ทดสอบ `buildImageRowHtml()`/`heading_align` ผ่าน
> browser จริงแล้ว (render 1-4 รูปถูกต้อง, ทั้ง 3 ตำแหน่งหัวข้อถูกต้อง, collage เดิมของ image-left ไม่กระทบ)
> ส่วน UI picker ใน `cms/page-editor.js` ตรวจสอบด้วย syntax check + code review เท่านั้น (ไม่มี session
> login จริงให้ทดสอบ end-to-end ใน CMS ตอนนี้) — ก่อนหน้านั้นในวันเดียวกัน: **หน้า career (ร่วมงานกับเรา) จัดการผ่าน Page Management ได้แล้ว** เหมือน
> หน้าแรก: 3 section แรก (บริษัท CP B&F ดีอย่างไร?/Benefit/ทำไมต้องร่วมงานกับเรา?) ย้ายเนื้อหาเข้า
> `page_sections` จริงเป็น custom-html (แก้ไขได้ผ่าน CMS), ส่วน section "Apply now" (ฟอร์มสมัครงานจริง —
> dropdown ตำแหน่งงาน + อัปโหลดไฟล์/ยิง base64 ไป Edge Function `send-application-email`) เป็น "proxy
> section" เหมือนเดิม จัดการได้แค่พื้นหลัง+ลำดับ ไม่ย้ายเนื้อหา/JS จริงเข้ามา — seed ผ่าน
> `cms/seed-career-sections.sql` (ต้องรันหลัง schema-pages-v7, **ยังไม่ได้รัน**) พร้อมสร้าง `pages` row ใหม่
> ผูก `menu_item_id` ของเมนู "ร่วมงานกับเรา" ให้ด้วย — **เปลี่ยนแนวทางสำคัญ**: "static proxy" pattern ที่เดิม
> เขียนเฉพาะหน้าแรกในไฟล์ `index-sections-render.js` ถูก **generalize เข้าไปใน `page-render.js` เอง**
> (ฟังก์ชัน `renderSections()`/`isProxySection()`/`applyBgToStaticElement()` ย้ายเข้ามาเป็นของกลาง ไม่ผูก
> anchor_id ตายตัวอีกต่อไป เช็คแค่ marker `<!-- static-proxy -->` + มี `anchor_id`) เพื่อให้ใช้ซ้ำได้กับ
> ทุกเพจที่มี static section แบบนี้ ไม่ใช่แค่หน้าแรก — **ผลคือ `index.html` ก็ย้ายมาใช้ path เดียวกันนี้แล้ว**
> (เปลี่ยน `#indexSectionsContainer` → `#pageSectionsContainer data-page-key="index"` ตัวมาตรฐาน, ลบไฟล์
> `index-sections-render.js` ทิ้งไปเลยเพราะซ้ำซ้อน) — ถดถอยทดสอบแล้วผ่าน: reorder/พื้นหลังทั้ง 3 แบบ/
> JS จริงของ Online Shop-Newsroom-Our Partners-Contact Us ยังทำงานปกติ (ดู "หน้าแรก (index.html)" +
> "หน้า career.html" ใต้ "ระบบจัดการเพจ" ด้านล่าง) และหน้า career ทดสอบผ่าน browser (mock ข้อมูลเพราะ seed
> ยังไม่ได้รันจริง): ลำดับ/พื้นหลัง 4 section ถูกต้อง, dropdown ตำแหน่งงานของฟอร์ม apply ยังทำงานได้ปกติ
> หลังถูกย้ายตำแหน่ง DOM (ไม่ได้ทดสอบการอัปโหลด/ส่งฟอร์มจริงเพื่อไม่ให้ยิง request จริงไป Edge Function)
> — `cms/page-editor.js`'s `isStaticProxySection()` ก็ generalize แบบเดียวกัน (เลิกใช้ allowlist
> `STATIC_PROXY_ANCHOR_IDS` ตายตัว 4 ตัว) — ก่อนหน้านั้นในวันเดียวกัน: **แก้บั๊กสำคัญ: กรอกค่าในฟิลด์พื้นหลังที่ไม่ได้เลือกรูปแบบไว้แล้วไม่มีผล**
> (พบจริงกับ 2 section ในหน้าแรก — อัปโหลดรูปตอนเลือก "สีพื้น" ไว้ หรือพิมพ์สีตอนเลือก "รูปภาพ" ไว้ ค่าจะถูก
> บันทึกจริงแต่ไม่แสดงผลเพราะ `bg_type` ไม่ตรง) — แก้โดยให้ทุกฟิลด์พื้นหลัง (รูปภาพ/สีพื้น/gradient) สลับ
> `bg_type` ให้อัตโนมัติทันทีที่แอดมินโต้ตอบกับฟิลด์นั้น ใน `cms/page-editor.js` — ข้อมูลเก่าที่เจอปัญหานี้ไป
> แล้วต้องเข้าไปกดปุ่มรูปแบบที่ถูกต้องแล้วบันทึกซ้ำอีกครั้ง (ค่าที่กรอกไว้เดิมไม่หาย) — ดูหัวข้อ "หน้าแรก
> (index.html)" ด้านล่าง — ก่อนหน้านั้นในวันเดียวกัน: **"หน้าแรก" (index.html) จัดการผ่าน Page Management ได้เต็มรูปแบบแล้ว**
> (ไฟล์ใหม่ `index-sections-render.js`) ครอบคลุม 6 section เดิม: Our Story/What We Do ย้ายเนื้อหาเข้า
> `page_sections` จริงเป็น custom-html (คงดีไซน์เดิมไว้ตามที่ผู้ใช้เลือก), Online Shop/Newsroom/Our
> Partners/Contact Us เป็น "proxy section" — ไม่ย้าย HTML/JS จริงเข้า DB (เพราะมี JS ผูกอยู่จริง ดึงสินค้า/
> ข่าว/ฟอร์มติดต่อ ย้ายจะพังเงียบๆ) แค่ย้ายตำแหน่ง DOM เดิม + เพิ่มพื้นหลังให้ ทั้ง 6 section จัดลำดับ
> ก่อน-หลังและตั้งพื้นหลัง (รูป/สี/gradient) ได้หมด ทดสอบแล้วว่าย้ายตำแหน่งไม่กระทบ JS เดิมเลย (สินค้า/ข่าว/
> โลโก้พันธมิตร/ฟอร์มติดต่อ ยังทำงานปกติหลัง reorder) — `cms/pages.js` ปักหมุด "หน้าแรก" เป็นแถวแรกสุด,
> `cms/page-editor.js` ป้องกันไม่ให้แก้ marker ของ proxy section โดยไม่ตั้งใจ — seed ผ่าน
> `cms/seed-index-sections.sql` (ต้องรันหลัง schema-pages-v7) **— 4 proxy section seed สีพื้นหลังจริงที่
> ใช้งานอยู่ปัจจุบันไว้ให้เลย** (ดึงจาก background-color ใน style.css ตรงๆ: Online Shop/Our Partners
> `#f4f3f1`, Newsroom `#ffffff`, Contact Us `#123c9e`) แทนที่จะปล่อยว่าง ผลลัพธ์ตอน render เหมือนเดิมทุก
> ประการ (ตรวจสอบแล้วว่า 4 section นี้ direct child เดียวไม่มีตัวไหน position:absolute เดิมอยู่ จึงปลอดภัย
> ที่จะ apply overlay) — ดูหัวข้อ "หน้าแรก (index.html)" ใต้
> "ระบบจัดการเพจ" ด้านล่าง — ก่อนหน้านั้นในวันเดียวกัน: **พื้นหลัง section เลือกได้ 3 แบบแล้ว** ในหน้า "จัดการรูปภาพ" ของ
> `cms/page-editor.html`: รูปภาพ (เดิม)/สีพื้น/gradient เส้นตรง (บน→ล่าง หรือ ขวา→ซ้าย) เก็บใน
> `page_sections.bg_type`/`bg_color`/`bg_gradient_from`/`bg_gradient_to`/`bg_gradient_direction` คอลัมน์ใหม่
> (`cms/schema-pages-v7.sql`), เพิ่ม `.page-section { margin: 0; }` ให้ชัดเจนว่า section ไม่มี margin
> บน/ล่าง เพื่อให้ตั้งพื้นหลังต่อเนื่องข้าม section ได้จริง, และแก้บั๊กเดิม (`.page-section--has-bg`
> ที่เคยเช็คแค่ `bg_image`) ให้ครอบคลุมทั้ง 3 แบบด้วย ไม่งั้นบั๊กพื้นหลังซีดจางตอนลด opacity จะกลับมาเฉพาะกับ
> สีพื้น/gradient — ดูหัวข้อ "ระบบจัดการเพจ" ด้านล่าง — ก่อนหน้านั้นในวันเดียวกัน: **แก้บั๊ก: คัดลอกข้อความจากที่อื่นมาวางใน rich text editor แล้วมีสีพื้นหลัง
> ติดมาด้วย** (เจอบ่อยตอนแปะ description ลง section ที่ตั้ง bg_image ไว้ สีพื้นหลังที่ติดมากับตัวอักษรไปทับ
> พื้นหลัง section เอง) — เพิ่ม `window.CMS_QUILL_FORMATS` ใน `cms/upload.js` จำกัด format ที่ editor
> ยอมรับไว้แค่เท่าที่มีปุ่มใน toolบาร์ ตัด `background` format ที่ Quill รองรับอยู่แล้วในตัว (แม้ไม่มีปุ่ม)
> ออกทั้งตอนพิมพ์และตอนวาง — ใช้ร่วมกับ `formats:` option ตอน `new Quill(...)` ทั้ง 3 ไฟล์ (สินค้า/บทความ/
> section เพจ) ดูหัวข้อ "Rich Text Editor กลาง (Quill)" ด้านล่าง — ก่อนหน้านั้นในวันเดียวกัน: เพิ่ม
> **checkbox "เปิดใช้งาน Grayscale Filter" ต่อ section** ใน modal
> "จัดการรูปภาพ" ของ `cms/page-editor.html` (default ติ๊กไว้ คงพฤติกรรมเดิม — รูปในกริดขาวดำ เปลี่ยนเป็นสี
> ตอน hover — ปลดติ๊กได้เพื่อให้เป็นสีจริงตลอด) เก็บใน `page_sections.images_grayscale` คอลัมน์ใหม่
> (`cms/schema-pages-v6.sql`) คนละคอลัมน์กับ `bg_grayscale` เดิมที่คุมพื้นหลัง — ก่อนหน้านั้นในวันเดียวกัน:
> (1) **Page Management**: หัวข้อ/เนื้อหา section ไม่บังคับกรอกแล้ว, แก้บั๊ก
> section ที่มี bg_image ซีดจางเป็นสีขาวตอนลด opacity (เพิ่ม class `.page-section--has-bg` ให้พื้นหลังโปร่งใส
> จริง ไม่ทับด้วยสีขาว default ของ `.page-section`) — (2) **Rich text editor (Quill) เดียวกันหมดทั้งระบบ**
> (สินค้า/บทความ/section เพจ) รองรับ **สีตัวอักษร, ขนาดตามระบบ H1/H2/H3/ปกติ, แทรกรูป (อัปโหลดจริงไม่ใช่แค่
> พิมพ์ URL), จัดตำแหน่งซ้าย/กลาง/ขวา** — ย้าย config ไปไว้ที่เดียวใน `cms/upload.js`
> (`window.CMS_QUILL_TOOLBAR` + `window.cmsBindQuillImageUpload()`) แทนที่เคย copy-paste แยกกัน 3 ที่
> พร้อมเพิ่ม CSS รองรับ h1/h2/h3/img/align ให้ครบทั้ง 3 จุดที่ render จริงบนเว็บ (`.page-section__text`,
> `.news-detail__body`, `.pdp-info__desc`) — ดูหัวข้อ "Rich Text Editor กลาง (Quill)" ด้านล่าง — ก่อนหน้านั้น
> ในวันเดียวกัน: **เพจ standalone มี Hero Banner ของตัวเองได้แล้ว** — `promo.html` เพิ่ม
> section Hero Banner + script includes (`hero-slider.js`/`banner-render.js`) เข้าไปแล้ว, `cms/banners.js`
> เพิ่ม dropdown เลือกเพจแบบ optgroup "เพจ Standalone" (ดึงจากตาราง `pages` โดยตรง ไม่ผ่านเมนู),
> `banner-render.js` แก้ `currentPage()` ให้ประกอบคีย์ `promo.html?slug=<slug>` แทนใช้แค่ชื่อไฟล์เฉยๆ
> (กันเพจ standalone ทุกอันแชร์แบนเนอร์ชุดเดียวกันเพราะใช้ไฟล์เดียวกันหมด) — ดูหัวข้อ "ระบบ Banner" ด้านล่าง
> — ก่อนหน้านั้นในวันเดียวกัน: **แก้บั๊กสำคัญ: เมนู/เพจใหม่เปิดไม่ได้ (404)** เพราะ `autoCreatePageForMenuItem()`
> ใน `cms/menu.js` เดิมสร้างแค่แถวข้อมูลใน `pages` ให้ ไม่เคยเช็คว่าไฟล์ `.html` จริงมีอยู่จริงไหม — แก้แล้ว
> ด้วยการเช็คไฟล์จริงด้วย `fetch(HEAD)` หลังสร้างเพจ ถ้าไม่เจอไฟล์จะสลับ `menu_items.url` ไปเป็น
> `promo.html?slug=<page_key>` ให้อัตโนมัติ (เปิดได้ทันทีไม่ต้องรอสร้างไฟล์ .html เอง) พร้อมเพิ่มลิงก์ "เปิดดู
> หน้านี้" ที่ใช้งานได้จริงใน `cms/pages.html`/`cms/page-editor.html` — ดูหัวข้อ "ระบบเมนู (Menu Management)"
> ด้านล่าง — ก่อนหน้านั้นในวันเดียวกัน: ปรับ CMS shell (topbar+sidebar) ที่ซ้ำกันทั้ง 9 หน้า หลายรอบ: **sidebar เป็น
> sticky แล้ว** (`position:sticky; top:0; height:100vh`) เห็นเมนูตลอดเวลาแม้ scroll เนื้อหายาว, **เพิ่มปุ่ม
> hamburger ย่อ/ขยาย sidebar** เหลือแค่ไอคอน (76px, จำสถานะด้วย `localStorage['cms-sidebar-collapsed']`,
> ห่อ label ข้อความเมนูเป็น `<span class="cms-nav__label">` ใหม่เพื่อให้ซ่อนด้วย CSS ได้), ย้ายปุ่ม
> "ออกจากระบบ" จาก footer ของ sidebar ไปเป็น dropdown ที่คลิก avatar มุมขวาบนแทน (เอา `.cms-nav__spacer`/
> `.cms-nav__footer` ออกไปด้วย), ลบเมนู "Media (เร็วๆ นี้)" ออกจาก sidebar (placeholder ไม่มีฟีเจอร์จริง),
> ลบช่องค้นหาและไอคอนแจ้งเตือนออกจาก topbar ทั้งหมด (ไม่เคยมีฟังก์ชันจริง), เปลี่ยนชื่อเมนู sidebar
> "Menu Management" → "จัดการเมนู" และ "Banner Management" → "จัดการแบนเนอร์" ให้เป็นไทยเหมือนเมนูอื่น,
> แก้เลย์เอาต์ topbar ที่เพี้ยนหลังเอาช่องค้นหาออก (`.cms-topbar__right` ไปชิดซ้ายเพราะ `space-between`
> เหลือ child เดียว) ด้วย `margin-left:auto` — ดูหัวข้อ "CMS: Topbar + Sidebar nav" ด้านล่าง — ก่อนหน้านั้น
> ในวันเดียวกัน: ปรับ modal "จัดการรูปภาพ" ใน `cms/page-editor.html`: แยก **Custom HTML**
> ออกจาก layout picker มาเป็น field ของตัวเอง (checkbox "ใช้งาน" แยกต่างหาก — ติ๊กแล้วปิดใช้งาน layout
> picker (เหลือ 4 ตำแหน่งรูป) + ช่องรูปภาพพร้อมกันทันที ด้วย class `.is-disabled` ใหม่), **เอาปุ่ม "👁️
> ดูตัวอย่าง" ออกจาก modal นี้แล้ว** (ซ้ำซ้อนกับ live preview ที่หน้ารายการมีอยู่แล้ว — ลบ preview overlay
> + `openPreview`/`closePreview`/`refreshModalPreview` ออกทั้งหมด), **เพิ่มปุ่มย่อ/ขยาย (▾/▸) ที่การ์ด
> section แต่ละใบในหน้ารายการ** (default ขยายเสมอ พับได้แค่ preview+ฟิลด์แก้ไข แถวปุ่มควบคุมยังแสดงตลอด)
> ก่อนหน้านี้ (2026-07-27): เพิ่มระบบจัดการเพจแบบเต็มรูปแบบ ต่อสายเข้ากับ Supabase จริงแล้ว รองรับรูปภาพ
> สูงสุด 4 ภาพต่อ section (จัดกริดอัตโนมัติ), แก้ไขหัวข้อ/เนื้อหา/ปุ่ม/anchor ได้ตรงหน้ารายการ (TH/EN),
> จัดลำดับด้วยปุ่มลูกศร, แก้บั๊ก DOMPurify ไม่โหลดใน preview iframe, ปุ่มบันทึกย้ายไป sticky bottom bar
> (**ยังไม่ได้รัน `cms/schema-pages-v2.sql` ถึง `v5.sql` เลยสักไฟล์ — ดู "สิ่งที่ต้องทำต่อ" ข้อ 1**)
> พร้อมแก้ไขรายชื่อหน้าเว็บที่ล้าสมัยในเอกสารนี้ให้ตรงกับสถานะจริง (ตรวจสอบซ้ำผ่าน Supabase REST API +
> ไล่ไฟล์จริงในโฟลเดอร์ — เอกสารเดิมยังอ้างอิงหน้าเว็บที่ถูกเปลี่ยนชื่อ/ลบไปแล้วหลายหน้า เช่น
> `beanie.html`/`beans.html` ซึ่งไม่มีอยู่จริงแล้ว)
>
> ก่อนหน้านี้ (เดิม): เพิ่มระบบ Subscribe, ระบบจัดการสินค้า (Product Management) แบบเต็มรูปแบบ,
> และระบบข่าวสาร (Newsroom Management) แบบเต็มรูปแบบ ทั้งหมดต่อสายเข้ากับ Supabase จริงแล้ว

## ภาพรวมสถาปัตยกรรม

เว็บไซต์เป็น **static multi-page site** ล้วนๆ — ไม่มี build step, ไม่มี framework (React/Vue ฯลฯ), ไม่มี bundler เขียน HTML/CSS/JS ตรงๆ วางไฟล์ที่ root ของโปรเจกต์ ทุกหน้าโหลด `style.css` ไฟล์เดียวร่วมกันทั้งเว็บ

Backend เดียวที่มีคือ **Supabase** (project ref: `gafvtbkmizxorqpmezna`) ใช้ 3 อย่าง:
1. **Postgres database** — ตารางทั้งหมด (ตรวจสอบจริงล่าสุดว่ามีข้อมูลอยู่ทุกตาราง):
   - `menu_items` — เมนู/submenu ของเว็บ (26 แถว)
   - `banners` — Hero Banner + KV Banner (11 แถว)
   - `subscribers` — อีเมลสมัครรับข่าวสารจาก footer (0 แถวตอนนี้ ยังไม่มีคนสมัครจริง)
   - `product_categories` / `products` — ระบบจัดการสินค้า (6 หมวดหมู่ / 5 สินค้า ปัจจุบัน)
   - `news_categories` / `news_articles` — ระบบข่าวสาร Newsroom (3 หมวดหมู่ / 4 บทความ ปัจจุบัน)
   - `pages` / `page_sections` — ระบบจัดการเพจ (18 แถวที่ seed ไว้ในไฟล์ migration — **ยังไม่ได้รันจริง**
     ดู "SQL migrations" ด้านล่าง — เมื่อรันแล้ว `page_sections` จะเริ่มต้นเป็น 0 แถวเสมอ ไม่มีการ auto-migrate
     เนื้อหาเดิมของแต่ละหน้าเข้ามาให้)
2. **Auth** — สำหรับ login เข้า CMS เท่านั้น (ไม่มีระบบสมาชิกฝั่งลูกค้า)
3. **Storage** — bucket ชื่อ `cms-uploads` (public read, login-required write) สำหรับรูปที่อัปโหลดผ่าน CMS

Credentials (`SUPABASE_URL`/anon key) อยู่ที่ `cms/config.js` และเว็บหลักก็ include ไฟล์เดียวกันผ่าน `<script src="cms/config.js">` (anon key ปลอดภัยที่จะฝังฝั่ง client เพราะ RLS policy คุมสิทธิ์เขียนอยู่แล้ว — อ่านได้สาธารณะ เขียน/ลบต้อง login)

## โครงสร้างไฟล์หลัก

```
*.html (root)          หน้าเว็บจริง (ดูรายชื่อด้านล่าง — แก้ไขล่าสุด 2026-07-27 ให้ตรงกับสถานะจริง)
style.css              CSS ทั้งเว็บไซต์ไฟล์เดียว
i18n.js                ระบบสลับภาษา TH/EN (ดูหัวข้อ "ระบบภาษา" ด้านล่าง)
nav-render.js          ดึงเมนูจาก Supabase (menu_items) มาแทน static <nav> ทุกหน้า
hero-slider.js         เอนจิ้น carousel ของ Hero Banner (auto-play/drag/dots) เรียกซ้ำได้
banner-render.js       ดึง Hero Banner (แยกตามเพจ) + KV Banner จาก Supabase มา render
cart.js                ตะกร้าสินค้า เก็บใน localStorage ใช้ร่วมทุกหน้า
subscribe.js           ผูกฟอร์ม subscribe ที่ footer ทุกหน้าให้ insert เข้าตาราง subscribers จริง
products-render.js     โมดูลกลาง: fetch/render สินค้าจริงจาก Supabase (products/product_categories)
                        เป็น .shop-card component เดียวกันทุกหน้า — ใช้โดย online_shop.html/
                        product-detail.html/cart.html/index.html (มี shuffleArray สำหรับสุ่มสินค้าด้วย)
news-render.js         โมดูลกลางแบบเดียวกันแต่สำหรับบทความ (news_articles/news_categories) เป็น
                        .blog-card component — ใช้โดย index.html/newsroom.html/news-detail.html
page-render.js         โมดูลกลางระบบจัดการเพจ (pages/page_sections) — render เป็น .page-section
                        (ดูหัวข้อ "ระบบจัดการเพจ" ด้านล่าง) ใช้โดยเพจเนื้อหา 16 หน้า + online_shop.html
                        (แบบเสริม) + promo.html (standalone) + index.html/career.html (เต็มรูปแบบ พร้อม
                        "static proxy section" — section ที่มี JS ผูกอยู่จริงในหน้าเว็บ เช่น Online Shop/
                        Newsroom/Our Partners/Contact Us ของหน้าแรก, ฟอร์มสมัครงานของหน้า career — จัดการ
                        ได้แค่พื้นหลัง+ลำดับ ไม่ย้ายเนื้อหา/JS จริงเข้ามา ดูหัวข้อ "ระบบจัดการเพจ" ด้านล่าง)
                        auto-init ทุก #pageSectionsContainer ที่เจอตอน DOMContentLoaded เหมือนกันหมดทุกหน้า
                        ไม่มีไฟล์เฉพาะหน้าแยกอีกต่อไป (เดิมหน้าแรกมี index-sections-render.js แยกต่างหาก
                        — ลบทิ้งแล้ว รวม logic เข้า page-render.js ตัวเดียวเพื่อใช้ซ้ำได้กับทุกเพจ)
promo.html              Template หน้า standalone ที่ไม่ผูกเมนู route ผ่าน ?slug=... สำหรับหน้า promotion
                        ที่ลิงก์จาก Hero Banner หรือใช้นอกเว็บไซต์ — **มี Hero Banner ของตัวเองแล้ว**
                        (จัดการผ่าน cms/banners.html เลือกจาก dropdown "เพจ Standalone" — ดูหัวข้อ
                        "ระบบ Banner" ด้านล่างเรื่องคีย์ page_url แบบ promo.html?slug=...)
line-login.js           ⚠️ ใหม่ ยังไม่ได้ deploy — โมดูลกลางของระบบสั่งซื้อผ่าน LINE (LINE Login OAuth +
                        openLineOrder) ใช้โดย cart.html/index.html/online_shop.html/product-detail.html/
                        products-render.js ดูหัวข้อ "ระบบสั่งซื้อผ่าน LINE" ด้านล่าง
line-callback.html      ⚠️ ใหม่ ยังไม่ได้ deploy — หน้าที่ LINE redirect กลับมาหลัง login (ดูหัวข้อ
                        "ระบบสั่งซื้อผ่าน LINE" ด้านล่าง)
404.html                ⚠️ ใหม่ ยังไม่ได้ deploy — หน้า 404 Page Not Found (redirect มาที่นี่อัตโนมัติจาก
                        page-render.js เมื่อเข้าถึงเพจ/เมนูที่ปิดใช้งาน/ถูกลบ ดูหัวข้อ "หน้า 404" ใต้
                        "ระบบจัดการเพจ")
partials.js            ⚠️ ไฟล์เก่าที่เลิกใช้แล้ว (เคยตั้งใจให้ header/footer โหลดผ่าน fetch()
                        แต่ตอนนี้ทุกหน้า inline header/footer เองในไฟล์ตรงๆ แทน — เหลือไว้เฉยๆ ไม่ได้ลบ)
header.html/footer.html ⚠️ ไฟล์อ้างอิงเก่า ไม่ได้ถูกใช้จริง (ทุกหน้ามี header/footer inline ของตัวเอง)

cms/                    Admin CMS แยกต่างหาก (ไม่ปนกับเว็บหลัก)
  login.html                     หน้า login (Supabase Auth) — มีโลโก้จริง + password field แบบ show/hide
  index.html + menu.js           Menu Management — CRUD/reorder เมนูหลายระดับ
  banners.html + banners.js      Banner Management — Hero (แยกตามเพจ) + KV
  subscribers.html + subscribers.js  Subscribe — table list อีเมล/วันที่/เวลาที่สมัคร, ลบได้
  products.html + products.js    รายการสินค้า — CRUD, stock inline, ค้นหา, กรองหมวดหมู่, multi-image,
                                  rich text description
  product-categories.html + .js  หมวดหมู่สินค้า — CRUD, drag reorder
  news-articles.html + .js       รายการบทความ (Newsroom) — CRUD, ค้นหา, กรองหมวดหมู่, rich text content
  news-categories.html + .js     หมวดหมู่บทความ — CRUD, drag reorder
  pages.html + pages.js          รายการเพจ (Page Management) — CRUD เพจ standalone, toggle active,
                                  ลิงก์ไป page-editor.html ต่อเพจ
  page-editor.html + .js         Section builder ต่อเพจ — CRUD/drag reorder section, ตั้งค่าเพจ
  upload.js                      helper อัปโหลดรูปขึ้น Supabase Storage ใช้ร่วมทุกโมดูลข้างบน
  app.js / config.js / supabase-client.js  ของกลางที่ทุกหน้า CMS ใช้ร่วมกัน
  style.css                      CSS เฉพาะ CMS (คนละไฟล์กับเว็บหลัก) — รวม Quill editor + multi-image
                                  gallery styles
  *.sql                          migration scripts (ดูตารางสถานะด้านล่าง)
```

**CDN libraries ที่ใช้ (ไม่มี build step จึงโหลดผ่าน `<script>`/`<link>` ตรงๆ):**
- Quill 2.0.2 (`cms/products.html`, `cms/news-articles.html`, `cms/page-editor.html`) — rich text editor
  สำหรับ description/content/เนื้อหา section — toolbar config กลางเดียวกันหมด ดูหัวข้อ "Rich Text Editor
  กลาง (Quill)" ด้านล่าง
- DOMPurify 3.x (`product-detail.html`, `news-detail.html`, และทุกหน้าที่มี `page-render.js`
  — ทั้งเพจเนื้อหา 16 หน้า + `index.html`/`career.html`/`online_shop.html`/`promo.html`) — sanitize HTML
  ก่อน render ด้วย `innerHTML` (จำเป็นเพราะ description/content/เนื้อหา section ตอนนี้เป็น HTML จริงจาก
  rich text editor ไม่ใช่ plain text แล้ว)

**รายชื่อหน้าเว็บหลักทั้งหมด (root *.html — ตรวจสอบจริงกับโฟลเดอร์ + Supabase menu_items 2026-07-27,
เอกสารเวอร์ชันก่อนหน้านี้ล้าสมัยมาก อ้างอิงหน้าเว็บที่ถูกเปลี่ยนชื่อ/ลบไปแล้ว เช่น `beanie.html`/`beans.html`
ซึ่งไม่มีอยู่จริงในโฟลเดอร์แล้ว):**

- Functional/dynamic pages: `online_shop.html`, `newsroom.html`, `cart.html`,
  `product-detail.html`, `news-detail.html`, `contact.html` (มีฟอร์มติดต่อจริง)
- `index.html`, `career.html` — ต่อสายเข้า Page Management แล้วเหมือนเพจเนื้อหาทั่วไป แต่มี section ที่เป็น
  "static proxy" (จัดการได้แค่พื้นหลัง+ลำดับ ไม่ย้ายเนื้อหา/JS จริงเข้ามา) ปนอยู่ด้วย — `index.html`:
  Online Shop/Newsroom/Our Partners/Contact Us เป็น proxy (ดึงสินค้า/ข่าว/ฟอร์มติดต่อจริง), `career.html`:
  section "Apply now" เป็น proxy (ฟอร์มสมัครงานจริง — dropdown ตำแหน่งงาน + อัปโหลดไฟล์/ยิงไป Edge Function)
  — ดูหัวข้อ "ระบบจัดการเพจ" ด้านล่าง
- เพจเนื้อหา 16 หน้า ที่ต่อสายเข้าระบบจัดการเพจ (Page Management) แล้ว — ดูหัวข้อด้านล่าง:
  `our_story.html`, `our_service.html`, `beans_ingredients.html`, `coffee_shop_equipment.html`,
  `beverage_ingredients.html`, `lumi.html`, `fuji_premium_water.html`, `oem_water.html`,
  `oem_beans.html`, `catering.html`, `snack_box.html`, `coffee_shop.html`, `fix_repair.html`,
  `vending.html`, `jungle.html`, `arabitia.html`
- `promo.html` — template หน้า standalone ใหม่ (ดูหัวข้อ "ระบบจัดการเพจ")

หมายเหตุ: `jungle.html`/`arabitia.html`/`beverage_ingredients.html`/`snack_box.html` มีไฟล์อยู่จริงแต่เมนู
ที่ผูกอยู่ใน `menu_items` เป็น `is_active = false` ตอนนี้ (จะไม่โผล่ในเมนูจริงบนเว็บ แต่ยังเข้าผ่าน URL ตรง
ได้ และยังจัดการ section ผ่าน Page Management ได้ปกติ) — `vending.html` มีไฟล์อยู่จริงแต่ไม่มีแถวใน
`menu_items` เลย (orphan จากมุมมองเมนู)

**⚠️⚠️ `products.html` ถูกลบไปแล้ว (ผู้ใช้ตั้งใจลบเองนอก session ยืนยันแล้วว่า "ไม่ได้ใช้หน้านั้นแล้ว"):**
ผลคือมี **dead link ค้างอยู่ ~27 ไฟล์** ที่ header nav dropdown "สินค้า" ยังลิงก์ไปที่ `products.html` และ
`products.html?category=...` (nav เป็น static inline ต่อหน้า ไม่ได้ใช้ nav-render.js สำหรับ mega-menu
ทั้งหมด) รวมถึง breadcrumb เดิมในบางหน้า — **ยังไม่ได้แก้ทั้งหมด** เพราะผู้ใช้ยังไม่ตอบว่าจะให้ repoint
ไปที่ `online_shop.html` (ซึ่งตอนนี้ทำหน้าที่ browse สินค้า+กรองหมวดหมู่แทนแล้ว) หรือหน้าไหน — ดู "สิ่งที่
ต้องทำต่อ" ข้อ 1 หน้าใหม่ที่สร้างเอง (`news-detail.html`) แก้ให้ชี้ `online_shop.html` แล้วเรียบร้อย
แต่ไฟล์เก่าที่มีอยู่แล้วยังไม่ได้แตะ

**ไฟล์ orphan ที่ไม่ได้ลิงก์จากที่ไหนเลย (ไม่ได้ลบ แค่ไม่มีอะไรชี้มาแล้ว):**
- `index1.html`, `our_service1.html` — backup เก่า (ผู้ใช้ยืนยันแล้วว่าไม่ใช่ตัวจริง)
- `news-beanie-launch.html`, `news-kaset-fair.html`, `news-chinese-new-year.html` — เคยเป็นหน้ารายละเอียด
  ข่าว static 3 ไฟล์แยกกัน ตอนนี้ถูกแทนที่ด้วย `news-detail.html?id=<uuid>` แบบ dynamic แล้ว (เนื้อหาถูก
  ย้ายเข้า Supabase ผ่าน seed data ใน `cms/schema-news.sql` ครบแล้ว) — ไฟล์เดิมยังไม่ได้ลบ

**⚠️ ประวัติสำคัญ:** `about.html` ถูกเปลี่ยนชื่อเป็น `our_story.html` และ `what-we-do.html` ถูกเปลี่ยนชื่อเป็น
`our_service.html` (เปลี่ยนโดยผู้ใช้เองนอก session) เคยทำให้ลิงก์เสียทั้งเว็บ — แก้ไปแล้วทั้งหมดด้วย
`cms/fix-broken-urls.sql` + แก้ href ตรงๆ ใน static HTML ทุกไฟล์ **ถ้าเปลี่ยนชื่อ/ลบไฟล์หน้าเว็บอีกในอนาคต
ต้องแก้ทั้ง 2 จุดเสมอ:** (1) href ใน static HTML ทุกหน้า (2) `url` column ในตาราง `menu_items`
(เหตุการณ์ `products.html` ข้างบนคือตัวอย่างที่ยังไม่ได้แก้ครบ)

## ระบบภาษา (TH/EN)

- Pattern: element ไหนอยากให้สลับภาษาได้ ใส่ `data-th="..."` หรือ `data-en="..."` (ใส่แค่ฝั่งที่ไม่ตรงกับ
  เนื้อหา default ในเว็บ — อีกฝั่งจะถูก cache อัตโนมัติจากเนื้อหาปัจจุบัน) รองรับ attribute ด้วย:
  `data-en-placeholder` / `data-en-aria-label` / `data-en-alt` / `data-en-title` (และ `data-th-*` กลับกัน)
- ปุ่มสลับภาษา: dropdown มุมขวาบนของ header (ธงชาติ TH/EN) จัดเก็บค่าที่เลือกไว้ที่ `localStorage['cpbf-lang']`
- Element ที่ถูกสร้างทีหลังด้วย JS (เมนูจาก Supabase, Hero/KV Banner, สินค้า/บทความจาก products-render.js
  และ news-render.js) ต้อง dispatch `document.dispatchEvent(new CustomEvent('navRendered'))` หลังสร้างเสร็จ
  เพื่อให้ `i18n.js` มา apply ภาษาซ้ำ (⚠️ products-render.js/news-render.js **ยังไม่ได้ dispatch event นี้**
  ตอนนี้การ์ดสินค้า/บทความที่ render ทีหลังจะไม่ถูก i18n.js แปลภาษาอัตโนมัติ — เป็นข้อจำกัดที่รู้อยู่
  `page-render.js` (ระบบจัดการเพจ) ทำถูกต้องแล้ว — dispatch `navRendered` ทุกครั้งหลัง render section เสร็จ
  เป็นตัวอย่าง pattern ที่ถูกต้องถ้าจะแก้ไฟล์เก่าสองไฟล์นี้ในอนาคต)
- **ข้อจำกัดที่ตั้งใจ (page-render.js)**: เนื้อหา rich text ของ section (`heading_th`/`body_th` เป็นต้น)
  render เฉพาะภาษาไทยเท่านั้น ไม่สลับเป็น EN ตาม `cpbf-lang` — เป็น pattern เดียวกับที่ใช้อยู่แล้วทั่วทั้งเว็บ
  สำหรับเนื้อหาไดนามิกจาก Supabase (`product-detail.html`/`news-detail.html`/products-render.js ก็ render
  แค่ `name_th`/`description_th` เท่านั้นเช่นกัน แม้จะมีคอลัมน์ `_en` เก็บไว้ใน DB แล้วก็ตาม) ฟิลด์ `_en` ของ
  page_sections ถูกเก็บไว้รอวันที่ระบบ i18n รองรับ dynamic content จริง ยังไม่ได้ใช้งาน

## ระบบเมนู (Menu Management)

- เมนูทั้งเว็บ (header nav) ไม่ได้ hardcode ใน HTML อีกต่อไป — `nav-render.js` ดึงจากตาราง `menu_items`
  (รองรับหลายระดับไม่จำกัดชั้น ผ่าน `parent_id`) มาสร้าง `<nav>` ใหม่ทับ static fallback เดิมทุกครั้งที่โหลดหน้า
  ถ้าดึงไม่สำเร็จ (เน็ตหลุด/ตั้งค่าไม่ครบ) จะคง static fallback เดิมไว้ ไม่พังทั้งหน้า
- จัดการเมนูผ่าน `cms/index.html` (Menu Management): Add/Edit/Delete/**drag-and-drop reorder**/Enable-Disable,
  ฟิลด์ครบ (ชื่อ TH/EN, URL, Parent, Icon, Image พร้อมอัปโหลดไฟล์จริง, Open New Tab)
- ⚠️ บั๊กที่เจอและแก้แล้ว: เมนูใหม่เคยได้ `sort_order` ซ้ำกับตัวที่มีอยู่ ทำให้ลากจัดลำดับไม่ได้ผล — แก้เป็น
  `max(sibling sort_order) + 1` แล้ว พร้อม self-healing pass ที่รันทุกครั้งที่เปิดหน้า Menu Management
- **เมนูใหม่ auto-สร้างเพจเปล่าใน Page Management ให้ทันที** (`autoCreatePageForMenuItem()` ใน `menu.js`,
  รันตอนสร้างเมนูใหม่เท่านั้น ไม่รันตอนแก้ไข) — ยกเว้น url ที่ไม่ใช่เพจเดี่ยวจริงๆ: ว่าง/`#` (dropdown parent
  เช่น "Our Products"), มี `#` (anchor ภายในหน้าเดิม เช่น `our_story.html#history`), มี `?` (query filter
  เช่น `products.html?category=...`) ถ้ามีเพจ orphan ที่ `page_key` ตรงกับ url อยู่แล้ว (ไม่เคยผูกเมนูไหน
  เช่น `vending`) จะผูก `menu_item_id` ให้แทนการสร้างซ้ำ ล้มเหลวแบบเงียบๆ ได้ถ้า `pages` table ยังไม่มี
  (เช่น ยังไม่ได้รัน schema-pages.sql) เพราะไม่ควรทำให้การสร้างเมนูหลักพังตามส่วนเสริมนี้ — เมนูที่ถูก**ลบ**
  ไม่ต้องทำอะไรเพิ่ม เพราะ `pages.menu_item_id` เป็น `on delete set null` อยู่แล้ว (เพจกลายเป็น orphan
  ยังจัดการต่อได้ปกติ ไม่หายไปไหน)
- **⚠️🔧 แก้บั๊กสำคัญ: เมนู/เพจใหม่เปิดไม่ได้ (404)** — ก่อนหน้านี้ `autoCreatePageForMenuItem()` สร้างแค่
  แถวข้อมูลใน `pages` ให้ แต่ไม่เคยเช็คว่าไฟล์ `.html` จริงที่พิมพ์เป็น url (เช่น `new_page.html`) มีอยู่จริง
  ในโปรเจกต์ไหม — ถ้าไม่มี (กรณีปกติสำหรับเพจใหม่ที่ยังไม่มีใครสร้างไฟล์+ต่อสาย page-render.js ให้ ซึ่งเป็น
  ไปไม่ได้ฝั่ง client เพราะเว็บนี้เป็น static site ไม่มี server ให้เขียนไฟล์ใหม่ตอน runtime) เมนูใหม่จะชี้ไป
  หน้าที่เปิดไม่ได้ทันที **แก้แล้ว**: หลังสร้างเพจเสร็จ เช็คไฟล์จริงด้วย `fetch(url, {method:'HEAD'})` (ต้อง
  ขึ้น `../` ก่อนเพราะ `menu.js` รันอยู่ใน `cms/`) ถ้าไม่เจอไฟล์จริง จะ**สลับ `menu_items.url` ให้ชี้ไป
  `promo.html?slug=<page_key>` โดยอัตโนมัติ** (เหมือนเพจ standalone) ซึ่งเปิดได้ทันทีผ่าน `page-render.js`
  โดยไม่ต้องรอสร้างไฟล์ `.html` ใหม่เลย — ถ้าจะสร้างไฟล์หน้าเว็บจริงทีหลัง (มี Hero Banner ของตัวเอง ฯลฯ)
  ก็แก้ `url` กลับเป็นชื่อไฟล์จริงได้เองทีหลังใน Menu Management — ทดสอบแล้วว่า url ที่ชี้ไฟล์จริงที่มีอยู่แล้ว
  (เช่น `our_story.html`) จะไม่ถูกแตะต้องเลย (ไม่มี regression)
  - **เพิ่มลิงก์ "เปิดดูหน้านี้" ที่ใช้งานได้จริงในทั้ง `cms/pages.html` และ `cms/page-editor.html`** เพื่อลด
    ความสับสนเรื่อง URL ที่ถูกต้องของแต่ละเพจ (เดิม `cms/pages.html` แสดงแค่ข้อความ `page_key + '.html'` หรือ
    `slug` เฉยๆ ไม่ใช่ลิงก์ และเข้าใจผิดได้ง่ายว่านั่นคือ URL จริง ทั้งที่เพจ standalone ต้องเปิดผ่าน
    `promo.html?slug=...` เท่านั้น ไม่ใช่ `<slug>.html` ตรงๆ) — ทั้งสองจุดคำนวณ URL ที่ถูกต้องจริงแบบเดียวกัน:
    เพจ standalone → `promo.html?slug=<slug>` เสมอ, เพจที่ผูกเมนู → `url` จริงของเมนูนั้น (`menu_items.url`
    ซึ่งจะถูกต้องเสมอหลังแก้บั๊กข้างต้น)
    > ⚠️ อัปเดต 2026-07-31: ข้อความข้างบนนี้**ล้าสมัยแล้ว** — เพจ standalone เปิดผ่าน `<slug>.html` ตรงๆ
    > ได้แล้วจริง (ผ่าน Netlify `_redirects` rewrite) ไม่ใช่ `promo.html?slug=...` อีกต่อไป ดูหัวข้อ
    > "เพจ standalone (URL สะอาด)" ใต้ "ระบบจัดการเพจ" ด้านล่างสำหรับรายละเอียดปัจจุบัน — `autoCreatePageForMenuItem()`'s
    > fallback (บรรทัดข้างบน) ยังคงเขียน `promo.html?slug=...` ลง `menu_items.url` เหมือนเดิม (ไม่ได้แก้จุดนี้
    > เพราะไม่ใช่ขอบเขตที่ผู้ใช้ขอรอบนี้) แต่ยังใช้งานได้ปกติเพราะ `promo.html` อ่าน slug จาก query string
    > ได้เหมือนเดิมเป็น fallback อยู่แล้ว

**อัปเดต 2026-07-31 — ปรับ UI/UX เพิ่มเติม**:
- **ลบปุ่ม "ขยายทั้งหมด" ออก** (default ขยายทุกแถวอยู่แล้ว ปุ่มนี้ไม่มีประโยชน์ซ้ำซ้อน)
- **แถวเมนูหลัก (depth 0) มีพื้นหลังสีเทาอ่อนต่างจากเมนูย่อย (depth 1)** ให้เห็นชัดเจนว่าอันไหนเป็นระดับบนสุด
  (`.cms-menu-row[data-depth="0"] td` ใน `cms/style.css`)
- **เมนูย่อยสร้างได้แค่ 1 ชั้นเท่านั้น (รวมเมนูหลัก = 2 ระดับ)** — แก้ปัญหาที่เคยสร้างเมนูย่อยซ้อนเมนูย่อย
  (depth 2) ได้แต่ render ผิดเพี้ยน/ไม่แสดงผลตามที่ตั้งใจ: `renderParentOptions()` ใน `menu.js` กรอง
  dropdown "Parent" ให้เหลือแค่เมนูระดับบนสุดเท่านั้น (ไม่ไล่แสดงเมนูย่อยเป็นตัวเลือกต่ออีกต่อไป) พร้อม guard
  ซ้ำอีกชั้นตอน `submitForm()` เผื่อ dropdown มีตัวเลือกหลุดมาได้
- **ปุ่ม "+ ย่อย" แสดงเฉพาะแถวเมนูหลัก (depth 0) เท่านั้น** แถวเมนูย่อย (depth 1) จะไม่มีปุ่มนี้อีกต่อไป
  (สอดคล้องกับข้อจำกัด 2 ระดับข้างบน)

## ระบบ Banner (Hero Banner + KV Banner)

- **Hero Banner**: แยกการจัดการ **ตามหน้าเพจ** (คอลัมน์ `page_url` ในตาราง `banners`) — แต่ละเพจมีโควตา
  แบนเนอร์ของตัวเองสูงสุด 5 อัน ถ้าเพจไหนไม่มีแบนเนอร์ที่ active เลย section จะถูก **ซ่อนไปทั้งหมด**
  (ไม่ใช้ fallback แบบเดิมอีกต่อไป — ถือว่า fetch ไม่สำเร็จ = ซ่อนเหมือนกัน เพื่อความสม่ำเสมอ)
- **KV Banner**: ⚠️ อัปเดต 2026-07-31 — **แยกการจัดการตามหน้าเพจเหมือน Hero Banner แล้ว** (เดิมใช้ร่วมกัน
  ทั้งไซต์ แสดงเฉพาะ `index.html` ไม่มีแนวคิดเรื่องเพจเลย) — มี page picker ของตัวเอง (component เดียวกับ
  Hero), บันทึก `page_url` จริง, โควตา 5 ต่อเพจแยกกัน (`cms/schema-banners-v3.sql`, ✅ รันแล้ว — ยืนยันผ่าน
  REST API 2026-08-01) — **เพิ่มความสามารถใหม่ที่ Hero ไม่มี: จัดลำดับเทียบกับ page_sections (Section) ของ
  เพจนั้นได้ด้วย** ผ่าน "static proxy section" พิเศษที่ `ensureKvProxySection(pageUrl, bannerId)` ใน
  `cms/banners.js` สร้าง/หาให้อัตโนมัติทุกครั้งที่บันทึก KV banner (สร้างครั้งแรกเท่านั้น ครั้งต่อไปเจอของเดิม
  แล้วไม่สร้างซ้ำ) — ⚠️ อัปเดต 2026-08-01: **banner แต่ละอันได้ proxy row ของตัวเองแล้ว ไม่ใช้ร่วมกันทั้งเพจ
  อีกต่อไป** (`anchor_id='kv-banner-<banner id>'` ผูกกับ banner นั้นตรงๆ ผ่าน id — เดิมใช้ค่าคงที่ `'kv-banner'`
  ตัวเดียวทั้งเพจ ทำให้ banner หลายอันของเพจเดียวกันถูกจัดกลุ่มมาแสดงต่อกันที่ตำแหน่งเดียวเสมอ ย้ายทีละอันแยกจาก
  กันไม่ได้ ไม่ตรงกับที่ผู้ใช้ต้องการ "เพิ่ม 2 ภาพต้องแยก 2 section จัดการแยกกันได้") `removeKvProxySection
  (bannerId)` ใหม่ลบ proxy row ทิ้งด้วยเมื่อ banner ถูกลบ (กันการ์ดค้างเปล่าใน page-editor.html) — แต่ละอันไป
  โผล่เป็นการ์ด "KV Banner — &lt;title_th&gt;" แยกกัน (ชื่อต่อท้ายมาจาก `loadKvBannerTitles()` ใหม่ใน
  `cms/page-editor.js` query `banners` table แยกอีกรอบ เพราะ `page_sections` เองไม่มีข้อมูล title) ใน
  `cms/page-editor.html`'s รายการ section ให้ลาก/กด ▲▼ จัดตำแหน่งเทียบกับ section อื่น**และกันเอง**ได้อิสระ
  (แก้ได้แค่พื้นหลัง+ลำดับเหมือน proxy อื่น เนื้อหาจริงยังแก้ผ่าน `cms/banners.html` เท่านั้น) — `cms/schema-
  banners-v4.sql` (ใหม่ **ยังไม่ได้รัน**) ลบ proxy row แบบเก่า (`anchor_id='kv-banner'`) ทิ้งแล้วสร้างใหม่ให้
  ทุก KV banner ที่ active อยู่ตอนนี้ — **ฝั่ง render**: ย้ายจาก `banner-render.js` (ลบ `renderKv()` ทิ้งแล้ว)
  มาไว้ใน `page-render.js` แทน เพราะต้องรู้ตำแหน่งที่ถูกต้องก่อน insert DOM — `isKvBannerProxy()` เช็ค prefix
  `anchor_id` ขึ้นต้นด้วย `kv-banner-` (ไม่ใช่ exact match แล้ว) แล้วแกะ banner id ออกมาหาใน `kvBanners` ที่
  fetch มาครั้งเดียวต่อเพจ (ไม่ได้เพิ่ม query ต่อ banner) เจอ proxy row ไหนจะสร้าง `#kvBannerContainer-<id>`
  ขึ้นใหม่เอง (id ไม่ซ้ำกันแล้ว — เดิมใช้ `#kvBannerContainer` ค่าเดียวกันหมดทุก banner ซึ่งเป็น invalid HTML
  ถ้ามีมากกว่า 1 อัน, ไม่มี `<section>` เดิมให้จับคู่เหมือน proxy ทั่วไป เพราะ KV Banner ไม่เคยมีไฟล์ HTML อื่น
  นอกจาก `index.html` ที่มี container นี้อยู่จริง) แล้วดึง banner ที่ตรงกับ id นั้นมา render ตรงตำแหน่ง — banner
  ที่ถูกลบ/ปิดใช้งานไปแล้วก็ไม่ render container ว่างๆ ออกมา — **ผลคือเพิ่ม KV Banner ให้เพจไหนก็ได้ในทุกเพจที่มี
  `#pageSectionsContainer` โดยไม่ต้องแก้ไฟล์ HTML ของหน้านั้นเลย** (ต่างจาก Hero Banner ที่ยังต้องมี
  `#heroSection` วางไว้ใน static HTML ของแต่ละหน้าเองอยู่ดี) — ดูหัวข้อ "static proxy section" ใต้
  "ระบบจัดการเพจ" สำหรับกลไกเต็ม
- ฟิลด์ต่อแบนเนอร์: Image TH/EN (อัปโหลดไฟล์จริงได้), Title TH/EN, Description TH/EN, Button, Link,
  **Text Alignment** (ซ้าย/กลาง/ขวา — ปรับทั้งตำแหน่งและทิศทาง scrim gradient ให้อ่านง่ายเสมอ), Active
  **ไม่มี** "kicker tag" (เช่น "สินค้าพรีเมียม") แล้วตามที่ผู้ใช้สั่งให้ตัดออก
- **หน้าเพจ (Page) เลือกแบบ dropdown** ดึงชื่อจาก Menu Management (Name TH) เฉพาะเมนูที่ active เท่านั้น
  (เดิมเป็น text input พิมพ์เอง) — "หน้าแรก" ปักหมุดบนสุดเสมอ (ไม่มีเมนูของหน้าแรกใน Menu Management)
  หน้าที่มีแบนเนอร์อยู่แล้วแต่เมนูถูกปิดใช้งาน/ไม่เคยอยู่ในเมนูเลย จะขึ้นกลุ่มท้ายสุดพร้อม tag "(inactive)"
  เพื่อไม่ให้ตกหล่นจาก dropdown ทั้งที่ยังมีข้อมูลอยู่ — ยกเว้นหน้าประเภท detail (news/product detail)
  ที่ไม่เคยอยู่ในเมนูเลยจะไม่ขึ้นเป็นตัวเลือก เพราะไม่ควรมี Hero Banner ให้จัดการ
  - **เพจ standalone (ไม่ผูกเมนู) ก็เลือกจาก dropdown นี้ได้เหมือนกัน** ขึ้นเป็น optgroup แยกต่างหาก
    "เพจ Standalone" (ดึงจากตาราง `pages` ที่ `is_standalone=true` และ `is_active=true` โดยตรง ไม่ผ่าน
    menu_items เลยเพราะไม่มีเมนู) — ค่าที่เก็บใน `banners.page_url` เป็น `promo.html?slug=<slug>` ไม่ใช่
    ชื่อไฟล์เฉยๆ เพราะเพจ standalone ทุกอันใช้ไฟล์ `promo.html` ไฟล์เดียวกันหมด ต้องแยกด้วย slug ไม่งั้น
    ทุกเพจ standalone จะแชร์ Hero Banner ชุดเดียวกัน — `banner-render.js`'s `currentPage()` ประกอบคีย์
    เดียวกันนี้เองตอน render จริงบนเว็บ (อ่าน `?slug=` จาก URL แล้ว `encodeURIComponent` ต้องตรงกับฝั่ง
    CMS เป๊ะๆ) เพจ standalone ที่ถูกปิดใช้งานแต่มีแบนเนอร์อยู่แล้วจะไปโผล่ในกลุ่ม "(inactive)" เหมือนกับ
    เมนูที่ถูกปิดใช้งาน (symmetric logic เดียวกัน)
- จัดการผ่าน `cms/banners.html`: แท็บ Hero/KV แยกกัน, Add/Edit/Delete/**drag-and-drop reorder**/
  Preview (มี toggle ดู TH/EN)/Enable-Disable
- หน้าที่ต่อสาย Hero Banner ไว้แล้ว (มี `<section id="heroSection" hidden>` + script includes) — แก้ไข
  ลิสต์นี้ให้ตรงกับไฟล์จริง 2026-07-27 (เวอร์ชันก่อนหน้าอ้างอิงหน้าที่ไม่มีอยู่แล้ว):
  `index.html`, `online_shop.html`, `our_story.html`, `our_service.html`, `beans_ingredients.html`,
  `coffee_shop_equipment.html`, `beverage_ingredients.html`, `lumi.html`, `fuji_premium_water.html`,
  `oem_water.html`, `oem_beans.html`, `catering.html`, `snack_box.html`, `coffee_shop.html`,
  `fix_repair.html`, `vending.html`, `jungle.html`, `arabitia.html`
  (`newsroom.html`/`contact.html`/`career.html` มี Hero Banner เช่นกันแต่ไม่อยู่ใน scope ของ Page
  Management — ดูหัวข้อด้านล่าง; `promo.html` **มี Hero Banner แล้ว** เช่นกัน — คนละแบบกับหน้าอื่นตรงที่
  ไฟล์เดียวรองรับหลายเพจ standalone พร้อมกัน แยกด้วย page_url แบบ `promo.html?slug=...` ดูรายละเอียดในหัวข้อ
  "หน้าเพจ (Page) เลือกแบบ dropdown" ด้านบน)
- **⚠️ หน้าใหม่ที่จะเพิ่มในอนาคตต้องต่อสายเอง** — ไม่มีระบบ template อัตโนมัติเพราะเป็น static HTML แยกไฟล์
  วิธีทำ: copy block `<section class="hero-section" id="heroSection" hidden>...</section>` +
  `<script src="hero-slider.js">`/`<script src="banner-render.js">` จากหน้าที่มีอยู่แล้วไปวางในหน้าใหม่
  (ต้องอยู่หลัง `<script src="cms/config.js">`/`cms/supabase-client.js`/`nav-render.js`
  และก่อน `<script src="i18n.js">`)
- **⚠️ ข้อจำกัดที่ตั้งใจไม่แก้** (ผู้ใช้ยังไม่ได้ตอบคำถามที่ถามไว้): แถบไอคอน 4 อัน (`.about-features`
  "ผู้นำด้านอาหารและเครื่องดื่ม" ฯลฯ) ที่ index.html อยู่ติดกับ Hero Banner แบบไม่มีช่องว่างคั่น
  ผู้ใช้บอกว่า "ไม่ใช่ส่วนหนึ่งของ Hero banner ให้แยกออก" แต่ dismiss คำถามที่ถามกลับไปว่าหมายถึง
  (ก) แค่เพิ่ม spacing ให้ดูแยกจากกัน หรือ (ข) ดึง `.about-features` ออกมาเป็น `<section>` ของตัวเอง
  — **ยังไม่ได้ทำอะไรกับจุดนี้ ต้องถามผู้ใช้ใหม่ก่อนแก้**

## ระบบ Subscribe (สมัครรับข่าวสาร)

- ฟอร์ม subscribe ที่ footer ทุกหน้า (`.site-footer__newsletter-form`) ทำงานจริงแล้ว — `subscribe.js`
  ดัก submit, validate, insert เข้าตาราง `subscribers` (email unique — สมัครซ้ำจะขึ้นข้อความแจ้งแทน error)
- Layout fix สำคัญ: ข้อความสถานะ (สำเร็จ/error) เป็น `position:absolute` ซ้อนอยู่ในช่องที่จองพื้นที่ไว้แน่นอน
  (`padding-bottom` คงที่บน `.site-footer__newsletter-form`) เพื่อไม่ให้ field ขยับตำแหน่งตอนข้อความยาวสั้นต่างกัน
- จัดการรายชื่อผ่าน `cms/subscribers.html`: table list อีเมล/วันที่/เวลาที่สมัคร, ค้นหาด้วยอีเมล, ลบได้
- RLS: public **insert-only** (คนนอกสมัครได้แต่อ่าน/แก้/ลบไม่ได้), authenticated (CMS) select/delete ได้
- **Export เป็น Excel (.xlsx)** (เพิ่มใหม่ 2026-07-31 — ปุ่ม "⬇️ Export Excel" ที่ toolbar) — สร้างไฟล์ฝั่ง
  client ล้วนๆ ผ่านไลบรารี [SheetJS](https://sheetjs.com) (`window.XLSX` โหลดจาก CDN
  `xlsx@0.18.5/dist/xlsx.full.min.js` — เพิ่ม CDN ใหม่เฉพาะหน้านี้ ไม่ได้แชร์กับหน้าอื่น) ไม่ผ่าน server/
  Edge Function เลย — คอลัมน์ในไฟล์ตรงกับตารางที่เห็นในหน้าจอ (Email/วันที่/เวลา ใช้ `formatDate`/`formatTime`
  เดียวกับที่ render ตาราง) — **export รายชื่อทั้งหมดเสมอ ไม่ขึ้นกับคำค้นหาที่กรองอยู่บนหน้าจอ** ณ ตอนนั้น
  (ตั้งใจ ไม่ใช่บั๊ก — ยังไม่ได้ถามผู้ใช้ว่าต้องการ export เฉพาะผลลัพธ์ที่กรองไว้ด้วยหรือไม่)
  ชื่อไฟล์รูปแบบ `subscribe_ddmmyyyy_hhmm.xlsx` (เช่น `subscribe_31072026_1430.xlsx`, ใช้เวลาเครื่องผู้ใช้
  ตอนกด export ไม่ใช่เวลาของรายการล่าสุด) — export แล้วขึ้น toast "Export ไฟล์สำเร็จ" ทันที ถ้าไม่มีข้อมูล
  เลยจะขึ้น error toast แทนไม่สร้างไฟล์เปล่า — ทดสอบผ่าน browser จริงแล้ว (mock ข้อมูล 2 แถว, spy บน
  `XLSX.writeFile`/`XLSX.utils.json_to_sheet` ยืนยันชื่อไฟล์และเนื้อหา sheet ถูกต้องตามที่คาดไว้ทั้งหมด)

## ระบบจัดการสินค้า (Product Management)

ระบบเต็มรูปแบบ — จากเดิมที่สินค้าทั้งหมด hardcode เป็น static HTML ในทุกหน้า ตอนนี้ดึงจาก Supabase จริง

- **หมวดหมู่ (`product_categories`)**: จัดการผ่าน `cms/product-categories.html` — CRUD, drag reorder,
  เตือนก่อนลบถ้ามีสินค้าผูกอยู่ (สินค้าจะกลายเป็นไม่มีหมวดหมู่ ไม่ถูกลบตาม) seed เริ่มต้นคง slug เดิมที่เมนู
  ใช้อยู่แล้วเป๊ะๆ (`coffee-beans`, `coffee-equipment`, `beverage-ingredients`, `rtd`, `fuji-water`)
- **สินค้า (`products`)**: จัดการผ่าน `cms/products.html` —
  - Fields ทั้งหมด **required ยกเว้น SKU และ description EN**: ชื่อ TH/EN, หมวดหมู่ (dropdown, บังคับเลือก),
    ราคา, รูปภาพ (อย่างน้อย 1 ภาพ), รายละเอียดสินค้า TH
  - **รูปภาพสูงสุด 5 ภาพ** ต่อสินค้า (คอลัมน์ `images` เป็น `text[]`) — index 0 คือ **ภาพปก** เสมอ
    (คอลัมน์ `image` เดิมยังเก็บ URL ภาพปกไว้ตามเดิม เพื่อไม่ต้องแก้โค้ดฝั่งแสดงผลที่มีอยู่แล้ว) ใน CMS
    คลิก ★ ที่ภาพไหนก็ได้เพื่อสลับให้เป็นภาพปกแทน
  - **รายละเอียดสินค้าเป็น rich text editor (Quill)** ไม่ใช่ textarea ธรรมดาแล้ว — จำกัดสูงสุด **5,000
    ตัวอักษร** (เพิ่มจาก 1,000 เดิมตามที่ผู้ใช้ขอ 2026-07-31 — แก้ค่าคงที่ `MAX_DESC_LENGTH` เดียวใน
    `cms/products.js` ทุกอย่างอื่น (counter/auto-truncate/validation) ผูกกับค่านี้อยู่แล้วเลยเปลี่ยนจุดเดียวพอ)
    (นับจาก plain text ไม่รวม HTML tag) พร้อม counter แบบ real-time และ auto-truncate ถ้าพิมพ์/วางเกิน
    เก็บเป็น HTML string ใน `description_th`/`description_en`
  - ⚠️ **ซ่อนฟีเจอร์ stock ออกจาก CMS แล้วตามที่ผู้ใช้ขอ 2026-07-31 (ยังไม่ได้ใช้งานจริง)** — เอาคอลัมน์
    "สต็อก" ออกจากตาราง list แล้ว (ลบ `updateStock()`/`.cms-stock-input` CSS ที่ผูกกับ inline-edit เดิมทิ้ง
    ไปด้วยเพราะไม่มีที่ไหนเรียกใช้อีก), เอาฟิลด์ "จำนวนสต็อก" ออกจากฟอร์ม add/edit (เปลี่ยนเป็น
    `<input type="hidden" id="fieldProductStock" value="9999">` แทน — ตั้งเป็น **9999 ไม่ใช่ 0** สำหรับสินค้า
    ใหม่ เพราะ `isOutOfStock` check ฝั่งเว็บหลัก (`Number(stock) <= 0`) จะพาสินค้าใหม่ไปแสดงเป็น "สินค้าหมด"/
    ปิดปุ่ม Add to cart ทันทีถ้าปล่อยเป็น 0 — สินค้าที่มีอยู่แล้วตอนแก้ไข (edit) ยังคงค่า `stock` เดิมไว้ไม่
    เปลี่ยน แก้เฉพาะ default ของสินค้าใหม่เท่านั้น) คอลัมน์ `products.stock` ใน DB ยังอยู่เหมือนเดิม (ไม่ได้ลบ
    schema) แค่ไม่โชว์ใน UI CMS แล้ว — stat card "สินค้าหมดสต็อก" ที่หน้า list ไม่ได้แตะ (ยังคำนวณจาก
    `item.stock` เหมือนเดิม ไม่ได้อยู่ในขอบเขตที่ขอ)
  - ค้นหาด้วยชื่อ + กรองด้วยหมวดหมู่ ที่หน้า list ได้
  - **ทุก field ที่ validate ไม่ผ่านตอน submit จะ scroll+focus ไปที่ field นั้นให้อัตโนมัติ** (รวมถึง
    rich text editor และปุ่มอัปโหลดรูปซึ่งไม่ใช่ input ธรรมดา)
- **หน้าเว็บหลักที่ต่อสายแล้ว**:
  - `online_shop.html` — เรียงสินค้าตาม **created_at ใหม่ไปเก่า**, โหลดทีละ 12 ชิ้นแบบ **lazy-load/
    infinite scroll** (IntersectionObserver จับตอนเลื่อนใกล้ท้ายรายการ), มี category filter tiles
    (ดึงจาก `product_categories` ที่ active ทั้งหมด)
  - `product-detail.html` — route จริงผ่าน `?id=<uuid>` (เดิม hardcode เป็นสินค้าเดียวตลอด) แสดง
    gallery ถ้ามีมากกว่า 1 ภาพ, สต็อก, ปุ่ม Add to cart จะ disable ถ้าสินค้าหมด, related products
    **สุ่ม 5 รายการ** (ไม่จำกัดหมวดหมู่แล้ว)
  - `index.html` (หน้าแรก) — section "Online Shop" ถูกแปลงเป็น **horizontal-scroll carousel** (ทำนอก
    session โดยผู้ใช้ ต่อยอดจาก products-render.js ที่มีอยู่) แสดงสุ่มสูงสุด 10 รายการ
  - `cart.html` — section "สินค้าที่เกี่ยวข้อง" สุ่ม 5 รายการเช่นกัน (เดิม hardcode 4 การ์ด)
  - **Mobile**: บังคับ 2 คอลัมน์ต่อแถวแม้จอเล็กสุด (≤420px) เฉพาะ `#products .product-grid`
    (index.html + online_shop.html เท่านั้น — คนละไฟล์แต่ id ซ้ำกัน) ไม่กระทบ related-products grid
    ของ product-detail.html/cart.html ซึ่งใช้ id `#relatedProductGrid` แยกต่างหาก และแสดง **1 แถว
    5 คอลัมน์บนจอกว้าง ≥1200px** (media query เฉพาะ id นี้)
  - `site-search.js` (ช่องค้นหาที่ header) เปลี่ยนจาก scrape HTML ของ online_shop.html (ใช้ไม่ได้แล้ว
    เพราะการ์ดตอนนี้ render ด้วย JS) มาเป็น query ตาราง `products` ตรงๆ

## ระบบข่าวสาร (Newsroom Management)

โครงสร้างเดียวกับระบบสินค้าทุกประการ (คนละตารางเท่านั้น) — เดิม static HTML แยกไฟล์ต่อข่าว 1 ชิ้น

- **หมวดหมู่ (`news_categories`)**: จัดการผ่าน `cms/news-categories.html` — CRUD, drag reorder, seed
  คง slug เดิมที่ filter ใน newsroom.html ใช้อยู่แล้ว (`news`, `event`, `blog`)
- **บทความ (`news_articles`)**: จัดการผ่าน `cms/news-articles.html` —
  - Fields required: ชื่อ TH/EN, หมวดหมู่, รูปภาพหลัก (ภาพเดียว ไม่ใช่ multi-image แบบสินค้า),
    คำโปรย/สรุปย่อ TH, เนื้อหาบทความ TH (EN ไม่บังคับทั้งคู่)
  - **เนื้อหาบทความเป็น rich text editor (Quill)** เหมือนสินค้า แต่ **ไม่จำกัดจำนวนตัวอักษร** (บทความ
    ยาวได้ตามธรรมชาติ) toolbar มี heading (H2) เพิ่มมาด้วยเพราะเนื้อหาจริงใช้หัวข้อย่อยแบบ `<h2>`
  - ค้นหาด้วยชื่อ + กรองด้วยหมวดหมู่ ที่หน้า list, เรียงตาม created_at ใหม่ไปเก่าเสมอ (ไม่มี manual
    drag reorder เหมือนสินค้า เพราะ sort ตามวันที่ตายตัว)
  - focus-on-invalid-field เหมือนฟอร์มสินค้า
- **หน้าเว็บหลักที่ต่อสายแล้ว**:
  - `index.html` — section "Newsroom" แสดง **4 บทความล่าสุด** (created_at desc) เป็น grid ธรรมดา
    (ไม่ใช่ carousel แบบ Online Shop)
  - `newsroom.html` — category filter tiles ดึงจากหมวดหมู่ที่ active **ทั้งหมด** (ไม่ curate เอง),
    รายการเรียงใหม่ไปเก่าเสมอ, กรองตามหมวดหมู่ได้แบบ client-side re-fetch
  - `news-detail.html` — **หน้าใหม่ที่สร้างขึ้น** route ผ่าน `?id=<uuid>` แทนที่ 3 หน้า static เดิม
    (ดูหัวข้อ orphan files ข้างบน) มี share ไป Facebook/LINE (ใช้ URL จริงของหน้า), related articles
    สุ่ม 4 รายการไม่รวมบทความปัจจุบัน, content render ผ่าน DOMPurify เพราะเป็น HTML จาก rich text editor

## ระบบจัดการเพจ (Page Management / Section Builder)

ระบบใหม่ที่ให้แอดมินแก้เนื้อหาของเพจแบบ "flexible section" ได้เอง แทนที่จะต้องแก้ HTML ตรงๆ — ไม่รวมหน้า
product/news detail (ตามที่ตั้งใจไม่ให้จัดการผ่านระบบนี้) และไม่รวม `contact.html`/`newsroom.html` (มีฟอร์ม
จริง/เป็นหน้า listing แบบ dynamic อยู่แล้ว ไม่ใช่เนื้อหา static ธรรมดา) — `career.html` เข้าระบบนี้แล้ว
บางส่วน (ดูหัวข้อย่อย "หน้า career.html" ด้านล่าง) ผ่าน "static proxy section" pattern เดียวกับหน้าแรก

- **ตาราง `pages`**: 1 แถวต่อ 1 เพจ — `page_key` (ตรงกับชื่อไฟล์ เช่น `our_story`, null ได้เฉพาะเพจที่ไม่มี
  ไฟล์จริง), `slug` (unique, ใช้เป็นชื่อไฟล์ในลิงก์ `<slug>.html` สำหรับ standalone — ดูหัวข้อ "เพจ
  standalone (URL สะอาด)" ด้านล่าง), `menu_item_id` (FK ไปยัง
  `menu_items`, nullable), `title_th`/`title_en`, `is_standalone`, `is_active`
- **ตาราง `page_sections`**: หลายแถวต่อ 1 เพจ — `image`, `heading_th`/`en`, `heading_align`
  (`left`/`center`/`right`, default `left` — ดูหัวข้อ "การจัดตำแหน่งหัวข้อ" ด้านล่าง), `body_th`/`en`
  (rich text HTML จาก Quill), `button_text_th`/`en` + `button_link`/`button_link_en` (ทั้งหมด optional),
  `layout` (`image-left`/`image-right`/`image-top`/`image-bottom`/**`custom-html`**), `anchor_id`
  (optional — ใส่ถ้าต้องการให้เมนูย่อยลิงก์มาที่ section นี้ตรงๆ เช่น `#history`), `is_active`, `sort_order`
- **รูปแบบการจัดวางรูปภาพ (1-4 รูป) ต่างกันตาม `layout`**:
  - `image-left`/`image-right` — **collage** แบบ masonry เดิม (1 รูป: เต็มพื้นที่ | 2 รูป: ข้างกันเท่าๆ กัน |
    3 รูป: แถวบนกว้าง+แคบ + แถวล่างเต็ม | 4 รูป: กริด 2x2) — ฟังก์ชัน `buildCollageHtml()` ใน `page-render.js`
  - `image-top`/`image-bottom` — **แถวเดียว (image row)**: 1-4 รูปเรียงแถวเดียวเสมอ ขนาดเท่ากันทุกรูป
    กึ่งกลางแถว (ไม่ยืดเต็มความกว้าง) จำนวนคอลัมน์ = จำนวนรูปที่ใส่จริง **auto ตามจำนวน ไม่ต้องเลือกเอง** —
    ฟังก์ชัน `buildImageRowHtml()` ใหม่ (ไม่ใช้ collage เดิมเพราะดูไม่เข้ากับ layout ที่รูปอยู่เต็มความกว้าง
    ด้านบน/ล่างของข้อความ ไม่ใช่ข้างๆ กัน) — CSS: `.page-section__image-row`/`--{1,2,3,4}`/
    `-item` ใน `style.css` (`grid-template-columns: repeat(N, minmax(0, Npx))` + `justify-content:center`
    ให้หดตามจอแคบได้เองโดยไม่ต้องมี media query แยก)
- **การจัดตำแหน่งหัวข้อ (title)** — เฉพาะ layout ปกติ (ไม่ใช่ `custom-html` เพราะไม่มีฟิลด์หัวข้อแยก) เลือกได้
  ซ้าย/กลาง/ขวา ผ่าน picker ปุ่ม 3 ตัว (reuse `.cms-align-picker`/`.cms-align-picker__btn` เดียวกับ text
  alignment picker ของ Banner Management) ใน `cms/page-editor.js`'s `buildQuickEditFields()` ต่อจากฟิลด์
  หัวข้อ TH/EN — เก็บใน `page_sections.heading_align` (`cms/schema-pages-v8.sql`) — render ผ่าน
  `page-render.js`'s `buildSection()` เพิ่ม class `page-section__title--center`/`--right` ให้ `<h2>` (ซ้าย
  เป็นค่า default ไม่ต้องใส่ class เพิ่ม) — จำกัดผลแค่หัวข้อเท่านั้น ไม่กระทบการจัดวางเนื้อหา/ปุ่มข้างล่าง
  ตามที่ผู้ใช้ระบุขอบเขตไว้ชัดเจน
- **ขอบเขต 5 แบบ**:
  1. **เพจเนื้อหา 16 หน้า** (แทนที่เนื้อหาทั้งหน้า ยกเว้น header/hero/footer/floating-contact-widget) —
     ดูลิสต์เต็มที่หัวข้อ "รายชื่อหน้าเว็บหลักทั้งหมด" ด้านบน — container คือ
     `<div id="pageSectionsContainer" data-page-key="...">` วางแทนที่ `<section>` เนื้อหาเดิมที่เคย
     hardcode ไว้ (เนื้อหาเดิมถูก**ลบออกจากไฟล์ HTML แล้ว** ไม่ได้ auto-migrate เข้า `page_sections` ให้ —
     ดู "สิ่งที่ต้องทำต่อ" ข้อ 1 เรื่องผลกระทบ)
  2. **`online_shop.html` แบบเสริม (additive)** — container เดียวกันวางไว้ก่อน `<footer>` เท่านั้น
     ไม่แตะ section เดิมที่ทำงานอยู่แล้ว (Online Shop carousel — ตั้งใจคงไว้เป็น static/functional เดิม
     ไม่ย้ายเข้าระบบนี้ เพราะเป็น component ออกแบบเฉพาะที่ไม่ใช่ image+text ทั่วไป) — container นี้ตั้ง
     `data-additive="true"` ไว้ (เพิ่ม 2026-07-31) ให้ยกเว้นจากการ redirect ไปหน้า 404 อัตโนมัติ เพราะเนื้อหา
     จริงของหน้าเป็นอิสระจาก Page Management อยู่แล้ว ดูหัวข้อ "หน้า 404 (Page Not Found)" ด้านล่าง
  3. **`index.html` (หน้าแรก) — เต็มรูปแบบ พร้อม static proxy section** ดูรายละเอียดเต็มในหัวข้อย่อย
     "หน้าแรก (index.html)" ด้านล่างนี้
  4. **`career.html` — เต็มรูปแบบ พร้อม static proxy section** (ฟอร์มสมัครงาน) ดูหัวข้อย่อย
     "หน้า career.html" ด้านล่าง
  5. **Standalone pages** — ไม่ผูกเมนู สร้างผ่าน `cms/pages.html` เข้าถึงผ่าน URL สะอาด `<slug>.html`
     ตรงๆ (ดูหัวข้อ "เพจ standalone (URL สะอาด)" ด้านล่าง) สำหรับหน้า promotion ที่ลิงก์จาก Hero Banner
     button หรือใช้ยิงลิงก์ตรงนอกเว็บไซต์ — **มี Hero Banner ของตัวเองได้แล้ว** (จัดการผ่าน
     `cms/banners.html` เลือกจาก dropdown "เพจ Standalone" — ดูหัวข้อ "ระบบ Banner" ด้านล่าง)

### เพจ standalone (URL สะอาด — ไม่มี `promo.html?slug=` ให้เห็นอีกต่อไป)

**บริบท**: เดิมเพจ standalone ทุกอันเข้าถึงผ่าน `promo.html?slug=<slug>` (query string โผล่ให้เห็นใน address
bar) ผู้ใช้ขอให้เปิดผ่าน URL สะอาดแบบ `<slug>.html` ตรงๆ แทน — แต่เว็บนี้เป็น **static site ไม่มี server**
ให้เขียนไฟล์ `.html` ใหม่ตอน runtime ได้เลย (CMS รันอยู่ในเบราว์เซอร์ผู้ใช้ ไม่มีทางสร้างไฟล์บน hosting จริง)
จึงต้องอาศัย **URL rewrite ระดับ hosting** แทน — ผู้ใช้ยืนยันว่า deploy เว็บนี้ไว้ที่ **Netlify**

- **`_redirects`** (ไฟล์ใหม่ที่ root ของโปรเจกต์ — **ยังไม่ได้ deploy ขึ้น Netlify จริง**) — กฎเดียว:
  `/*.html  /promo.html?slug=:splat  200` — request ไปที่ path ที่**ไม่มีไฟล์ .html จริงตรงกัน** (เช่นเพจ
  standalone ที่เพิ่งสร้างใหม่) จะถูก rewrite แบบ 200 (ไม่ใช่ redirect 301/302 — address bar ไม่เปลี่ยนเลย)
  ไปโหลดเนื้อหาจาก `promo.html?slug=<slug>` แทน — **ปลอดภัยกับไฟล์จริงทั้งหมด** เพราะ Netlify เช็คว่ามีไฟล์
  ตรงกับ path ที่ขอก่อนเสมอ ถ้ามีไฟล์จริงจะ serve ไฟล์นั้นตรงๆ ไม่แตะกฎ redirect นี้เลย (กฎนี้ทำงานเฉพาะตอน
  ไม่มีไฟล์จริงตรงกันเท่านั้น)
- **`promo.html`** อ่าน slug ได้ 2 ทาง (`currentPromoSlug()`): (1) query string `?slug=...` (backward-compat
  กับลิงก์เก่าที่อาจมีคนแชร์ไว้แล้ว) (2) **path ของ URL เอง** เป็น fallback (เช่น `/summer-promo.html` →
  slug = `summer-promo`) — ใช้ทางนี้เมื่อเข้าผ่าน URL สะอาดที่ address bar ไม่มี query string ให้เห็นเลย
  (ผลของการ rewrite แบบ 200 คือ browser เห็นแค่ path ที่ขอจริง ไม่เห็น query string ปลายทาง) — เช็ค query
  string ก่อนเสมอเผื่อมีคนแชร์ลิงก์แบบเก่าอยู่
- **`cms/pages.js`/`cms/page-editor.js`/`cms/banners.js`** ทุกจุดที่แสดง/บันทึก URL ของเพจ standalone
  เปลี่ยนจาก `promo.html?slug=<slug>` เป็น `<slug>.html` แล้ว (ลิงก์ "เปิดดูหน้านี้", คีย์ `page_url` ใน
  ตาราง `banners` สำหรับ Hero Banner ของเพจ standalone)
- **⚠️🔧 Guard ใหม่**: ตอนสร้างเพจ standalone ใน `cms/pages.js` เช็คด้วย `fetch(HEAD)` ก่อนบันทึกเสมอว่า
  slug ที่ตั้งชนกับไฟล์ `.html` จริงที่มีอยู่แล้วในโปรเจกต์ไหม (เช่น พิมพ์ slug "career" ทั้งที่มี
  `career.html` จริงอยู่แล้ว) — ถ้าชนจะ block พร้อมข้อความเตือน เพราะไม่งั้นเพจนั้นจะเปิดไม่ได้เลยแบบเงียบๆ
  (Netlify serve ไฟล์จริงเสมอ ไม่มีวัน rewrite ไปที่ `promo.html?slug=...` ให้) — ใช้ pattern
  `checkFileExists()` เดียวกับที่ `cms/menu.js` ใช้อยู่แล้วสำหรับเช็คไฟล์เมนู
- **ชื่อเพจ (EN) เป็น required field แล้ว** (เพิ่ม `*`/`required` ใน `cms/pages.html`, validate ใน
  `submitForm()` เหมือน TH — เพิ่มใหม่ 2026-07-31 ตามที่ผู้ใช้ขอ) — **Slug auto-fill จากชื่อเพจ (EN) แบบ
  real-time ขณะพิมพ์** (ไม่ต้องกด generate เอง) หยุด auto-fill ทันทีที่แอดมินพิมพ์ในช่อง Slug เองโดยตรงครั้ง
  แรก (flag `slugManuallyEdited` เช็คจาก `input` event ของช่อง slug เอง ไม่ใช่ทุกครั้งที่ค่าถูกเซ็ตจากโค้ด —
  การ set `.value` ผ่าน JS ไม่ trigger `input` event เองอยู่แล้วตามธรรมชาติของ browser เลยไม่ชนกับ auto-fill)
  reset flag นี้ทุกครั้งที่เปิด modal ใหม่ — fallback ตอน submit เปลี่ยนจาก `slugify(slug || titleTh)` เป็น
  `slugify(slug || titleEn || titleTh)` ให้สอดคล้องกับที่ EN เป็นตัวขับเคลื่อน slug หลักแล้ว
- **ทดสอบแล้ว**: `currentPromoSlug()` ทดสอบเป็น pure function ผ่าน browser ยืนยันครบทุก case (query string
  เดิม, path แบบใหม่, ไม่มี slug เลย, ทั้งสองแบบพร้อมกันให้ query string ชนะ) — collision guard ยืนยัน
  positive case ถูกต้อง (slug "career" ตรวจพบว่าชนไฟล์จริง) — **negative case (slug ไม่ชนไฟล์ไหนเลย)
  ยืนยันไม่ได้สมบูรณ์ในสภาพแวดล้อมทดสอบ** เพราะข้อจำกัดของ `file://` protocol (`fetch HEAD` ไปที่ไฟล์ไม่มี
  จริงจะ throw error แทนที่จะได้ status 404 ปกติแบบ HTTP server จริง ทำให้ fallback "ถือว่ามีอยู่จริงไว้ก่อน"
  ของ `checkFileExists()` ทำงานเสมอในการทดสอบนี้ — จะทำงานถูกต้องจริงบน Netlify เพราะ HTTP request ไปที่ไฟล์
  ไม่มีจริงจะได้ response 404 ปกติ ไม่ throw)
- **⚠️ ยังไม่ได้ deploy `_redirects` ขึ้น Netlify จริง** — ต้อง deploy ก่อนถึงจะเปิดเพจ standalone ผ่าน URL
  สะอาดได้จริงบน production (ดู "สิ่งที่ต้องทำต่อ")

**"Static proxy section" pattern** (ใช้ร่วมกันโดย index.html/career.html — logic กลางอยู่ใน `page-render.js`
เดียวทั้งหมด ไม่มีไฟล์เฉพาะหน้าแยกอีกต่อไป เดิมหน้าแรกเคยมี `index-sections-render.js` แยกต่างหาก ลบทิ้งแล้ว
หลัง generalize): สำหรับ section ที่มี JS ผูกอยู่จริงในหน้าเว็บ (ดึงข้อมูลจาก Supabase ผ่าน inline script,
หรือฟอร์มที่ยิงไป Edge Function จริง) ที่ย้ายเนื้อหาเข้า DB มา render ใหม่แบบ async ไม่ได้ (จะทำให้ script
เดิมหา container ไม่เจอตอน `DOMContentLoaded` แล้วพังเงียบๆ) — `page_sections` row ประเภทนี้ไม่เก็บเนื้อหา
จริงใน `body_th` เลย (เก็บแค่ marker คงที่ `<!-- static-proxy -->`) มีไว้แค่เก็บพื้นหลัง (`bg_*`) + ลำดับ
(`sort_order`) เท่านั้น จับคู่กับ `<section>` เดิมที่ยังอยู่ใน HTML แบบ static เป๊ะๆ ผ่าน `anchor_id` ที่ตรง
กับ `id` จริงของ section นั้น — `page-render.js`'s `renderSections()` เช็คแค่ `!!anchor_id && body_th
=== marker` (ไม่ผูก anchor_id ตายตัวอีกต่อไป ใช้ได้กับทุกเพจ) แล้ว `document.getElementById(anchor_id)` หา
element เดิม, เพิ่มเลเยอร์พื้นหลังให้ถ้าตั้งค่าไว้ (`applyBgToStaticElement()`), แล้ว
`container.appendChild(existingEl)` **ย้าย** node เดิมเข้าตำแหน่งที่ถูกต้อง (ไม่ได้ลบ/สร้างใหม่ —
`appendChild` บน node ที่มีอยู่แล้วแค่ย้ายตำแหน่งใน DOM tree ไม่ทำให้ event listener หรือ reference ที่
script อื่นถืออยู่หายไป ไม่ว่า element จะอยู่ตรงไหนของหน้าก็ตาม) — `cms/page-editor.js`'s
`isStaticProxySection()` ก็เช็คแบบเดียวกัน (แค่ marker + มี `anchor_id`) เพื่อซ่อน "โค้ด HTML" textarea
ของ section ประเภทนี้ ป้องกันแอดมินแก้/ลบ marker โดยไม่ตั้งใจ

⚠️ **ข้อยกเว้นเดียวของ pattern นี้ (เพิ่ม 2026-07-31): KV Banner** (`anchor_id` ขึ้นต้นด้วย `kv-banner-`
ตามด้วย id ของ banner นั้นตรงๆ — ⚠️ อัปเดต 2026-08-01: เดิมเป็นค่าคงที่ `'kv-banner'` ตัวเดียวใช้ร่วมกันทั้งเพจ
ตอนนี้ 1 proxy row ต่อ banner 1 อันแล้ว ดูหัวข้อ "ระบบ Banner" ด้านบน) — ต่างจาก proxy อื่นๆ ทั้งหมดตรงที่
**ไม่มี `<section>` เดิมอยู่แล้วในหน้าให้จับคู่** (เพราะ KV Banner ไม่เคยมีไฟล์ HTML ไหนนอกจาก `index.html`
เดิมที่มี `#kvBannerContainer` จริง) — `page-render.js`'s `renderSections()` เช็ค `anchor_id` ขึ้นต้นด้วย
`kv-banner-` แยกก่อนเป็นพิเศษ (`isKvBannerProxy()`) แล้วแกะ banner id ออกจาก anchor_id (`kvBannerIdFromAnchor()`):
แทนที่จะ `getElementById()` หา element เดิม จะ**สร้าง `<div id="kvBannerContainer-<id>">` ขึ้นใหม่เอง** (id
ไม่ซ้ำกันในหน้าเดียวกันแล้ว แม้มีหลาย banner) แล้วหา banner ที่ id ตรงกันจาก `banners` (`section='kv'`,
`page_url`=เพจปัจจุบันจาก `window.cpbfBanners.currentPage()`, fetch ครั้งเดียวต่อเพจใช้ร่วมกันทุก proxy row)
มา build ด้วย `window.cpbfBanners.buildKvSection()` (expose มาจาก `banner-render.js` แทนการ duplicate markup)
ก่อน `applyBgToStaticElement()` เหมือน proxy อื่นทุกประการ — banner นั้นถูกลบ/ปิดใช้งานไปแล้วก็ return null
ไม่ใส่ container ว่างๆ เข้าไป — ผลคือ KV Banner "เพิ่มได้ในทุกเพจ" **และแยกจัดตำแหน่งได้ทีละอัน** โดยไม่ต้องแก้
ไฟล์ HTML ของหน้านั้นเลย ต่างจาก Online Shop/Newsroom/ฟอร์มสมัครงาน ที่ยังต้องพึ่ง `<section>` static ที่มี JS
ผูกอยู่จริงเสมอ — ดูหัวข้อ "ระบบ Banner" ด้านบนสำหรับรายละเอียดฝั่ง CMS (`ensureKvProxySection()`/
`removeKvProxySection()`)

### หน้า 404 (Page Not Found)

**บริบท** (เพิ่ม 2026-07-31): เดิมเข้าถึงเพจ/เมนูที่ปิดใช้งาน (หรือถูกลบ) ผ่าน URL ตรงๆ ได้ปกติเงียบๆ —
ไฟล์ `.html` จริง (เช่น `our_story.html`) ยัง serve header/hero/footer ตามปกติแค่ `#pageSectionsContainer`
ว่างเปล่า (เพราะ `fetchPageByKey()` เดิม query กรอง `is_active=true` แล้วได้ `null`) ไม่มีการแจ้งผู้ใช้เลยว่า
หน้านี้ไม่ควรเข้าถึงได้แล้ว — ผู้ใช้ขอให้แสดงหน้า 404 แทนในทั้ง 2 กรณี (เพจเอง inactive, หรือเมนูที่ผูกเพจนั้น
ไว้ inactive)

- **`isPageVisible(page)`** ใน `page-render.js` — จุดตัดสินใจเดียว คืน `false` ถ้า `!page.is_active` หรือ
  (มี `menu_item_id` ผูกอยู่ และ) `page.menu_items.is_active === false`
- **`fetchPageByKey()`/`fetchPageBySlug()`** เปลี่ยนจาก `.eq('is_active', true)` (กรองที่ query) มาเป็น
  **embedded select** `.select('*, menu_items(is_active)')` (PostgREST join ผ่าน FK `pages.menu_item_id`
  ที่มีอยู่แล้ว ไม่ต้อง query แยก 2 รอบ) แล้วเช็คด้วย `isPageVisible()` ใน JS แทน — เพจที่ไม่มี `menu_item_id`
  เลย (เช่น `index`/`online_shop`/เพจ standalone) จะได้ `menu_items: null` กลับมา ข้ามเงื่อนไขนี้ไปอัตโนมัติ —
  ยืนยันผ่าน REST API จริงแล้วว่า embedded select คืนค่าถูกต้องทั้ง 2 เคส (มี/ไม่มีเมนูผูกอยู่)
- **`init(container)`** — ถ้าเจอ `data-page-key`/`data-page-slug` (มีความพยายามค้นหาเพจจริง) แล้วได้ `page = null`
  กลับมา (ไม่ว่าเพราะไม่มีแถวเลย, `is_active=false`, หรือเมนูที่ผูกไว้ `is_active=false`) จะ
  **`window.location.replace('/404.html')`** ทันที — ยกเว้น container ที่ตั้ง **`data-additive="true"`** ไว้
  (ตอนนี้มีแค่ `online_shop.html` — ดูหัวข้อ "ขอบเขต 5 แบบ" ด้านบน) เพราะเนื้อหาจริงของหน้าเหล่านั้นทำงานเป็น
  อิสระจาก Page Management อยู่แล้ว ปิด/ลบเพจนี้ไม่ควรทำให้ทั้งหน้าใช้งานไม่ได้ — ครอบคลุมทุกเพจที่ใช้
  `page-render.js` โดยอัตโนมัติไม่ต้องแก้เพิ่มทีละไฟล์ (16 เพจเนื้อหา, `index.html`, `career.html`,
  `promo.html` มาตรฐาน)
- **`404.html`** (ไฟล์ใหม่ที่ root) — เพจ static ล้วน ไม่ผ่าน Page Management (ไม่ใช่ "เนื้อหา" ที่ควรแก้ไข
  ผ่าน CMS) ใช้ template เดียวกับ `promo.html` (header/nav/footer + script มาตรฐานชุดเดียวกัน) แต่ตัด
  hero-slider.js/banner-render.js/page-render.js/DOMPurify ออก (ไม่มี hero หรือ page section ให้ render)
  เหลือแค่ section เดียว: เลข "404" ใหญ่ + หัวข้อ/คำอธิบาย (รองรับ TH/EN ผ่าน `data-en`) + ปุ่ม "กลับหน้าแรก"
  (`.page-section__btn--primary`)
- **`_redirects`** เพิ่มกฎใหม่ท้ายไฟล์ (**ยังไม่ได้ deploy**): `/*  /404.html  404` — วางไว้ท้ายสุดเสมอ
  (Netlify จับกฎแรกที่ match ตามลำดับ) ให้ path ที่ไม่มีไฟล์จริงตรงกันเลยและไม่ใช่ `/*.html` (เช่น พิมพ์ผิด/
  ไม่มีนามสกุล) ได้หน้า 404 ของเราเอง (พร้อมสถานะ HTTP 404 จริง) แทน default 404 ของ Netlify — ไม่กระทบกฎ
  `/*.html` เดิมหรือไฟล์จริงใดๆ เลย (ทั้งสองอย่าง match ก่อนกฎนี้เสมอ) — ส่วน path แบบ `/<slug>.html` ที่ถูก
  rewrite ไป `promo.html` แล้วไม่พบเพจจริงจะไม่มาเจอกฎนี้เลย เพราะ `page-render.js` เป็นคน redirect ไป
  `/404.html` เองฝั่ง client อยู่แล้ว (คนละกลไกกัน — กฎนี้ดักเฉพาะ path ที่ Netlify เองไม่รู้จักเลยตั้งแต่ต้น)
- **ทดสอบผ่าน browser ครบแล้ว** (mock `cmsSupabase` จำลอง embedded select, mock ไม่ผ่านเพราะ browser ป้องกัน
  การ override `window.location.replace` ตรงๆ — เปลี่ยนมาทดสอบแบบปล่อยให้ redirect จริงแทน แล้วเช็ค URL/title
  หลังจากนั้น): เพจ active ไม่ผูกเมนู render sections ปกติไม่ redirect, container แบบ additive ที่หาเพจไม่เจอ
  ไม่ redirect เช่นกัน (ทั้งสองเคสยืนยันด้วย `beforeunload` listener ว่าไม่มีการนำทางออกจากหน้าเลย), เพจผูก
  เมนู inactive redirect ไป `/404.html` จริงถูกต้อง, เพจตัวเอง inactive redirect ไป `/404.html` จริงถูกต้อง
  (ยืนยันด้วย `window.location.href`/`document.title` หลัง redirect ทั้งสองเคส) — ยืนยัน embedded select
  ผ่าน REST API จริงแล้วด้วยว่าคืนค่าถูกต้องทั้งเพจที่มี/ไม่มี `menu_item_id` ผูกอยู่

### หน้าแรก (index.html) — เต็มรูปแบบ พร้อม static proxy section

**บริบท**: ผู้ใช้ขอให้ "หน้าแรก" จัดการได้ผ่าน Page Management เต็มรูปแบบ ครอบคลุม 6 section เดิม (Our
Story, What We Do, Online Shop, Newsroom, Our Partners, Contact Us) — ต้องรองรับพื้นหลัง + จัดลำดับ
ก่อน-หลังทั้งหมด และ Our Story/What We Do ต้องแก้ไขเนื้อหาได้จริง — **แต่ 4 section หลัง (Online Shop/
Newsroom/Our Partners/Contact Us) มี JS ผูกอยู่จริง** (ดึงสินค้า/ข่าวจาก Supabase ผ่าน inline `<script>`
ในตัว `index.html` เอง, ฟอร์มติดต่อที่ยิงไป Supabase Edge Function จริง) ถ้าย้าย HTML เข้า DB แล้ว render
ใหม่แบบ async (เหมือนเพจอื่น) จะทำให้ script เดิมที่ผูกกับ id เหล่านี้หา container ไม่เจอตอน
`DOMContentLoaded` (เพราะยังไม่ถูกสร้าง ณ ตอนนั้น) แล้วพังเงียบๆ ไม่มี error — ถามผู้ใช้ยืนยันแนวทางแล้ว:
**เก็บ static HTML+JS เดิมของ 4 section หลังไว้ทั้งหมด ไม่แตะเลย แค่ย้ายตำแหน่ง+เพิ่มพื้นหลังให้เท่านั้น**
ส่วน Our Story/What We Do
(ไม่มี JS ผูกอยู่ ปลอดภัย 100%) ผู้ใช้เลือก **"คงดีไซน์เดิมไว้ ใช้ Custom HTML แทน"** (ไม่ใช่ template
มาตรฐานรูป+หัวข้อ+เนื้อหาแบบ 16 หน้าอื่น เพราะดีไซน์เฉพาะตัวเกินไป — collage 3 รูป+4 feature card /
hover-accordion 6 ใบ)

- **6 section = 6 แถวใน `page_sections`** สำหรับเพจ `page_key='index'` เหมือนเพจอื่นทุกประการ (มี
  `sort_order`/`bg_type`/`bg_color`/`bg_gradient_*`/`bg_opacity`/`bg_grayscale` ใช้งานได้เต็มที่ทุกแถว)
  แบ่งเป็น 2 ชนิดตาม `anchor_id`:
  - **"เนื้อหาจริง"** (2 แถว) — Our Story (`anchor_id=''`), What We Do (`anchor_id=''`) — `layout=
    'custom-html'`, `body_th` = HTML เดิมของ section นั้นทั้งหมด (คง class เดิมทุกตัว เช่น
    `.about-story__*`/`.business-item__*` ไว้ครบ ให้ CSS เดิมใน `style.css` ยังทำงานเหมือนเดิม) —
    แก้ไขได้ผ่าน "โค้ด HTML" ใน `cms/page-editor.html` ตามปกติทุกประการ, render ผ่าน
    `window.cpbfPages.buildSection()` เหมือนเพจอื่น (สร้าง `<section>` ใหม่จริง)
  - **"proxy section"** (4 แถว) — Online Shop (`anchor_id='products'`), Newsroom
    (`anchor_id='news-events'`), Our Partners (`anchor_id='our-partners'`), Contact Us
    (`anchor_id='contact-us'`) — `layout='custom-html'` เหมือนกัน แต่ `body_th` เก็บแค่ marker คงที่
    `<!-- static-proxy -->` (ไม่ใช่เนื้อหาจริง) — `anchor_id` ต้อง**ตรงกับ id จริงของ `<section>` เดิมใน
    `index.html` เป๊ะๆ** เพื่อให้ระบบจับคู่ถูกตัว
- **`<div id="pageSectionsContainer" data-page-key="index"></div>`** — container มาตรฐานเดียวกับเพจ
  เนื้อหาทั่วไป (auto-init ผ่าน `page-render.js` ตัวเดียวกัน ไม่มีไฟล์เฉพาะหน้าแยกอีกต่อไป) แทนที่ตำแหน่ง
  เดิมของ Our Story (About Us) ใน `index.html` — เป็นที่รวม 6 section ตามลำดับที่ตั้งค่าไว้ (เดิมเคยชื่อ
  `#indexSectionsContainer` + ไฟล์แยก `index-sections-render.js` — consolidate เข้า path มาตรฐานแล้วหลัง
  generalize "static proxy" pattern เข้า `page-render.js`, ลบไฟล์เดิมทิ้ง, ถดถอยทดสอบผ่าน — ดูหัวข้อ
  "static proxy section" ด้านบนสำหรับกลไกเต็ม)
- **KV Banner + CTA banner (comment)** อยู่ต่อจาก `#pageSectionsContainer` แทนตำแหน่งเดิม (เดิมอยู่ระหว่าง
  Our Story กับ What We Do ซึ่งตอนนี้ทั้งคู่ถูกดึงออกจากตำแหน่ง static ไปอยู่ใน container ที่จัดลำดับใหม่
  ได้แล้ว ตำแหน่งเดิมจึงไม่มีความหมายอีกต่อไป)
- **⚠️ ข้อจำกัดที่ยอมรับแล้ว**: Our Story/What We Do ตอน render ผ่าน `custom-html` จะได้ padding จาก
  `.page-section` (`30px 80px`) แทน padding เดิมของ `.about-section`/`.business-section`
  (`50px` เท่ากันทุกด้าน) เพราะ `buildSection()` ตั้ง class เป็น `page-section page-section--custom-html`
  เสมอ ไม่ได้คง class เดิม (`.about-section`/`.business-section`) ไว้ — background-color เดิมเป็นสีขาว
  เท่ากับ `var(--bg-main)` อยู่แล้วจึงไม่มีผลต่างเรื่องสี มีแค่ padding ต่างกันเล็กน้อย ยอมรับเป็น trade-off
  เพื่อความง่ายไม่ต้องแก้ `buildSection()` ให้รองรับ custom outer class (trade-off เดียวกันนี้ใช้ซ้ำกับ
  career.html ด้วย)
- **การ์ดหน้ารายการของ proxy section**: `cms/page-editor.js`'s `buildCard()` แสดงชื่อ section จริงแทน
  anchor_id ดิบๆ ผ่าน `STATIC_PROXY_LABELS` lookup ("Online Shop"/"Newsroom"/"Our Partners"/"Contact Us"/
  "ฟอร์มสมัครงาน" + "(เนื้อหาจริงจากหน้าเว็บ)") และแสดง placeholder แทน iframe ว่างเปล่า (เพราะ body_th
  ไม่มีอะไรให้ preview จริง)
- **Seed ข้อมูล**: `cms/seed-index-sections.sql` (ไฟล์ใหม่ แยกจาก `schema-pages*.sql` เพราะเป็นแค่ insert
  ข้อมูล ไม่มี alter table) — ใช้ HTML ที่ extract มาจาก `index.html` จริง ณ วันที่เขียน (ก่อนลบออกจากไฟล์)
  ต้องรัน**หลัง** schema-pages-v2 ถึง v7 ให้ครบก่อน (ต้องมีคอลัมน์ `bg_type` ฯลฯ ครบ) ปลอดภัยรันซ้ำได้
  (ลบ 6 แถวเดิมที่ anchor_id ตรงกันก่อน insert ใหม่ทุกครั้ง) — **4 แถว proxy seed `bg_type='color'` ด้วยสี
  จริงที่ section นั้นใช้อยู่ปัจจุบัน** (ดึงจาก `background-color` ใน style.css ตรงๆ: Online Shop/Our
  Partners = `#f4f3f1` (`var(--bg-product-section)`), Newsroom = `#ffffff`, Contact Us = `#123c9e`
  (`var(--contact-dark)` → `var(--primary-dark)`)) แทนที่จะปล่อยว่าง เพื่อให้เปิด "จัดการรูปภาพ" ครั้งแรก
  เห็นค่าตรงกับที่ใช้งานจริงทันที ผลลัพธ์ตอน render เหมือนเดิมทุกประการ (สีซ้อนสีเดิมพอดี ผ่าน
  `.page-section__bg` overlay แทนที่ `background-color` เดิมของ section ซึ่งกลายเป็น transparent ผ่าน
  `.page-section--has-bg`) — ⚠️ ก่อน seed ค่านี้ตรวจสอบแล้วว่าทั้ง 4 section มี **direct child เดียว
  (div ธรรมดา ไม่ได้ position:absolute)** ไม่มีตัวไหนชนกับ CSS class `.contact-section__bg-image`/
  `.contact-section__overlay` ที่เจอใน style.css (ตรวจแล้วว่าเป็น class เก่าที่ไม่ได้ใช้จริงใน index.html
  ไม่งั้น `applyBgToStaticElement()`'s การบังคับ `position:relative` ให้ direct children จะไปทับ
  `position:absolute` เดิมของพวกนั้น ทำให้ full-bleed image/overlay เดิมพังได้)
- **`cms/pages.js`**: "หน้าแรก" (`page_key='index'`) ปักหมุดเป็นแถวแรกสุดของลิสต์เสมอ (ไม่มีเมนูของตัวเอง
  ใน Menu Management เลย ก่อนหน้านี้เคยถูกกรองออกจากลิสต์ไปเลยเพราะ `visibleItems()` เช็คแค่
  `is_standalone`/`menu_item_id` — เพิ่มเงื่อนไข `page_key === 'index'` เข้าไปด้วย) ไอคอน 🏠 + badge
  "หน้าแรก" แยกจาก "Standalone"/"ผูกกับเมนู" ปกติ, ลิงก์ "เปิดดูหน้านี้" ชี้ไป `index.html` ตรงๆ (ไม่ผ่าน
  `promo.html?slug=...` เหมือนเพจ standalone อื่น)
- **จัดการผ่าน**: `cms/pages.html` (list เพจทั้งหมด เรียงตามลำดับเมนูหลัก/เมนูย่อยจริงบนเว็บ แสดงหัวข้อ
  กลุ่มสำหรับเมนูหลักที่ไม่มีเพจของตัวเอง เช่น "Our Products" — เดินโครงสร้าง `menu_items` แบบ depth-first
  เหมือน Menu Management, เพิ่ม/ลบเพจ standalone ได้เท่านั้น — เพจที่ผูกไฟล์จริงปิดใช้งานได้แต่ลบไม่ได้
  **เพจที่เมนูที่เคยผูกอยู่ถูกลบไปแล้ว (menu_item_id เป็น null และไม่ใช่ standalone) จะไม่แสดงในลิสต์อีก
  ต่อไป** — ข้อมูลเพจ/section ยังอยู่ใน DB เหมือนเดิม ไม่ได้ลบ ถ้าสร้างเมนูใหม่ที่ url ตรงกับ page_key เดิม
  อีกครั้ง `autoCreatePageForMenuItem()` ใน `menu.js` จะผูกกลับให้อัตโนมัติ — **เมนูใหม่ที่สร้างผ่าน Menu
  Management ก็ auto-สร้างเพจเปล่าให้ทันทีเช่นกัน** ยกเว้น url ที่ไม่ใช่เพจเดี่ยวจริง (ว่าง/`#`/มี anchor `#`/
  มี query `?`)) → คลิก "จัดการ Section" ไป `cms/page-editor.html?id=<uuid>`
  - **ตั้งค่าเพจ + section ทั้งหมด save รวมกันทีเดียวด้วยปุ่มเดียว** "บันทึกการเปลี่ยนแปลงทั้งหมด" ที่ sticky
    bottom bar ด้านล่างจอ (ไม่มีปุ่มบันทึกแยกต่อ section แล้ว) — รายงาน error แยกเป็นรายการถ้ามี section
    ไหน validate ไม่ผ่าน โดยไม่บล็อกการบันทึก section อื่นที่ถูกต้อง
  - **แต่ละ section แสดงเป็น live preview จริง** (iframe + `style.css` ของเว็บหลัก ผ่าน
    `window.cpbfPages.buildSection()` เดียวกับที่ render จริงบนเว็บ — ไม่ใช่ thumbnail) ต่อด้วยฟิลด์แก้ไข
    ตรงหน้ารายการได้เลย (ไม่ต้องเปิด modal): **หัวข้อ/เนื้อหา (rich text)/ปุ่ม(ข้อความ)/ปุ่ม(ลิงก์) ทั้งหมดมี
    TH/EN คู่กัน** + Anchor ID — พิมพ์แล้ว preview รีเฟรชทันที (debounce) แต่**ยังไม่ save**จนกว่าจะกดปุ่ม
    บันทึกรวมด้านบน — **การ์ดแต่ละใบมีปุ่ม ▾ ย่อ/▸ ขยาย มุมขวาบน (default ขยายอยู่เสมอ)** พับ/กางเฉพาะส่วน
    preview iframe + ฟิลด์แก้ไข (แถวปุ่มเรียงลำดับ/toggle active/จัดการรูปภาพ/ลบ ด้านล่างสุดยังแสดงตลอด
    ไม่ถูกพับไปด้วย) ไว้ย่อเพจที่มีหลาย section ให้ดูรายการโดยรวมง่ายขึ้น
  - **หัวข้อ/เนื้อหาไม่บังคับกรอกแล้ว** (เดิมบังคับทั้งคู่สำหรับ section ปกติ — ผู้ใช้ขอเอาออก) — section
    ที่ปล่อยว่างไว้ก็ save ได้ปกติ, `page-render.js` จะไม่ render `<h2>`/`.page-section__text` ส่วนที่ว่างเปล่า
    อยู่แล้ว (ใช้ conditional เดิม) — ยกเว้น custom-html ที่ยังบังคับกรอกโค้ด HTML เหมือนเดิม (ไม่มีโค้ดก็ไม่มี
    อะไรให้ render เลย)
  - **ปุ่ม (CTA) เลือกรูปแบบ + สีได้แล้ว** (เพิ่มใหม่ 2026-07-31 ตามที่ผู้ใช้ขอ "ต้องรองรับการแก้ไขสีและ
    รูปแบบ เช่น รูปแบบ Primary Outline") — เดิมปุ่มทุก section ใช้สไตล์เดียวตายตัว (`.btn-primary` ขีดเส้นใต้
    + ลูกศร → ซึ่งเป็นสไตล์ CTA มาตรฐานของทั้งเว็บอยู่แล้ว) ตอนนี้เลือกได้ 3 รูปแบบผ่าน picker เดียวกับ layout/
    align picker: **Text Link** (ของเดิม ไม่เปลี่ยนอะไรสำหรับ section เก่าที่ไม่ได้ตั้งค่าใหม่ —
    backward-compatible 100% เพราะ default ของ `button_style` คือ `'text-link'`), **Primary** (ปุ่มทึบ pill),
    **Primary Outline** (ปุ่มขอบ pill โปร่งใส) — 2 แบบหลังมีช่องเลือก **สี** แยกต่างหาก (color picker +
    hex text พร้อมกัน sync สองทาง เหมือน pattern สีพื้นหลัง) ว่างไว้ = ใช้สี `--primary-color` ของเว็บเป็น
    default ผ่าน CSS custom property `--page-section-btn-color` (ตั้งเป็น inline style ต่อปุ่มใน
    `page-render.js` เฉพาะตอนมีค่า ไม่งั้นปล่อยให้ CSS fallback เอง) เก็บใน `page_sections.button_style`/
    `button_color` คอลัมน์ใหม่ (`cms/schema-pages-v9.sql`) — คลาส CSS ใหม่ `.page-section__btn--primary`/
    `--primary-outline` ใน `style.css` อ้างอิง token เดียวกับปุ่มอื่นทั้งเว็บ (`--pill-radius`/`--font-family`)
    ไม่ได้อ้างอิง `.contact-cta__btn--outline` เดิม (เฉพาะเจาะจงกับพื้นหลังเข้มของ section นั้นเกินไป ไม่เหมาะ
    เป็นปุ่มทั่วไปที่ใช้ได้ทุกพื้นหลัง)
  - **จัดลำดับ section ด้วยปุ่มลูกศร ▲/▼** (ไม่ใช่ drag-and-drop แล้ว) บันทึก sort_order ทันทีที่กด
  - **layout รองรับ 5 แบบ**: image-left/right/top/bottom (ปกติ) + **`custom-html`** — โหมดนี้แอดมินเขียน
    โค้ด HTML ดิบเองได้เต็มที่ (ช่อง "โค้ด HTML" มาแทนที่หัวข้อ/เนื้อหา/ปุ่มทั้งหมดในหน้ารายการ, เก็บใน
    `body_th` เหมือนเดิม) เหมาะกับ layout ที่ไม่เข้ากรอบ image+text ทั่วไป (เช่น full-bleed background,
    การ์ด custom หลายใบ, ตาราง) — `page-render.js` render โดยไม่มี `.section-container`/`.page-section__grid`
    ครอบเลย (แค่ sanitize ด้วย DOMPurify) เพื่อให้ออกแบบอิสระเต็มที่ ไม่ต้องใช้รูปภาพ
  - ปุ่ม **"✏️ แก้ไข"** (เดิมชื่อ "🖼️ จัดการรูปภาพ" — เปลี่ยน label ตามที่ผู้ใช้ขอ ฟังก์ชันเหมือนเดิมทุก
    ประการ) เปิด modal แยกเฉพาะรูปภาพ+ตำแหน่ง (layout) เท่านั้น (ไม่มีฟิลด์อื่นแล้ว เพราะ
    ย้ายไปหน้ารายการหมด) — **layout picker ในนี้เหลือแค่ 4 ตัวเลือกตำแหน่งรูป** (Custom HTML แยกออกมาเป็น
    field ของตัวเองด้านล่าง มี checkbox "ใช้งาน" — ติ๊กแล้วปิดใช้งาน (dim + คลิกไม่ได้) ทั้ง layout picker
    และช่องรูปภาพพร้อมกันทันที เพื่อให้ระบบใช้งานจาก HTML ที่ระบุอย่างเดียว ค่า `layout` ที่ save จริงยังเป็น
    `'custom-html'` เหมือนเดิม แค่ UI แยกเป็นสัดส่วนชัดเจนขึ้น) — **รูปภาพสูงสุด 4 ภาพต่อ section** ลากจัดลำดับ
    ได้ ระบบจัดกริดให้อัตโนมัติตามจำนวนรูป (1 รูปเต็มพื้นที่/2 รูปเรียงข้างกัน/3 รูป (2 รูปบนกว้าง+แคบ + 1 รูป
    เต็มล่าง)/4 รูป กริด 2x2) พร้อม **checkbox "เปิดใช้งาน Grayscale Filter"** ต่อ section (default ติ๊กไว้
    เพื่อคงพฤติกรรมเดิม — รูปในกริดเป็นขาวดำ เปลี่ยนเป็นสีตอน hover — ถ้าปลดติ๊กจะเป็นสีจริงตลอดตั้งแต่แรก
    เอฟเฟกต์ hover ซูมยังทำงานปกติ ไม่เกี่ยวกับ grayscale) เก็บใน `page_sections.images_grayscale`
    (`cms/schema-pages-v6.sql`, default `true`) — คนละคอลัมน์กับ `bg_grayscale` เดิมที่คุมพื้นหลัง full-bleed
    ไม่ใช่รูปภาพหลักของ section — save ทันทีเมื่อกด "บันทึก" ในนี้ (ไม่รอปุ่มบันทึกรวม) modal นี้ยังใช้สร้าง
    section ใหม่ด้วย (ต้องเลือกรูปอย่างน้อย 1 ภาพก่อนถ้าไม่ใช่ custom-html — หัวข้อ/เนื้อหากรอกทีหลังผ่านหน้า
    รายการ) — **ไม่มีปุ่ม "👁️ ดูตัวอย่าง" ใน modal นี้แล้ว** (เอาออกตามที่ผู้ใช้ขอ เพราะหน้ารายการมี live
    preview ต่อ section แสดงอยู่แล้วโดย default ซ้ำซ้อนกัน)
  - **แต่ละรูปในกริดใส่ลิงก์แยกได้แล้ว** (เพิ่มใหม่ 2026-07-31 ตามที่ผู้ใช้ขอ) — ใต้ thumbnail แต่ละใบมีช่อง
    ข้อความเล็กๆ "ลิงก์ (ถ้ามี)" ให้กรอก URL แยกต่อรูป (ไม่บังคับ) เก็บใน `page_sections.image_links`
    คอลัมน์ใหม่ (`text[]`, `cms/schema-pages-v9.sql`) เป็น parallel array ตำแหน่งตรงกับ `images` เสมอ —
    ลบ/ลากสลับลำดับรูปจะลบ/สลับลิงก์ที่คู่กันไปด้วยอัตโนมัติ (แก้ `removeImage()`/drag-drop handler ใน
    `page-editor.js` ให้ splice ทั้งสอง array คู่กันเสมอ ไม่งั้นลิงก์จะเพี้ยนไปคนละรูปหลังจัดลำดับใหม่) —
    section เก่าที่สร้างก่อนมีฟีเจอร์นี้ (ไม่มีคอลัมน์ `image_links` มาก่อน หรือสั้นกว่าจำนวนรูปจริง) จะ pad
    เป็นค่าว่างให้อัตโนมัติตอนเปิด modal ไม่พัง — `page-render.js` ห่อ `<img>` ด้วย `<a href="...">` เฉพาะรูป
    ที่มีลิงก์เท่านั้น (ฟังก์ชันใหม่ `zipImageLinks()`/`buildImageTag()` ใช้ร่วมกันทั้ง `buildCollageHtml()`/
    `buildImageRowHtml()`) รูปที่ไม่มีลิงก์ยังคง render เป็น `<img>` เฉยๆ เหมือนเดิมทุกประการ
  - **modal เดียวกันมีช่อง "รูปพื้นหลัง (Background)" แยกต่างหาก** (ไม่บังคับ, ใช้ได้ทุก layout รวม
    custom-html) — เลือกได้ **3 รูปแบบ** ผ่าน picker แบบเดียวกับ layout: **🖼️ รูปภาพ** (เดิม — อัปโหลด/พิมพ์
    URL), **🎨 สีพื้น** (`<input type="color">` + text ให้พิมพ์ hex/rgb เอง sync กันสองทาง), **🌈 Gradient**
    (2 สี ต้นทาง/ปลายทาง + ปุ่มเลือกทิศทาง "บน → ล่าง" (`to bottom`) หรือ "ขวา → ซ้าย" (`to left`)) — เก็บใน
    `page_sections.bg_type`/`bg_color`/`bg_gradient_from`/`bg_gradient_to`/`bg_gradient_direction` คอลัมน์ใหม่
    (`cms/schema-pages-v7.sql`) ทุกแบบยังใช้ slider **% ความโปร่งใส (opacity)** และ **% grayscale** ร่วมกันได้
    (grayscale มีผลกับสีพื้น/gradient ด้วยจริง เพราะเป็น CSS `filter` ที่ทำงานกับพิกเซลที่ render ออกมา ไม่ใช่
    แค่รูปภาพ) — พื้นหลังทุกแบบ render แบบ **full-bleed เต็มความกว้างจอเสมอ ไม่มี padding ซ้าย/ขวา**
    ไม่ว่า section จะมี layout แบบไหน (`.page-section__bg` เป็น `position:absolute; inset:0` ภายใน
    `.page-section` ที่ตั้ง `position:relative; overflow:hidden` ไว้ — เนื้อหาจริงของ section
    (`.section-container` หรือ `.page-section__custom-content` สำหรับ custom-html) มี `z-index:1` ให้
    ลอยอยู่เหนือพื้นหลังเสมอ)
  - ⚠️🔧 **แก้บั๊ก: กรอกค่าในฟิลด์ของรูปแบบพื้นหลังที่ไม่ได้เลือกไว้ (ซ่อนอยู่) แล้วค่าไม่มีผลตอนแสดงผลจริง**
    — เจอจริงกับ 2 section ในหน้าแรก: section หนึ่งเลือก "🎨 สีพื้น" ไว้ (`bg_type='color'`) แล้วแอดมิน
    อัปโหลดรูปในช่อง "🖼️ รูปภาพ" ที่ซ่อนอยู่ — รูปถูกบันทึกลง `bg_image` จริง แต่หน้าเว็บไม่เปลี่ยนตามเลย
    เพราะ `page-render.js` render ตาม `bg_type` ที่เลือกไว้เท่านั้น (ยังเป็น "color" อยู่) อีก section เลือก
    "🖼️ รูปภาพ" ไว้ (`bg_type='image'`) แล้วพิมพ์สีในช่อง "🎨 สีพื้น" ที่ซ่อนอยู่ — สีถูกบันทึกจริงแต่ไม่มีผล
    เหมือนกัน — แก้โดยให้ทุกฟิลด์ของ 3 รูปแบบ (`fieldBgImage`/`fieldBgImageFile`/`fieldBgColor`/
    `fieldBgColorText`/gradient ทั้ง 4 ฟิลด์) **สลับ `bg_type` ให้อัตโนมัติทันทีที่แอดมินเริ่มโต้ตอบกับฟิลด์
    นั้น** (พิมพ์/เลือกไฟล์ก็สลับ type ให้ตรงกับสิ่งที่กำลังทำทันที ไม่ต้องกดปุ่มเลือกรูปแบบเองแยกต่างหากอีก
    ต่อไป) กันไม่ให้เกิดเคสนี้ซ้ำในอนาคต — ⚠️ ข้อมูลเก่าที่เจอปัญหานี้ไปแล้ว (บันทึกไว้ก่อนแก้บั๊ก) ยังต้องเข้าไป
    แก้ด้วยมือครั้งเดียว: เปิด "แก้ไข" ของ section นั้น กดปุ่มรูปแบบที่ถูกต้อง (ค่าที่กรอกไว้เดิมยังอยู่ครบ
    ไม่หาย) แล้วกด "บันทึก" อีกครั้ง
  - ⚠️🔧 **แก้บั๊ก [hidden] เดียวกับที่เจอใน `.cms-icon-btn[hidden]`/`.line-order-modal__actions[hidden]`
    มาก่อน (ครั้งที่ 3 แล้ว): เลือก Gradient ในหน้ารายการรูปภาพแล้วดูเหมือน "ใช้งานไม่ได้ไม่แสดงผล"** — สาเหตุ
    จริงคือ `.cms-field { display:flex }` มี specificity เท่ากับ `[hidden]` ของ browser (`0,1,0` ทั้งคู่) แต่
    `.cms-field` มาทีหลังใน cascade เลยชนะ ทำให้ `hidden` attribute ไม่มีผลกับ `.cms-field` element ไหนเลย —
    ผลคือ **ฟิลด์พื้นหลังทั้ง 3 กลุ่ม (รูปภาพ/สีพื้น/gradient) แสดงพร้อมกันหมดตลอดเวลา** ไม่ว่าจะเลือกรูปแบบ
    ไหนไว้ ทำให้แอดมินสับสนว่ากรอกสีตรงไหนถูกจุด (พบระหว่างตรวจสอบ bug report 2026-07-31 — ยืนยันด้วย
    `getComputedStyle` ก่อนแก้ว่าทั้ง 3 กลุ่มเป็น `display:flex` พร้อมกันจริง) — ⚠️ **ไม่ใช่บั๊กที่ save/render
    logic เลย** (ทดสอบแยกแล้วว่า `setBgType()`/payload/`page-render.js`'s gradient rendering ถูกต้องสมบูรณ์
    มาตลอด — ปัญหาอยู่ที่การมองเห็นฟิลด์ในหน้า editor เท่านั้น) — แก้ด้วย `.cms-field[hidden] { display:none;
    }` กฎเดียวใน `cms/style.css` (แก้ทั้งระบบทีเดียว ไม่ต้องไล่แก้ทีละ id เหมือน 2 ครั้งก่อน เพราะ
    `.cms-field` ใช้ร่วมกันแทบทุกฟิลด์ในทั้ง CMS) — **บทเรียนสะสมจาก 3 ครั้งนี้**: เวลาจะซ่อน element ด้วย
    `hidden` attribute ในโค้ดฐานนี้ ต้องเช็คก่อนเสมอว่า class ของ element นั้นมี `display` property ของตัวเอง
    หรือเปล่า (เช่น `display:flex`/`display:grid` จาก layout class ใดๆ) ถ้ามีต้องเพิ่ม `[hidden] {
    display:none }` ควบคู่กันไปด้วยเสมอ ไม่งั้น `hidden` จะไม่มีผลจริงแม้ attribute จะถูกต้อง
  - **แต่ละ section ไม่มี margin บน/ล่างเลย** (`.page-section { margin: 0; }` ใน `style.css` ของเว็บหลัก —
    ซ้ำกับ global reset `section{margin:0}` ที่มีอยู่แล้วโดยตั้งใจ กันปัญหาถ้า reset นั้นถูกแก้ในอนาคตแยกกัน)
    เพื่อให้ตั้งพื้นหลัง (สี/gradient/รูป) ต่อเนื่องกันข้าม section ได้จริงโดยไม่มีช่องว่างคั่น
  - ⚠️🔧 **แก้บั๊ก: section ที่มี bg (ทุกแบบ) ตอนลด % ความโปร่งใส (opacity) จะซีดจางเป็นสีขาวแทนที่จะโปร่งแสงจริง**
    — สาเหตุ: `.page-section` เองมี `background-color: var(--bg-main)` (สีขาว) ทึบอยู่แล้วเป็นค่า default,
    `.page-section__bg` (เลเยอร์พื้นหลัง) วางทับข้างบนแค่ปรับ `opacity` ของตัวเอง ไม่ได้บังพื้นหลังสีขาว
    ด้านล่างออกเลย พอลด opacity สีขาวด้านล่างเลยโผล่มาผสม — แก้แล้วโดยเพิ่ม modifier class
    `.page-section--has-bg { background-color: transparent; }` ใน `style.css`, ให้ `page-render.js`'s
    `buildSection()` ใส่ class นี้เพิ่มอัตโนมัติผ่านฟังก์ชัน `hasBg(section)` ที่เช็คตาม `bg_type` ปัจจุบัน
    (ไม่ใช่แค่เช็ค `bg_image` เฉยๆ เหมือนตอนมีแค่รูปแบบเดียว — ตอนเพิ่มสีพื้น/gradient เข้ามาใหม่เกือบลืมจุดนี้
    ต้องอัปเดต logic การเช็คให้ครอบคลุมทั้ง 3 แบบด้วย ไม่งั้นบั๊กเดิมจะกลับมาเฉพาะกับ 2 แบบใหม่)
  - ⚠️ **`buildSection()`/`sanitize()` รันใน context ของหน้า CMS เอง ไม่ใช่ใน iframe** ดังนั้น DOMPurify
    ต้องโหลดใน `cms/page-editor.html` เอง (ไม่ใช่แค่ใน iframe srcdoc) — เจอบั๊กนี้มาแล้วรอบหนึ่ง (ใส่
    DOMPurify ไว้แค่ใน iframe ไม่ช่วยอะไรเลย เพราะ `sanitize()` fallback เป็น `escapeHtml()` ไปแล้วตั้งแต่
    ก่อน HTML string จะถูกใส่เข้า iframe ด้วยซ้ำ ทำให้เห็นแท็กดิบๆ เช่น `<p>` โผล่มาในพรีวิว) แก้แล้วโดยย้าย
    `<script>` DOMPurify มาไว้ที่ `<head>` ของ `cms/page-editor.html`
- **RLS/schema**: `cms/schema-pages.sql` (รันแล้ว) + `cms/schema-pages-v2.sql` (**ยังไม่ได้รัน** — แก้
  `page_sections.image` เดี่ยวเป็น `images text[]` สูงสุด 4 รูป) + `cms/schema-pages-v3.sql` (**ยังไม่ได้รัน**
  — เพิ่ม `button_link_en`) + `cms/schema-pages-v4.sql` (**ยังไม่ได้รัน** — เพิ่ม layout `custom-html`)
  + `cms/schema-pages-v5.sql` (**ยังไม่ได้รัน** — เพิ่ม `bg_image`/`bg_opacity`/`bg_grayscale`)
  ดู "SQL migrations" + "สิ่งที่ต้องทำต่อ" — pattern RLS เดียวกับตารางอื่น (public select, authenticated
  insert/update/delete) seed 18 แถวใน `pages` (16 เพจเนื้อหา + index + online_shop) ผูก `menu_item_id`
  ด้วย UUID จริงที่ตรวจสอบกับ Supabase แล้ว ณ วันที่เขียน migration — ไม่ seed `page_sections` ใดๆ
  (ทุกเพจเริ่มว่างเปล่า)
- **CSS**: `.page-section`/`.page-section__grid`/`__media`/`__card` ใน `style.css` (generalize มาจาก
  `.about-history` เดิมของ our_story.html) รองรับ 4 layout modifier class พร้อม mobile stack เสมอ —
  **ไม่มีการซ้อนทับ (overlap) ระหว่างรูปกับข้อความ** (เอา negative-margin card ออกแล้วตามฟีดแบ็ก ใช้ grid
  gap ปกติแทน) และรูปใน collage มี **filter grayscale ตอนปกติ เปลี่ยนเป็นสีจริงตอน hover** (เหมือน
  `.about-story__collage` เดิม)

### หน้า career.html — เต็มรูปแบบ พร้อม static proxy section

**บริบท**: ผู้ใช้ขอให้หน้า career (ร่วมงานกับเรา) จัดการผ่าน Page Management เพิ่มเติม เหมือน pattern ของ
หน้าแรก — 3 section แรก (บริษัท CP B&F ดีอย่างไร?/Benefit/ทำไมต้องร่วมงานกับเรา?) ไม่มี JS ผูกอยู่ ย้ายเข้า
`page_sections` เป็น `custom-html` ได้ปลอดภัย 100% ส่วน section "Apply now" (ฟอร์มสมัครงานจริง — dropdown
ตำแหน่งงาน custom + อัปโหลดไฟล์ resume เป็น base64 แล้วยิงไป Supabase Edge Function
`send-application-email`) มี JS ผูกอยู่จริง ผู้ใช้ระบุชัดว่าให้คงไว้เป็น static แก้ไขได้แค่พื้นหลัง+ลำดับ —
ใช้ "static proxy section" pattern เดียวกับ 4 section ท้ายของหน้าแรกทุกประการ (ดูหัวข้อ "static proxy
section" ด้านบนสำหรับกลไกเต็ม)

- **เดิมไม่มี Page Management ใน `career.html` เลย** (ไม่มี `#pageSectionsContainer`, ไม่มี
  `<script src="page-render.js">`) — เพิ่มทั้งคู่ใหม่ พร้อม DOMPurify CDN (จำเป็นสำหรับ sanitize
  custom-html — career.html ไม่เคยโหลด DOMPurify มาก่อน) วางตำแหน่งเดียวกับหน้าอื่น (หลัง
  `cms/config.js`/`cms/supabase-client.js`/`banner-render.js`, ก่อน `cart.js`/`i18n.js`)
- **4 section = 4 แถวใน `page_sections`** สำหรับเพจใหม่ `page_key='career'`:
  - **"เนื้อหาจริง"** (3 แถว, `layout='custom-html'`) — `anchor_id='career-intro'`/`'career-benefits'`/
    `'career-features'` — `body_th` = เนื้อหาเดิมของแต่ละ section (ตัดแค่ `<section class="career-*">`
    ชั้นนอกออก เหลือ `<div class="section-container">...</div>` ข้างในเท่านั้น — เหตุผลเดียวกับ
    Our Story/What We Do ของหน้าแรก คือ `buildSection()` สร้าง `<section class="page-section
    page-section--custom-html">` ครอบให้เองอยู่แล้ว) — ตั้ง `bg_type='color'`/`bg_color` ตามสีพื้นหลังจริง
    ที่แต่ละ section ใช้อยู่ (ดึงจาก `background-color` ใน style.css ตรงๆ: `.career-intro`/
    `.career-features` = `var(--bg-main)` = `#ffffff`, `.career-benefits` = `var(--primary-color)` =
    `#1b5ef9` — ตั้งใจใช้ bg_color แทนการ hardcode สีไว้ใน body_th เพราะ Benefit section มีหัวข้อ
    ตัวหนังสือสีขาว (`style="color:#ffffff"`) ต้องมีพื้นหลังเข้มถึงจะอ่านออก จัดการผ่านระบบพื้นหลังกลาง
    ให้แก้ทีหลังได้ง่ายกว่า hardcode)
  - **"proxy section"** (1 แถว) — `anchor_id='apply-now'` (ตรงกับ `id="apply-now"` จริงของ
    `<section class="career-apply">` ที่ยังอยู่ใน `career.html` แบบ static เป๊ะๆ ไม่แตะเลย) —
    `body_th='<!-- static-proxy -->'`, `bg_color='#1b5ef9'` (สีเดิมของ `.career-apply {
    background-color: var(--ci-blue) }`)
- **Seed ข้อมูล**: `cms/seed-career-sections.sql` (ไฟล์ใหม่ — **ยังไม่ได้รัน**, ต้องรันหลัง
  schema-pages-v7) — ลบ `pages` row เดิม (`page_key='career'`) ก่อน insert ใหม่ทุกครั้งเพื่อให้ปลอดภัย
  รันซ้ำได้ (cascade ลบ `page_sections` เดิมของเพจนี้ไปด้วยอัตโนมัติ), insert `pages` row ใหม่ผูก
  `menu_item_id` ของเมนู "ร่วมงานกับเรา" (`ea9cec7f-c558-4198-a371-6b4d4bff7b76`, ตรวจสอบจริงกับ
  Supabase REST API แล้วว่ามีอยู่จริงและ url ตรงกับ `career.html`)
- **ทดสอบผ่าน browser แล้ว** (mock `pages`/`page_sections` เพราะ seed ยังไม่ได้รันจริง เรียก
  `window.cpbfPages.init()` ตรงๆ แทนการ dispatch `DOMContentLoaded` ซ้ำ กันปัญหา listener ซ้อนที่เจอมาก่อน):
  ลำดับ/พื้นหลังทั้ง 4 section ถูกต้อง (career-intro ขาว → Benefit น้ำเงิน → career-features ขาว →
  Apply now น้ำเงิน), `#apply-now` ถูก**ย้าย**เข้า container จริง (ไม่ได้ถูกสร้างใหม่ — ยืนยันด้วยการเช็ค
  ว่า element เดิมยังอยู่ใน DOM หลัง render), คลิกเปิด dropdown "Applied for" (ตำแหน่งงาน) ยังทำงานปกติ
  หลังถูกย้ายตำแหน่ง ไม่มี console error — **ไม่ได้ทดสอบอัปโหลดไฟล์/กดปุ่ม Apply จริง** เพื่อไม่ให้ยิง
  request จริงไปหา Edge Function ที่ใช้งานจริงอยู่
- **`cms/page-editor.js`'s `isStaticProxySection()`** generalize แล้วให้เช็คแค่ marker + มี `anchor_id`
  (เลิกใช้ allowlist `STATIC_PROXY_ANCHOR_IDS` ที่เคย hardcode ไว้ 4 ตัวของหน้าแรกเท่านั้น) ทำให้ section
  "apply-now" ของ career.html ถูกป้องกันถูกต้องโดยไม่ต้องแก้โค้ดเพิ่ม — เพิ่ม label "ฟอร์มสมัครงาน" ใน
  `STATIC_PROXY_LABELS` ให้การ์ดในหน้ารายการแสดงชื่อที่อ่านง่ายด้วย

## Dropzone อัปโหลดรูปภาพกลาง — ใช้ร่วมกันทุกจุดที่มี image upload ใน CMS (2026-07-31)

ปรับทุกจุดที่มีฟังก์ชันอัปโหลดรูปภาพในทั้ง CMS (7 จุด — ดูรายชื่อด้านล่าง) ให้เป็นดีไซน์เดียวกันตามตัวอย่างที่
ผู้ใช้ส่งมา (กล่องเส้นประ ไอคอนอัปโหลด ข้อความ **"คลิกเพื่ออัปโหลด" หรือลากไฟล์มาวาง** + ข้อความช่วยเหลือ
"รองรับรูปภาพ jpg, jpeg, png ขนาดไม่เกิน 5 MB") พร้อม **รองรับลากไฟล์จาก desktop มาวางได้จริง** (ของเดิมมีแค่
ปุ่ม "📤 อัปโหลด" เฉยๆ ไม่มีลาก-วางเลยสักที่ ถึงแม้บางจุดจะมีโค้ด `dragstart`/`drop` อยู่ก่อนแล้วก็ตาม — โค้ด
เดิมนั้นเป็นการลาก**สลับลำดับรูปที่อัปโหลดไปแล้ว** ไม่ใช่การลากไฟล์ใหม่จาก OS เข้ามาอัปโหลด คนละกลไกกัน)

- **`cms/upload.js`'s `cmsBindImageUpload()`** — เพิ่ม option `dropzone` (element) เข้าไปเป็น optional param
  ใหม่ ผูก `click` (เปิด file picker) + `dragenter`/`dragover`/`dragleave`/`drop` (toggle class `is-dragover`
  ระหว่างลาก, เรียก handler อัปโหลดเดียวกับตอนเลือกไฟล์ผ่าน dialog ทันทีที่ drop) เข้ากับ element เดียวกันนั้น
  — ใช้ handler กลางตัวเดียว (`handleFile`) ทั้ง path คลิกและ path ลาก-วาง ไม่ซ้ำโค้ด — ใช้กับ 5 จุดที่เป็น
  "single image field" (มี URL text input + preview + dropzone): เมนู item image (`cms/index.html`/`menu.js`),
  รูปภาพหลักบทความ (`news-articles.html`/`.js`), Hero/KV Banner Image TH+EN (`banners.html`/`.js` — เรียก
  `cmsBindImageUpload` 2 ครั้งแยกกัน), รูปพื้นหลัง section (`page-editor.html`/`.js`)
- **Multi-image gallery** (สินค้าสูงสุด 5 ภาพ, section เพจสูงสุด 4 ภาพ) — คนละ pattern จาก dropzone เดี่ยว
  (เป็นกริด thumbnail + ปุ่ม "+" ท้ายกริด) ไม่ได้เปลี่ยนเป็นกล่องใหญ่แบบเดียวกันเพราะพื้นที่จำกัดในกริด 96×96px
  แทนที่ปุ่ม "+" ตัวโตด้วยไอคอนอัปโหลด + ข้อความ "เพิ่มรูป" ขนาดเล็กแทน พร้อมผูก drag-drop จริงเข้ากับปุ่มนี้
  โดยตรง (ฟังก์ชันใหม่ `bindImageAddDropzone()` — เขียนซ้ำเหมือนกันทั้งใน `products.js`/`page-editor.js`
  เพราะ `renderImagesGrid()`/`handleImageFileSelected()` เดิมของทั้งสองไฟล์แยกกันอยู่แล้วไม่ได้ใช้โมดูลกลาง)
  และเพิ่มข้อความช่วยเหลือ "รองรับรูปภาพ jpg, jpeg, png ขนาดไม่เกิน 5 MB — คลิกหรือลากไฟล์มาวางที่ช่อง \"+\""
  ไว้ใต้กริดแทน (ใช้ class `.cms-section-hint` เดิมที่มีอยู่แล้ว ไม่ต้องสร้างใหม่)
  - ⚠️ **`page-editor.js`'s gallery มี drag-drop 2 ระบบซ้อนกันอยู่ในหน้าเดียว แต่ไม่ชนกัน**: ระบบเดิม
    (`attachImageDragEvents()`) ผูกกับรูปที่อัปโหลดแล้วแต่ละใบเพื่อ**สลับลำดับ** ระบบใหม่ (`bindImageAddDropzone()`)
    ผูกกับปุ่ม "+" ตัวเดียวเพื่อ**อัปโหลดไฟล์ใหม่จาก desktop** — คนละ element กัน ไม่ต้องกังวลเรื่อง event ชนกัน
  - **`handleImageFileSelected()` ทั้งสองไฟล์แก้ให้รับ `fileArg` (optional) แทนที่จะอ่านจาก
    `imageFileInput.files[0]` ตรงๆ อย่างเดียว** เพื่อให้ path ลาก-วาง (ส่ง `File` object จาก
    `e.dataTransfer.files[0]` เข้ามาตรงๆ) กับ path คลิกเลือกไฟล์ (อ่านจาก `imageFileInput.files[0]` เหมือนเดิม)
    ใช้ฟังก์ชันเดียวกันได้ — ⚠️ **ต้องแก้ `change` event listener ของ `imageFileInput` ให้เรียก
    `function () { handleImageFileSelected(); }` แทนที่จะ pass ฟังก์ชันตรงๆ** (`addEventListener('change',
    handleImageFileSelected)`) เพราะ browser จะส่ง `Event` object เข้าไปเป็น argument แรกให้เองอัตโนมัติ ซึ่ง
    จะถูกเข้าใจผิดเป็น `fileArg` (ไม่ใช่ `File`) ทำให้ validation พังทันที (bug จริงที่เจอและแก้ระหว่างทำรอบนี้
    ก่อน commit — ทดสอบยืนยันด้วย mock `cmsUploadImage` + `dispatchEvent('drop', ...)` พร้อม fake `File` แล้ว
    ว่า `is-dragover` class toggle ถูกต้อง และไฟล์ที่ drop เข้าไปจริงถูกส่งต่อไปอัปโหลดถูกต้อง)
- **`cms/style.css`** — คลาสใหม่ `.cms-dropzone`/`__icon`/`__title`/`__hint` (+ `.is-dragover` state) สำหรับ
  single-image field, ปรับ `.cms-product-image-add` จากปุ่ม "+" ตัวโตอย่างเดียวเป็น flex-column ไอคอน+label
  พร้อม `.is-dragover` state เดียวกัน
- **ไม่ได้แก้ validation จริงของ `cmsUploadImage()`** — ยังรองรับ JPG/PNG/WEBP/GIF/SVG ที่ 5MB เหมือนเดิม
  (กว้างกว่าข้อความ "jpg, jpeg, png" ที่โชว์ให้ผู้ใช้เห็น) เป็นการตัดสินใจตั้งใจไม่แก้ เพราะผู้ใช้ขอแค่ปรับ
  UI/ข้อความตามตัวอย่างที่ส่งมา ไม่ได้ขอให้จำกัดชนิดไฟล์ที่รองรับจริงให้แคบลง — ถ้าต้องการให้ตรงกับข้อความ
  เป๊ะๆ (ปฏิเสธ WEBP/GIF/SVG จริง) ต้องแก้ `ALLOWED_TYPES` ใน `cms/upload.js` เพิ่มอีกที
- **ทดสอบผ่าน browser ครบทั้ง 7 จุด** (mock auth ด้วยการตัด `<script>` ออกแล้ว inject เฉพาะ `upload.js` จริง
  เข้าไปแทน ไม่ mock ตัว logic เอง): index.html (เมนู), news-articles.html, banners.html (TH+EN), page-editor.html
  (bg image + gallery section), products.html (gallery) — หน้าตาตรงตามตัวอย่างที่ส่งมาทุกจุด และยืนยัน
  drag-and-drop ทำงานจริง (ไม่ใช่แค่ดีไซน์เฉยๆ) ผ่าน synthetic `drop` event พร้อม fake `File`

## Rich Text Editor กลาง (Quill) — ใช้ร่วมกันทั้ง CMS

Toolbar เดียวกันหมดทุกจุดที่มี rich text ในระบบ (รายละเอียดสินค้า, เนื้อหาบทความ, เนื้อหา section ของเพจ) —
เก็บ config ไว้ที่เดียวใน `cms/upload.js` (โหลดก่อน `products.js`/`news-articles.js`/`page-editor.js`
เสมอทั้ง 3 หน้า จึงอ้างถึงได้จากทั้งสามที่โดยไม่ต้อง import อะไรเพิ่ม):

- **`window.CMS_QUILL_TOOLBAR`** — array config เดียว ใช้แทน `toolbarOptions`/`QUILL_TOOLBAR_OPTIONS` เดิม
  ที่เคย copy-paste แยกกัน 3 ที่ (แต่ละที่มีปุ่มไม่เท่ากันด้วย — products.js ไม่เคยมี header เลย,
  news-articles.js/page-editor.js มีแค่ H2 เดี่ยว) ตอนนี้ครบทุกจุดเหมือนกันหมด: **ขนาดตัวอักษรตามระบบ
  H1/H2/H3/ปกติ** (`{ header: [1, 2, 3, false] }`), **สีตัวอักษร** (`{ color: [] }`), **จัดตำแหน่ง
  ซ้าย/กลาง/ขวา/เต็มบรรทัด** (`{ align: [] }`), bold/italic/underline, list, link, **แทรกรูป**, clean
- **`window.cmsBindQuillImageUpload(quill)`** — ต้องเรียกทุกครั้งหลัง `new Quill(...)` เสมอ (ดูตัวอย่างใน
  ทั้ง 3 ไฟล์) ผูกปุ่ม "แทรกรูป" ให้เปิด file picker จริงแล้วอัปโหลดขึ้น Supabase Storage ผ่าน
  `window.cmsUploadImage()` เดียวกับรูปอื่นๆ ในระบบ ก่อน `insertEmbed` ที่ตำแหน่ง cursor — **ถ้าลืมเรียก
  ฟังก์ชันนี้ ปุ่มแทรกรูปจะ fallback เป็นพฤติกรรม default ของ Quill คือ `prompt()` ให้พิมพ์ URL เอง** (ไม่ผิด
  แต่ไม่ตรงกับ pattern ของระบบที่อัปโหลดไฟล์จริงทุกจุด) — ฟังก์ชันเดียวกันนี้ยังเรียก `bindQuillImageResize()`
  ภายในให้อัตโนมัติด้วย (ดูหัวข้อถัดไป) ครอบคลุมทั้ง 3 จุดโดยไม่ต้องแก้ไฟล์อื่นเพิ่ม
- **ปรับขนาด+ตำแหน่งรูปภาพหลังแทรกสำเร็จ** (เพิ่ม 2026-08-01, `bindQuillImageResize()` ใน `cms/upload.js`) —
  คลิกรูปในเนื้อหา (ทั้งรูปที่เพิ่งแทรกใหม่ และรูปเดิมที่เคย save ไว้แล้ว) โชว์ toolbar ลอย 5 ปุ่ม (ซ้าย/กลาง/
  ขวา/เต็มความกว้าง/รีเซ็ตขนาด) เหนือรูป + จุดวงกลมสีน้ำเงินมุมขวาล่างสำหรับลากปรับขนาดอิสระ (คลิกที่อื่นเพื่อ
  ซ่อน) — **ไม่ได้เขียน Parchment format ใหม่เอง** ใช้กลไกที่ Quill มีอยู่แล้วทั้งคู่:
  - **ขนาด** ใช้ HTML attribute `width` ของ `<img>` ที่ Quill's stock Image blot รองรับอยู่แล้วในตัว
    (`Image.ATTRIBUTES = ['alt','height','width']`) ตั้งค่าผ่าน `quill.formatText(idx, 1, 'width', '300',
    'user')` โดยตรง — ระหว่างลาก handle จะ `setAttribute('width', ...)` บน DOM ตรงๆ ก่อนเพื่อความลื่นไหล
    (ไม่ผ่าน Quill API ทุก mousemove) แล้วค่อย commit ผ่าน `formatText` ตอน `mouseup` เท่านั้น
  - **ตำแหน่ง** reuse format `align` เดิม (ปุ่มเดียวกับที่ toolbar หลักมีอยู่แล้ว) แค่เรียก
    `quill.formatLine(idx, 1, 'align', 'center'|'right'|false, 'user')` กับบรรทัดที่มีรูปอยู่ — ซ้าย = `false`
    (ค่า default ไม่ใส่ class) ตรงกับพฤติกรรม toolbar เดิมเป๊ะ — "เต็มความกว้าง" ตั้ง `width:'100%'` +
    รีเซ็ต align กลับเป็น `false` พร้อมกัน
  - ⚠️🔧 **ห้ามใส่ `'width'` ใน `CMS_QUILL_FORMATS`** แม้จะดูเข้าท่าก็ตาม — ทดสอบแล้วว่า Quill 2.x จะ
    `console.error` ทันทีตอน `new Quill()`: `Cannot register "width" specified in "formats" config` เพราะ
    `formats:` option ต้อง map ไปยัง format/attributor ที่ "ลงทะเบียน" แยกต่างหากใน registry จริงๆ เท่านั้น
    แต่ `width`/`height`/`alt` เป็นแค่ attribute ภายในของ Image blot เอง (เช็คจาก source จริงของ
    `slab/quill@v2.0.2`) — ไม่ต้องใส่ก็ใช้งานได้ปกติสมบูรณ์อยู่แล้ว เพราะ `quill.formatText(idx,1,'width',v)`
    เรียกลงไปที่ `Image.format()` ตรงๆ ไม่ผ่านการเช็ค registry ที่ `formats:` จำกัดไว้เลย (ยืนยันด้วย browser
    test จริง: ใส่ 'width' ไว้ → error ทันที, เอาออก → resize/align/reset ทำงานถูกต้องทุกจุดไม่มี error)
  - Toolbar/handle ลอย append เข้า `document.body` ตรงๆ (ไม่ใช่ลูกของ modal) ด้วย `position:fixed` +
    z-index สูง (300, เหนือ `.cms-modal-overlay` ที่ 100) กัน overflow/transform ของ modal ที่ editor อาจอยู่
    ข้างในมาบัง — CSS ที่ `.cms-img-toolbar`/`.cms-img-resize-handle` ใน `cms/style.css`
  - ทดสอบผ่าน browser ครบแล้ว (mock `cmsUploadImage`, แทรกรูปจริงทั้งแบบใหม่และแบบโหลด HTML เดิมที่มี
    `width`/`ql-align-center` ติดมาอยู่แล้วผ่าน `dangerouslyPasteHTML`): คลิกรูปโชว์ toolbar+handle ตำแหน่ง
    ถูกต้อง, ปุ่มกลาง/ขวา/ซ้ายใส่-ลบ `ql-align-*` ถูกต้อง, ปุ่มเต็มความกว้างตั้ง `width="100%"` + ล้าง align
    ถูกต้อง, ปุ่มรีเซ็ตลบ attribute `width` ออกถูกต้อง, ลาก handle ปรับ `width` ตามระยะจริง + commit ผ่าน
    `formatText` สำเร็จ (ยืนยันจาก `quill.root.innerHTML`), คลิกนอกรูปซ่อน toolbar/handle ถูกต้อง, รูปเดิมที่
    โหลดมาพร้อม `width="250"` + `ql-align-center` อยู่แล้ว (จำลองข้อมูลที่เคย save ไว้) คลิกแล้วแก้ align ต่อ
    ได้โดย `width` เดิมไม่หาย — ไม่มี console error เหลือ (ยกเว้น error เก่าจากตอนยังใส่ 'width' ผิดที่ ซึ่ง
    แก้แล้วและยืนยันซ้ำว่า config ที่แก้ไม่ error อีกต่อไป)
- **CSS รองรับผลลัพธ์ที่ render จริงบนหน้าเว็บ** (คนละไฟล์กับ `cms/style.css` เพราะ Quill's `quill.snow.css`
  ใช้แค่ตอนกำลังแก้ในหน้า CMS เท่านั้น ไม่ได้โหลดในหน้าเว็บจริง) — เพิ่ม `h1`/`h2`/`h3`/`img` styling ให้ครบ
  3 จุดที่ render rich text จริง: `.page-section__text` (style.css, สำหรับ Page Management),
  `.news-detail__body` (style.css, สำหรับบทความ), `.pdp-info__desc` (inline `<style>` ใน
  `product-detail.html`, สำหรับรายละเอียดสินค้า) — ส่วน `.ql-align-center`/`.ql-align-right`/
  `.ql-align-justify` (class ที่ Quill ใส่ให้ตอนจัดตำแหน่ง) ใส่แบบ global ใน `style.css` ที่เดียวใช้ได้ทั้ง
  3 จุดเลยเพราะแค่ตั้ง `text-align` เฉยๆ ไม่ผูกกับ container ไหนโดยเฉพาะ
- ⚠️ สีตัวอักษร (`color` format) กับ align class รอดผ่าน `DOMPurify.sanitize()` ได้ปกติเพราะทุกจุดเรียก
  `sanitize()`/`DOMPurify.sanitize()` แบบไม่ใส่ config จำกัด `ALLOWED_ATTR`/`ALLOWED_TAGS` เอง (ใช้ default
  policy ของ DOMPurify ซึ่งอนุญาต `style`/`class` อยู่แล้ว) — ถ้าจะเข้มงวด sanitize มากขึ้นในอนาคตต้องระวัง
  ไม่ให้ strip สอง attribute นี้ออกไป ไม่งั้นสี/การจัดตำแหน่งที่แอดมินตั้งไว้จะหายตอนแสดงผลจริง
- **`window.CMS_QUILL_FORMATS`** — array จำกัด format ที่ editor ยอมรับไว้แค่เท่าที่มีปุ่มใน toolbar
  (`header`/`bold`/`italic`/`underline`/`color`/`align`/`list`/`link`/`image`) ต้องส่งเป็น `formats:` ตอน
  `new Quill(...)` คู่กับ `modules.toolbar` เสมอทั้ง 3 ไฟล์ — **แก้ปัญหาคัดลอกข้อความจากที่อื่น (Word/Google
  Docs/เว็บอื่น) แล้วมี `background-color` ติดมาด้วยโดยไม่ตั้งใจ** (พบบ่อยเวลาแปะ description ลง section ที่
  ตั้ง bg_image ไว้ — สีพื้นหลังที่ติดมากับข้อความจะไปทับ/ชนกับพื้นหลัง section เอง) Quill รองรับ format
  `background` อยู่แล้วในตัวแม้ toolbar จะไม่มีปุ่มนี้ พอวางข้อความที่มี background-color ติดมา clipboard
  matcher ของ Quill จะแปลงเป็น format นี้ให้อัตโนมัติ — การจำกัด `formats` ทำให้ format ที่ไม่อยู่ในลิสต์
  (รวม `background`) โดน filter ออกทั้งหมดทั้งตอนพิมพ์เองและตอนวาง โดยไม่กระทบ format อื่นที่อนุญาตไว้
  (ทดสอบแล้ว: วาง `<p style="background-color:red"><span style="background-color:yellow">...</span></p>`
  ได้ผลลัพธ์ไม่มี background-color เหลือเลย แต่ `color` ที่ตั้งใจอนุญาตไว้ยังคงอยู่ปกติ)

## ระบบตะกร้าสินค้า (Cart)

- `cart.js` เก็บ cart ใน `localStorage['cpbf-cart']` เป็น array ของ `{id, name, price, image, qty, url}`
- ปุ่ม "Add to cart" (`.shop-card__add-btn`) ถูก bind อัตโนมัติทุกหน้าที่มีการ์ดสินค้า (ดึงชื่อ/ราคา/รูปจาก
  DOM รอบๆ ปุ่มเอง ไม่ต้องแก้ HTML การ์ดเพิ่ม) — ตอนนี้การ์ดที่ render จาก products-render.js ส่ง
  `id` เป็น UUID จริงของสินค้าจาก Supabase แล้ว (เดิม derive จากชื่อแบบ slugify เพราะไม่มีของจริงอ้างอิง)
- Badge ตะกร้าที่ header (`.site-header__cart-badge`) อัปเดตสด ซ่อนอัตโนมัติเมื่อ cart ว่าง
- `cart.html` render รายการจริงจาก `cpbfCart.getCart()` ปรับจำนวน/ลบได้จริง คำนวณ subtotal/total สด
- ✅ **แก้ไขแล้ว** (เดิมเป็นข้อจำกัดที่รู้อยู่): `product-detail.html` route ตามสินค้าจริงแล้วผ่าน `?id=`
  ไม่ hardcode เป็นสินค้าเดียวอีกต่อไป

## ระบบสั่งซื้อผ่าน LINE (LINE Login + แชทรวมเดียวกัน)

⚠️🔧 **โค้ดครบแล้วแต่ยังไม่ได้ deploy/ตั้งค่าอะไรเลยสักอย่าง — ใช้งานจริงไม่ได้จนกว่าจะทำตาม
"สิ่งที่ต้องทำต่อ" ข้อ 0c ให้ครบ**

- **ปัญหาเดิม**: `send-line-order` Edge Function (deploy อยู่แล้วนอก session นี้, ไม่มีซอร์สอยู่ใน repo มา
  ก่อน — ผู้ใช้ส่งมาให้รอบนี้ เก็บไว้ที่ `supabase/functions/send-line-order/index.ts` แล้ว) push แจ้ง
  ออเดอร์ใหม่ไปหา **แอดมินคนเดียว** (`LINE_ADMIN_USER_ID` คงที่) ผ่าน Messaging API เท่านั้น แยกขาดจากแชทที่
  ลูกค้าเปิดเองผ่าน deep link `line.me/R/oaMessage/@cpbf` โดยสิ้นเชิง — ไม่มีทางรู้ว่าออเดอร์ไหนตรงกับแชท
  ของลูกค้าคนไหน เพราะการ push message เข้าแชท 1:1 ของลูกค้าคนหนึ่งได้ตรงๆ ต้องรู้ **LINE userId จริง** ของ
  คนนั้นก่อนเท่านั้น (ระบบเดิมไม่มีทางรู้ userId ของลูกค้าเลย)
- **วิธีแก้**: LINE Login (OAuth 2.1) — บังคับลูกค้า login ด้วย LINE ก่อนสั่งซื้อผ่าน LINE ได้เสมอ (ตามที่
  ตกลงกันไว้ ไม่มี fallback ให้สั่งซื้อแบบไม่ login) ได้ userId+ชื่อ+รูปโปรไฟล์จริงมา push ข้อความยืนยันเข้า
  **แชทจริงของลูกค้าคนนั้นโดยตรง** (`to: lineUserId`) ก่อนเสมอ — ⚠️ **อัปเดต 2026-07-31**: เก็บ
  `localStorage['cpbf-line-profile']` ก็ต่อเมื่อ push นี้ **สำเร็จจริง** เท่านั้น (= พิสูจน์แล้วว่าเป็นเพื่อน
  กับ OA จริง ไม่ใช่แค่ "login LINE สำเร็จ") แจ้งแอดมิน (backup) ก็ต่อเมื่อ push เข้าลูกค้าสำเร็จเช่นกัน — ถ้า
  ยังไม่เพิ่มเพื่อนจะไม่แจ้งแอดมินเลย ไม่เคลียร์ตะกร้า และครั้งถัดไปที่กดสั่งซื้อจะ redirect ไป LINE Login
  **ใหม่ทั้งหมดทุกครั้ง** (ไม่ข้ามไปสั่งซื้อทันทีเหมือนเดิมอีกต่อไป) จนกว่าจะเพิ่มเพื่อนสำเร็จจริง
- **`line-login.js`** (ไฟล์ใหม่ที่ root) — โมดูลกลาง รวม `openLineOrder`/LINE Login flow ที่เคย copy-paste
  แยกกัน 4 ที่ (`cart.html`/`index.html`/`online_shop.html`/`product-detail.html`) ให้เหลือจุดเดียว — expose
  `window.openLineOrder` (alias เดิมที่ `products-render.js`'s ปุ่ม "Shop with LINE" และ inline script อื่นๆ
  เรียกตรงๆ อยู่แล้ว ไม่ต้องแก้จุดเรียกใช้เลย) และ `window.cpbfLineOrder`
  (`openLineOrder`/`getLineProfile`/`handleLineCallback`) — `openLineOrder(message, items, options)` เป็น
  `async` แล้ว คืน `{success, redirected, lineUrl, autoOpened}` ให้ caller ตัดสินใจเอง (`options.
  clearCartOnSuccess` บอกว่าถ้าสั่งซื้อสำเร็จให้เคลียร์ตะกร้าด้วย — `cart.html` ส่ง `true`, จุดอื่นไม่ส่ง)
  - ยังไม่มี profile ที่ยืนยันแล้ว (ไม่ว่าเพราะไม่เคย login เลย หรือ login แล้วแต่ยังไม่เพิ่มเพื่อน) → เก็บ
    `{message, items, clearCartOnSuccess, returnUrl}` ไว้ใน `sessionStorage['cpbf-pending-line-order']` +
    CSRF state ใน `sessionStorage['cpbf-line-oauth-state']` แล้ว redirect ไป
    `access.line.me/oauth2/v2.1/authorize` (scope `profile openid`, `bot_prompt=normal`) — คืน
    `{success:false, redirected:true}` ทันที (แต่หน้าจะ navigate ออกไปอยู่ดี)
  - มี profile ที่ยืนยันแล้ว → push ข้อความ (พร้อม `lineUserId`/`lineDisplayName`) แล้วเช็คผลลัพธ์จริง — สำเร็จ
    (`customerOk===true`) ถึงจะ save/re-save profile แล้วทำพฤติกรรมเดิม: มือถือเปิด deep link ตรงๆ, desktop
    โชว์ `#lineOrderModal` ถ้าหน้านั้นมี (ไม่มีก็ fallback เป็น `window.open`) — **ไม่สำเร็จ (เช่น unfriend ไป
    แล้วหลัง confirm ครั้งก่อน) จะลบ profile cache ทิ้งทันที** บังคับให้ครั้งถัดไป login ใหม่หมด
- **`line-callback.html`** (ไฟล์ใหม่ที่ root, โหลด `cart.js` ด้วยเพื่อให้เคลียร์ตะกร้าได้ถ้า resume order
  จาก cart checkout สำเร็จ) — หน้าที่ LINE redirect กลับมาหลัง login
  (`https://cpbf.co.th/line-callback.html` — callback URL ที่ต้องลงทะเบียนไว้ใน LINE Login channel เป๊ะๆ)
  เรียก `handleLineCallback()`: เช็ค `state` กัน CSRF, แลก `code` เป็น profile ผ่าน Edge Function ใหม่ (ไม่
  save profile ที่นี่โดยตรง — save เฉพาะตอน resume order แล้ว push สำเร็จจริงเท่านั้น), resume คำสั่งซื้อที่
  ค้างไว้ให้อัตโนมัติ (ถ้ามี, เคลียร์ตะกร้าด้วยถ้า `clearCartOnSuccess` และสำเร็จ), แสดงชื่อ+รูปโปรไฟล์จริง +
  ปุ่ม "เพิ่มเราเป็นเพื่อนใน LINE" (ลิงก์ `line.me/R/ti/p/@cpbf` ตรงๆ — ไม่ได้พึ่ง "Linked OA"/`bot_prompt`
  ของ LINE console เพราะหาการตั้งค่านั้นไม่เจอในบัญชีผู้ใช้ตอนสร้าง channel เลยออกแบบให้ไม่ต้องพึ่งมันเลย)
  รองรับ 3 สถานะ: สำเร็จ (พร้อม resume order หรือไม่ก็ได้), ยกเลิก login (`error=access_denied` จาก LINE),
  error อื่นๆ (state ไม่ตรง/แลก token ไม่สำเร็จ) — ใช้ CSS class `.line-order-modal__panel` เดิมซ้ำ (ไม่ผูก
  `position:fixed` เองอยู่แล้ว วางนอก modal overlay ได้ตรงๆ) + คลาสใหม่ `.line-callback-page`/
  `.line-callback-profile`/`.line-callback-friend-btn` ใน `style.css`
  - ✅ **แก้ไขแล้ว** (เดิมเป็นข้อจำกัดที่เคยรู้อยู่): เดิมปุ่ม "เพิ่มเราเป็นเพื่อนใน LINE" โชว์แค่ครั้งเดียวใน
    ทางปฏิบัติ เพราะ `line-callback.html` ถูกเปิดก็ต่อเมื่อยังไม่มี profile ใน localStorage — ลูกค้าที่กด
    "ข้ามไปก่อน" ครั้งแรกจะไม่มีโอกาสเห็นปุ่มนี้อีกเลย ทำให้ออเดอร์ครั้งต่อๆ ไปไม่ถูกแจ้งแอดมินตลอดไปแบบไม่มี
    ทางแก้ — **แก้แล้วโดยเปลี่ยนความหมายของ `cpbf-line-profile` เป็น "ยืนยันเป็นเพื่อนแล้ว" แทน "login แล้ว"**
    (ดู `line-login.js` ด้านบน) ตอนนี้ถ้ายังไม่เพิ่มเพื่อน จะไม่ save profile เลย ทำให้กด "สั่งซื้อผ่าน LINE"
    ครั้งถัดไปวนกลับมาที่หน้านี้ใหม่ทุกครั้งจนกว่าจะเพิ่มเพื่อนสำเร็จจริง — ลูกค้ามีโอกาสเห็น/กดปุ่มนี้ได้ทุก
    ครั้งที่พยายามสั่งซื้อ ไม่ใช่แค่ครั้งแรกอีกต่อไป
  - ⚠️🔧 **แก้บั๊ก [hidden] เดียวกับที่เจอใน `.cms-icon-btn[hidden]` มาก่อน**: `.line-order-modal__actions`
    (wrapper ของลิงก์ "หรือแชทกับเราต่อทาง LINE" ใน `#lineCallbackChatLinkWrap`) มี `display:flex` ที่
    specificity เท่ากับ `[hidden]` ของ browser (`0,1,0` ทั้งคู่) แต่มาทีหลังใน cascade เลยชนะ ทำให้ลิงก์นี้
    โผล่มาแม้จะไม่ได้ resume order ก็ตาม (พบระหว่างถ่าย screenshot ทดสอบปุ่มเพิ่มเพื่อน 2026-07-31) — แก้แล้ว
    ด้วย `.line-order-modal__actions[hidden] { display: none; }` ใน `style.css` (pattern เดียวกับ
    `.line-order-modal[hidden]` ที่มีอยู่แล้ว) ยืนยันด้วย `getComputedStyle` ก่อน/หลังแก้ว่า `display` เปลี่ยน
    จาก `flex` เป็น `none` ถูกต้อง
- **`supabase/functions/line-login-exchange/index.ts`** (Edge Function ใหม่ — **ยังไม่ได้ deploy**) — แลก
  `code`+`redirect_uri` เป็น `access_token` ผ่าน `api.line.me/oauth2/v2.1/token` (ใช้
  `LINE_LOGIN_CHANNEL_ID`/`LINE_LOGIN_CHANNEL_SECRET` เป็น secret ฝั่ง server เท่านั้น — Channel secret ห้าม
  อยู่ฝั่ง client เด็ดขาด) แล้วดึงโปรไฟล์จริงผ่าน `api.line.me/v2/profile`
- **`supabase/functions/send-line-order/index.ts`** (แก้ไขจากของเดิม — **ยังไม่ได้ redeploy ทับของเดิมที่
  ใช้งานอยู่จริง**) — รับ `lineUserId`/`lineDisplayName` เพิ่ม push ข้อความยืนยันแบบลูกค้า (โทนขอบคุณ/รายการ/
  รวมเงิน) เข้า `lineUserId` โดยตรงก่อนเสมอ — ⚠️ **เปลี่ยนจากพฤติกรรมเดิมตามที่ผู้ใช้ขอ 2026-07-31**:
  แต่เดิม push แจ้งแอดมินเสมอไม่ว่าลูกค้าจะเป็นเพื่อนกับ OA หรือไม่ (ใช้เป็น backup) ตอนนี้เปลี่ยนเป็น
  **push แจ้งแอดมินก็ต่อเมื่อ push เข้าแชทลูกค้าสำเร็จเท่านั้น** (สำเร็จ = พิสูจน์แล้วว่าเป็นเพื่อนกับ OA จริง
  — ข้อจำกัดของ Messaging API push) ถ้าลูกค้ายังไม่เพิ่มเพื่อน (หรือไม่มี `lineUserId` แนบมาเลย) จะ**ไม่แจ้ง
  แอดมินเลย** (`adminOk: null` = ไม่ได้พยายามส่ง ต่างจาก `false` = พยายามแล้วแต่ล้มเหลว) — ผลคือถ้าลูกค้าไม่
  เพิ่มเพื่อน ออเดอร์จะไม่ถูกส่งไปหาแอดมินทางไหนเลย (ไม่มี fallback อีกต่อไป) เพื่อบังคับว่าทุกออเดอร์ที่แอดมิน
  เห็นต้องมีแชทจริงรองรับเสมอ ไม่มีเคส "เห็นแจ้งเตือนแต่หาแชทลูกค้าไม่เจอ" — ⚠️ ข้อควรพิจารณาที่ยังไม่ได้ทำ
  (ผู้ใช้ยังไม่ได้ตอบ): ตอนนี้ลูกค้าที่ไม่เพิ่มเพื่อนจะไม่มีการแจ้งเตือนอะไรเป็นพิเศษว่าออเดอร์ไม่ถึงแอดมิน
  (ยังเห็น modal/deep link เดิมเหมือนกรณีอื่นทุกประการ) อาจพิจารณาเพิ่มข้อความเตือนถ้าต้องการ
- **ทดสอบแล้ว** (client-side logic ผ่าน mock `fetch`/`localStorage`/`sessionStorage` ใน browser):
  path ยังไม่ login เก็บ pending order + redirect ไปโดเมน `access.line.me` จริงถูกต้อง, path login แล้ว
  ส่ง `lineUserId`/`lineDisplayName` ไป Edge Function ถูกต้อง + desktop แสดง modal ถูกต้อง,
  `line-callback.html`'s `handleLineCallback()` เช็ค state/เซฟ profile/resume order/render UI ถูกต้องทั้งหมด
  — **ยังไม่ได้ทดสอบ OAuth round-trip จริงกับ LINE** เพราะ callback ต้องเป็นโดเมน HTTPS ที่ลงทะเบียนไว้เป๊ะๆ
  ทดสอบผ่าน `file://`/`localhost` ไม่ได้เลย
- **`send-line-order` เวอร์ชันใหม่ทดสอบแบบ pre-deploy สำเร็จแล้วจริง 100%** (2026-07-31) — ติดตั้ง Deno CLI
  บนเครื่อง แล้วรันไฟล์ `.ts` ตรงๆ ด้วย `deno run --allow-net --allow-env` พร้อม secret จริงที่ deploy อยู่
  (ไม่ต้องพึ่ง Supabase/Docker เลยเพราะ Edge Function เป็นแค่ Deno script ธรรมดา) ยิง request จริงไปหา LINE
  โดยใช้ userId ของแอดมินเองแทนลูกค้า (เพราะแอดมินเป็นเพื่อนกับ OA อยู่แล้ว) ได้ผลลัพธ์
  `{"ok":true,"adminOk":true,"customerOk":true}` พร้อมเห็นข้อความจริง 2 แบบเข้า LINE ของแอดมินเองจริง — ระหว่าง
  ทดสอบเจอว่า **secret `LINE_ADMIN_USER_ID` ที่ deploy อยู่ปัจจุบันผิดรูปแบบ** (ไม่ใช่ userId จริง) ต้องแก้ก่อน
  deploy เวอร์ชันใหม่ — ดูรายละเอียดเต็มที่ "สิ่งที่ต้องทำต่อ" ข้อ 0c — **ทดสอบซ้ำอีกรอบหลังเปลี่ยนพฤติกรรม
  "แจ้งแอดมินก็ต่อเมื่อลูกค้าเป็นเพื่อนแล้ว"** (2026-07-31): ยิง request ด้วย userId ปลอม (ไม่ใช่เพื่อน) ได้
  `{"ok":false,"error":"ลูกค้ายังไม่ได้เพิ่มเพื่อน LINE — ไม่ได้แจ้งแอดมิน","adminOk":null,"customerOk":false}`
  พร้อมยืนยันจาก log ว่า push ไปหาแอดมินไม่ได้ถูกเรียกเลยแม้แต่ครั้งเดียว (ไม่ใช่แค่ล้มเหลว — ไม่ได้พยายามส่ง
  จริง) แล้วยิงซ้ำด้วย userId ของแอดมินเอง (เป็นเพื่อนแน่นอน) ได้ `{"ok":true,"adminOk":true,"customerOk":true}`
  เหมือนเดิม ยืนยันว่า logic เงื่อนไขใหม่ถูกต้องทั้งสองเคส

## Contact Us / เบอร์โทร

- ปุ่ม/ลิงก์ "Contact Us"/"ติดต่อเรา" ทุกจุด (nav หลัก, footer) เปลี่ยนเป็น `mailto:cpbfhr@cpbf.co.th`
  แล้วตามคำสั่งผู้ใช้ (แทนที่จะพาไปหน้า `contact.html` เหมือนเดิม) — ยกเว้นลิงก์ "ไปหน้าติดต่อเราแบบเต็ม"
  ในป๊อปอัปลอย (`index.html`) ที่ยังพาไปหน้า `contact.html` จริง เพื่อให้ยังมีทางเข้าถึงหน้านั้นได้
- เบอร์โทรทุกจุดที่เจอ (ที่เป็น plain text) ถูกห่อด้วย `tel:` แล้ว — เบอร์ที่แสดงยังเป็นเบอร์เดิมที่มีอยู่แล้ว
  ในเว็บ (ไม่ได้เปลี่ยนตัวเลข แค่ทำให้กดโทรได้จริง) เบอร์ในเว็บมี **2 เบอร์ที่ต่างกัน** อยู่ (02-000-0000
  placeholder เดิม vs 02-003-3113 ที่ contact.html) — ยังไม่ได้รวมให้เป็นเบอร์เดียว เพราะไม่ใช่ขอบเขตที่สั่ง

## CMS: Topbar + Sidebar nav (shell ที่ทุกหน้า CMS มีเหมือนกัน)

⚠️ ไม่มี partial/component กลาง — sidebar+topbar เป็น markup ที่ copy วางซ้ำอยู่ในทุกไฟล์ CMS ทั้ง 9 หน้า
(`index.html`, `banners.html`, `subscribers.html`, `products.html`, `product-categories.html`,
`news-articles.html`, `news-categories.html`, `pages.html`, `page-editor.html` — ไม่รวม `login.html`
ซึ่งไม่มี shell นี้) **ถ้าจะแก้ sidebar/topbar อีกในอนาคตต้องแก้ทั้ง 9 ไฟล์เหมือนกันทุกครั้ง**

- **เอาช่องค้นหา (`.cms-topbar__search`) กับไอคอนกระดิ่งแจ้งเตือน (`.cms-icon-btn`) ออกจาก topbar แล้ว**
  ทั้งคู่ไม่เคยมีฟังก์ชันจริงผูกอยู่เลย (ช่องค้นหามี `disabled` ตาย ๆ, กระดิ่งไม่มี JS bind คลิกใด ๆ) —
  ลบ markup ออกทั้งหมด ไม่ใช้ `hidden` attribute (**ลองแล้วไม่เวิร์ก**: `.cms-icon-btn { display:flex }`
  ใน `cms/style.css` มี specificity เท่ากับ `[hidden] { display:none }` ของ browser แต่มาทีหลังในลำดับ
  cascade เลยชนะ ปุ่มยังโชว์อยู่ทั้งที่มี `hidden` ติดอยู่ — ถ้าจะซ่อนอะไรแบบนี้อีกต้องเขียน CSS
  `selector[hidden] { display:none }` ตรง ๆ หรือลบ markup ไปเลยเหมือนที่ทำรอบนี้)
- `.cms-topbar__right` (avatar + email) เดิมพึ่ง `justify-content:space-between` ของ `.cms-topbar` คู่กับ
  `.cms-topbar__search` ผลักไปชิดขวา พอเอา search ออกเหลือ child เดียว `space-between` จะดันไปชิดซ้าย
  แทน (พฤติกรรม flexbox ปกติ ไม่ใช่บั๊ก) — แก้ด้วย `margin-left:auto` บน `.cms-topbar__right` ใน
  `cms/style.css` แทน
- เปลี่ยนชื่อเมนู sidebar จากภาษาอังกฤษเป็นไทยให้ตรงกับเมนูอื่นที่เป็นไทยอยู่แล้วทั้งหมด: **"Menu
  Management" → "จัดการเมนู"**, **"Banner Management" → "จัดการแบนเนอร์"** (แก้เฉพาะ label ใน `<nav>`
  เท่านั้น — `<title>`/breadcrumb ของ `cms/index.html`/`cms/banners.html` ที่ยังเป็น "Menu Management"/
  "Banner Management" ภาษาอังกฤษ **ยังไม่ได้แตะ** เพราะผู้ใช้ขอเฉพาะ "ชื่อเมนู")
- **เอารายการเมนู "Media (เร็วๆ นี้)" ออกจาก sidebar แล้ว** (เดิมเป็น placeholder `<span>` ที่กด
  ไม่ได้ตายตัว ไม่มีหน้า/ฟีเจอร์จริงรองรับ) — ⚠️ ตอนลบรอบแรกพลาด ใช้ regex `.*?` non-greedy ไล่หา
  `</span>` ตัวแรกที่เจอ ซึ่งดันไปตรงกับ `</span>` ปิด icon span ด้านในก่อน ทำให้เหลือข้อความ
  "Media (เร็วๆ นี้)" กับ `</span>` ลอยค้างอยู่ใน markup (เห็นเป็นข้อความดิบไม่มีสไตล์โผล่ใต้เมนูในเว็บ) —
  แก้แล้วโดยลบ 2 บรรทัดที่ค้างนั้นออกเพิ่มอีกรอบ บทเรียน: เวลาลบ block ที่มี nested tag ชนิดเดียวกันซ้อนกัน
  (span ใน span) ต้อง verify ผลลัพธ์จริงเสมอ อย่าเชื่อแค่ตัวเลข "removed=N" จาก regex
- **ย้ายปุ่ม "ออกจากระบบ" จาก footer ของ sidebar มาไว้ใน dropdown ที่มุมขวาบน** — คลิกที่ avatar
  (`#cmsAvatarBtn`, เดิมเป็น `<div class="cms-avatar">` เปลี่ยนเป็น `<button>`) เปิด/ปิด
  `#cmsAvatarDropdown` (toggle class `.is-open`) แสดงปุ่ม "ออกจากระบบ" (`#cmsLogoutBtn` — id เดิม, ฟังก์ชัน
  signOut + redirect ไป `login.html` ใน `cms/app.js` ไม่ต้องแก้อะไร) คลิกนอก dropdown หรือกด Escape ปิด
  อัตโนมัติ — เอา `.cms-nav__spacer`/`.cms-nav__footer` ออกจาก sidebar ไปด้วย (ไม่มีอะไรเหลือให้ผลักลงล่าง
  แล้ว) ⚠️ ต้องใช้ class `.is-open` toggle แทนที่จะพึ่ง `hidden` attribute ตรงๆ เพราะเจอปัญหา specificity
  แบบเดียวกับ `.cms-icon-btn[hidden]` ก่อนหน้านี้ — ถ้า element มี `display` มาจาก class อื่นอยู่แล้ว
  `[hidden]` ของ browser มักแพ้ ให้ตั้ง `display:none` เป็นค่า default ของ class นั้นเองแล้ว toggle
  `.is-open { display:block }` ทับแทน — logic เปิด/ปิด dropdown อยู่ใน `cms/app.js` (shared ทุกหน้า
  ไม่ต้องเขียนซ้ำต่อไฟล์)
- **Sidebar เป็น sticky แล้ว** — `.cms-sidebar { position:sticky; top:0; height:100vh; overflow-y:auto; }`
  ใน `cms/style.css` (เดิมแค่ scroll หายไปพร้อมหน้าเพราะเป็น flex item ธรรมดาใน `.cms-shell` ที่ไม่มีการ
  fix ตำแหน่งเลย) ใช้ `position:sticky` แทน `fixed` เพราะยังเป็น flex item ของ `.cms-shell` (`display:flex`)
  อยู่ — `.cms-main` ข้างๆ ไม่ต้องคำนวณ `margin-left` เองเลย flexbox จัดความกว้างที่เหลือให้อัตโนมัติเมื่อ
  sidebar ย่อ/ขยาย (ดูข้อถัดไป)
- **Sidebar ย่อ/ขยายได้ด้วยปุ่ม hamburger** ที่มุมขวาของ `.cms-sidebar__logo` (`#cmsSidebarToggle`) —
  กดแล้ว toggle class `.is-collapsed` บน `.cms-sidebar`: กว้างเหลือ 76px, ไอคอนอยู่กึ่งกลาง, ซ่อนข้อความ
  ป้ายเมนู (`.cms-nav__label` — **ห่อ label ของทุก nav item เป็น `<span class="cms-nav__label">` ใหม่แล้ว
  เพื่อให้ CSS ซ่อนได้** เดิมเป็น text node ลอยๆ หลัง icon span ซ่อนด้วย CSS เฉยๆ ไม่ได้) และ
  `.cms-nav__group-label` (หัวข้อกลุ่มเช่น "สินค้า"/"Newsroom") ไปด้วย — โลโก้ไม่ต้องซ่อน/ครอปพิเศษ เพราะ
  ภาพโลโก้จริงเกือบเป็นสี่เหลี่ยมจัตุรัส (3168×2231) พอดีกับความกว้าง 76px อยู่แล้ว
  - **จำสถานะย่อ/ขยายด้วย `localStorage['cms-sidebar-collapsed']`** เพราะเว็บนี้เป็น static multi-page
    ไม่มี state คงอยู่ข้ามการโหลดหน้าใหม่ตามธรรมชาติ — `cms/app.js` apply class `.is-collapsed` ทันทีที่
    สคริปต์รัน (**ก่อน** `DOMContentLoaded`, ก่อน paint) กันเห็นเมนูกระพริบเต็ม/ย่อสลับกันตอนโหลดหน้าใหม่
    ทุกครั้ง ส่วน event listener ของปุ่ม toggle เองยังอยู่ใน `DOMContentLoaded` ตามปกติ (ต้องรอ DOM parse
    ให้ปุ่มมีอยู่ก่อน)
- **ไอคอนเมนู "รายการสินค้า" เปลี่ยนเป็นรูปตะกร้า (shopping cart)** แล้ว (เดิมเป็นไอคอนกล่อง/พัสดุ ซึ่งซ้ำ
  แนวคิดกับไอคอนหมวดหมู่สินค้า) — SVG path เดียวกับ feather-icons `shopping-cart`

## CMS: หน้า Login

- โลโก้จริง (`AW_CPB&F logo RGB updated_29-10-24.png` ไฟล์เดียวกับ footer เว็บหลัก) แทนไอคอน 🔷 เดิม
  แล้ว ในทุกหน้า CMS (sidebar logo ด้วย ไม่ใช่แค่หน้า login)
- Field รหัสผ่านมี **ปุ่มไอคอนตา (show/hide password)** และ style ตรงกับ field อีเมลแล้ว (เดิม field
  password/number ไม่มี style เพราะ CSS selector เดิมลืมใส่ `input[type="password"]`/`input[type="number"]`
  ไว้ — เจอบั๊กนี้ซ้ำหลายรอบตอนเพิ่ม field ใหม่ๆ ในฟอร์มสินค้า/บทความ ให้ระวังเวลาเพิ่ม input type ใหม่)

## ระบบจัดการแอดมิน CMS (Admin Management)

ระบบ CRUD สำหรับบัญชีแอดมินที่ login เข้า CMS ได้ — **ไม่มีตาราง `admins` แยกต่างหาก** จัดการ
`auth.users` ของ Supabase Auth ตรงๆ (ระบบเดิมทั้งหมดถือว่าทุกคนที่ login สำเร็จ = แอดมินเต็มสิทธิ์ ไม่มี
role/ชั้นสิทธิ์ย่อย จึงยังไม่จำเป็นต้องมีตารางโปรไฟล์แยก — ใช้ `user_metadata` เก็บแค่ `display_name` และ
`must_set_password` เท่านั้น)

- **✅ Deploy แล้ว (ยืนยัน 2026-07-31)** — `supabase/functions/manage-admins/index.ts` ถูก deploy ขึ้น
  Supabase จริงแล้ว ทดสอบสร้างแอดมินจริงผ่าน `cms/admins.html` สำเร็จ (เห็นรหัสผ่านสุ่มจริงในหน้าจอ ยืนยันว่า
  Edge Function ทำงานถูกต้อง) — เหตุผลที่ต้องมี Edge Function: การ list/create/update/delete ผู้ใช้ใน `auth.users`
  ต้องใช้ **service_role key** เท่านั้น (`supabase.auth.admin.*` ใช้ anon/authenticated key จากฝั่ง
  client ไม่ได้เลย) และ service_role ห้ามฝังในโค้ดฝั่ง client เด็ดขาด — Edge Function จึงเป็นตัวกลางเดียว
  ที่แตะ service_role ได้ (ตรวจ JWT ของผู้เรียกก่อนทุกครั้งว่า login เข้า CMS อยู่จริงก่อนอนุญาต) วิธี deploy:
  `supabase functions deploy manage-admins` ผ่าน Supabase CLI (หรือ paste โค้ดผ่าน Dashboard > Edge
  Functions) — ไม่ต้องตั้ง secret เพิ่มเอง เพราะ `SUPABASE_URL`/`SUPABASE_ANON_KEY`/
  `SUPABASE_SERVICE_ROLE_KEY` ถูก inject ให้อัตโนมัติทุก Edge Function อยู่แล้วโดย Supabase
- **Actions ที่ Edge Function รองรับ** (เรียกผ่าน `POST .../functions/v1/manage-admins` body
  `{action, ...}`, แนบ `Authorization: Bearer <access_token>` ของ session ปัจจุบันเสมอ):
  - `list` — คืนรายชื่อแอดมินทั้งหมด (สูงสุด 200) + `currentUserId` ของผู้เรียก
  - `create` — สร้างแอดมินใหม่ด้วย **รหัสผ่านสุ่มอัตโนมัติ 14 ตัวอักษร** (ตัวใหญ่/เล็ก/เลข/สัญลักษณ์
    ครบ) พร้อม `email_confirm: true` (ยืนยันอีเมลให้อัตโนมัติ) — **แอดมินใหม่ login ได้ทันทีไม่ต้องกดยืนยัน
    อีเมล** ตามที่ผู้ใช้ขอ — ตั้ง `user_metadata.must_set_password = true` ให้เสมอ, คืนรหัสผ่านที่สุ่มได้
    กลับมาให้แอดมินที่สร้างคัดลอกไปส่งต่อเอง (แสดงครั้งเดียวเท่านั้น ไม่เก็บ/แสดงซ้ำอีก)
  - `update` — แก้ `display_name` เท่านั้น (ไม่รองรับเปลี่ยนอีเมล/รหัสผ่านตรงนี้ เพื่อเลี่ยงความซับซ้อนเรื่อง
    re-confirm อีเมล) — merge กับ `user_metadata` เดิมก่อน update เสมอ (กัน `must_set_password` หาย เพราะ
    `updateUserById`'s `user_metadata` เป็นการ**แทนที่**ทั้งก้อน ไม่ใช่ merge อัตโนมัติ)
  - `reset_password` — สุ่มรหัสผ่านใหม่ให้แอดมินคนอื่น (เช่น กรณีลืมรหัสผ่าน) ตั้ง `must_set_password = true`
    กลับเป็น true อีกครั้ง คืนรหัสผ่านใหม่มาแสดงครั้งเดียวเหมือน `create`
  - `delete` — ป้องกัน 2 กรณี: **ลบบัญชีตัวเองไม่ได้** (เทียบ `id` กับผู้เรียกจริงจาก JWT) และ **ลบแอดมิน
    คนสุดท้ายของระบบไม่ได้** (เช็ค `listUsers().length <= 1`) กันระบบไม่มีใคร login เข้ามาจัดการต่อได้เลย
- **`cms/admins.html` + `cms/admins.js`** (หน้าใหม่ในเมนู sidebar กลุ่ม "ระบบ" > "จัดการแอดมิน" — เพิ่ม
  ลิงก์นี้ในทุกหน้า CMS ที่มี shell แล้วทั้ง 10 หน้า) — table list (อีเมล/ชื่อที่แสดง/สร้างเมื่อ/
  เข้าสู่ระบบล่าสุด — **ไม่มีคอลัมน์ "สถานะรหัสผ่าน" แล้ว** ตัดออกตามที่ผู้ใช้ขอ 2026-07-31), ค้นหาด้วยอีเมล/
  ชื่อ, ปุ่ม "+ เพิ่มแอดมิน" เปิด modal (อีเมล + ชื่อที่แสดง ไม่บังคับ) → หลัง
  บันทึกเปิด modal "รหัสผ่านเริ่มต้น" ให้คัดลอกทันที (ช่องรหัสผ่านห่อด้วย `.cms-field` + `<label>`
  "รหัสผ่านเริ่มต้นสำหรับ &lt;email&gt;" ให้หน้าตาตรงกับฟิลด์อื่นๆ เช่น "ชื่อที่แสดง" — แก้ตามที่ผู้ใช้ขอ
  2026-07-31 เดิมลืมห่อ `.cms-field` เลยไม่ได้ style มาตรฐาน มีปุ่มคัดลอก + คำเตือนว่าจะไม่แสดงซ้ำ) — แถวของ
  ตัวเอง (เทียบกับ `currentUserId` ที่ Edge Function ส่งกลับมา) มี badge "คุณ" กำกับไว้ และ**ไม่มีปุ่มลบ**เลย
  (กันลบตัวเองผิดพลาดตั้งแต่ฝั่ง UI ซ้อนกับ guard ฝั่ง server) — สถานะ `must_set_password` ยังเก็บอยู่ใน
  `user_metadata` เหมือนเดิม (ใช้โดย flow "ตั้งรหัสผ่านใหม่" หลัง login) แค่ไม่แสดงเป็น badge ในตารางแล้ว
- **Flow "ตั้งรหัสผ่านใหม่" หลัง login ครั้งแรก (ไม่บังคับ)** — อยู่ใน `cms/app.js`'s `cmsRequireAuth()`
  (รันอัตโนมัติทุกหน้า CMS หลัง login สำเร็จ ไม่ต้องเพิ่มโค้ด/markup แยกทีละหน้า เพราะ build modal ด้วย JS
  ล้วนแล้ว append เข้า `document.body` ตรงๆ) เช็ค `session.user.user_metadata.must_set_password` — ถ้า
  true จะเด้ง modal ถามตั้งรหัสผ่านใหม่ (ช่องรหัสผ่านใหม่ + ยืนยัน, ขั้นต่ำ 8 ตัวอักษร) พร้อมปุ่ม "ข้ามไปก่อน"
  — กด "ข้ามไปก่อน" จะไม่ถามซ้ำอีกใน**เซสชันเบราว์เซอร์เดียวกันเท่านั้น** (เก็บ flag ไว้ใน
  `sessionStorage['cms-skip-password-prompt']`) แต่จะกลับมาถามใหม่ทุกครั้งที่ login รอบใหม่จนกว่าจะตั้งรหัสผ่าน
  จริงสำเร็จ (เรียก `cmsSupabase.auth.updateUser({password, data:{must_set_password:false}}))` เอง — เป็น
  self-service update ไม่ต้องผ่าน Edge Function เพราะเป็นการแก้ข้อมูลของตัวเอง)
- **ทดสอบแล้ว**: ยืนยันด้วย browser จริงว่าหน้า `cms/admins.html` render ถูกต้อง sidebar link ใช้งานได้ทุกหน้า
  ไม่มี console error — flow เต็ม (list/create/edit/reset/delete/ตั้งรหัสผ่านใหม่) แรกสุดทดสอบผ่าน mock
  fetch แทน Edge Function จริง (ตอนนั้นยังไม่ได้ deploy) — ยืนยันแล้วว่า: self-delete guard ซ่อนปุ่มลบแถว
  ตัวเองถูกต้อง, edit mode ล็อกช่องอีเมลถูกต้อง, password reveal modal + ปุ่มคัดลอกทำงานถูกต้องทั้งตอน
  create และ reset, "ข้ามไปก่อน" ตั้งค่า sessionStorage และไม่เด้งซ้ำถูกต้อง, submit สำเร็จเรียก
  `updateUser` ด้วย payload ที่ถูกต้อง — **✅ ตอนนี้ deploy แล้วและทดสอบกับ Edge Function จริงสำเร็จ**
  (ยืนยัน 2026-07-31 — ผู้ใช้สร้างแอดมินจริงผ่านหน้านี้ได้ เห็นรหัสผ่านสุ่มจริงแสดงในหน้าจอ)

## SQL migrations — สถานะการรัน (ตรวจสอบจริงกับ Supabase ล่าสุด 2026-07-31)

> ⚠️ **แก้ไขสถานะย้อนหลัง 2026-07-31**: ตรวจสอบซ้ำผ่าน REST API ตรงๆ (query คอลัมน์จริงใน `page_sections`,
> นับแถว `page_sections` ของเพจ `index`/`career`) แล้วพบว่า **`schema-pages-v2.sql` ถึง `v8.sql` และทั้ง
> 2 ไฟล์ seed (`seed-index-sections.sql`/`seed-career-sections.sql`) รันไปแล้วจริงทั้งหมด** (ผู้ใช้รันเองนอก
> session โดยไม่ได้แจ้ง) เอกสารเวอร์ชันก่อนหน้านี้ (2026-07-27) ยังขึ้นว่า "❌ ยังไม่ได้รัน" ทุกไฟล์ตั้งแต่ v2
> เป็นต้นไป ซึ่งล้าสมัยแล้ว — ตารางด้านล่างนี้แก้ให้ตรงกับสถานะจริงแล้ว

รันเรียงตามลำดับนี้ถ้าต้องตั้งฐานข้อมูลใหม่ทั้งหมด (เช่น ย้าย Supabase project):

| ไฟล์ | สถานะ | หมายเหตุ |
|---|---|---|
| `cms/schema.sql` | ✅ รันแล้ว | สร้างตาราง `menu_items` + seed เมนูหลัก 7 อัน (ตอนนี้มี 26 แถวรวม submenu) |
| `cms/seed-submenus.sql` | ✅ รันแล้ว | seed เมนูย่อย (dropdown) พร้อมรูป gallery |
| `cms/schema-banners.sql` | ✅ รันแล้ว | สร้างตาราง `banners` (v1 ไม่มี page_url) |
| `cms/schema-banners-v2.sql` | ✅ รันแล้ว | เพิ่ม `page_url`/`text_align`, ย้าย quota เป็นต่อเพจ (ตอนนั้นแค่ Hero) |
| `cms/schema-banners-v3.sql` | ✅ รันแล้ว | ⚠️ แก้สถานะย้อนหลัง 2026-08-01 — เอกสารเดิมบอกว่ายังไม่ได้รัน แต่ยืนยันผ่าน REST API แล้วว่ารันไปแล้วจริง (พบ `page_sections` 2 แถวเก่าที่ `anchor_id='kv-banner'` สำหรับเพจ `index`/`our_story`, `banners.page_url` ของ KV แถวเดิมถูก backfill เป็น `'index.html'` แล้ว) — KV Banner แยกตามเพจเหมือน Hero, quota trigger เป็นต่อเพจสำหรับ KV ด้วย |
| `cms/schema-banners-v4.sql` | ❌ **ยังไม่ได้รัน** | KV Banner แต่ละอันแยก `page_sections` proxy row ของตัวเอง (`anchor_id='kv-banner-<banner id>'`) แทนที่จะใช้ร่วมกันทั้งเพจแบบ v3 — ลบ proxy row เก่า (`anchor_id='kv-banner'`) ทิ้งแล้วสร้างใหม่ให้ทุก KV banner ที่ active อยู่ตอนนี้ — **ต้องรันก่อนถึงจะเห็น KV Banner 2 แถวเก่า (เพจ `index`/`our_story`) แยกเป็น section อิสระใน `cms/page-editor.html`** ไม่งั้นจะยังโผล่รวมกันที่ตำแหน่งเดียวแบบเดิม (โค้ดใหม่จะมองไม่เห็น proxy row แบบเก่าเลยด้วยซ้ำ เพราะเช็ค prefix `kv-banner-` ไม่ใช่ exact match `kv-banner` แล้ว — แปลว่าถ้าไม่รัน migration นี้ KV banner ของ 2 เพจนี้จะหายไปจากหน้าเว็บจริงเงียบๆ จนกว่าจะรัน) |
| `cms/fix-broken-urls.sql` | ✅ รันแล้ว | แก้ url เดิมที่ชี้ about.html/what-we-do.html ที่ไม่มีแล้ว |
| `cms/schema-storage.sql` | ✅ รันแล้ว | สร้าง bucket `cms-uploads` (ยืนยันแล้วว่ามีไฟล์อัปโหลดจริงอยู่) |
| `cms/fix-contact-us-mailto.sql` | ❌ **ยังไม่ได้รัน** | เมนู "ติดต่อเรา" ในฐานข้อมูลยัง url=`contact.html` อยู่ (static HTML แก้แล้ว แต่เมนูที่ nav-render.js ดึงจาก DB จะทับด้วยค่าเดิมจนกว่าจะรันไฟล์นี้) |
| `cms/schema-subscribers.sql` | ✅ รันแล้ว | สร้างตาราง `subscribers` (ยืนยันแล้วว่ามีอยู่จริง 0 แถว — ยังไม่มีคนสมัครจริง) |
| `cms/schema-products.sql` | ✅ รันแล้ว | สร้าง `products`/`product_categories` + seed (ตอนนี้เหลือ 5/6 แถวตามลำดับ — ผู้ใช้ล้าง/แก้ seed data ไปแล้วบางส่วนผ่าน CMS) |
| `cms/schema-products-v2.sql` | ✅ รันแล้ว | เพิ่มคอลัมน์ `images text[]` (ยืนยันแล้วว่าคอลัมน์มีอยู่จริง) |
| `cms/schema-news.sql` | ✅ รันแล้ว | สร้าง `news_articles`/`news_categories` + seed (ยืนยันแล้วว่ามี 4/3 แถวตรงกับที่ seed ไว้พอดี) |
| `cms/schema-pages.sql` | ✅ รันแล้ว | สร้าง `pages`/`page_sections` + seed 18 แถว (ระบบจัดการเพจ) — รันตอนที่ไฟล์ยังเป็นคอลัมน์ `image` เดี่ยว (ก่อนเปลี่ยนเป็น `images text[]` ตามที่ผู้ใช้ขอรองรับหลายรูปต่อ section) ตารางจริงจึงยังเป็นคอลัมน์เก่าอยู่ — ดู `schema-pages-v2.sql` |
| `cms/schema-pages-v2.sql` | ✅ รันแล้ว | แก้ `page_sections.image` (เดี่ยว) → `images text[]` (สูงสุด 4 รูป) — ยืนยันคอลัมน์มีจริงผ่าน REST API 2026-07-31 |
| `cms/schema-pages-v3.sql` | ✅ รันแล้ว | เพิ่ม `page_sections.button_link_en` — ยืนยันคอลัมน์มีจริง |
| `cms/schema-pages-v4.sql` | ✅ รันแล้ว | เพิ่ม layout `custom-html` เข้า check constraint — ยืนยันจากการที่ section จริงใช้ `custom-html` อยู่ (career/index proxy sections) |
| `cms/schema-pages-v5.sql` | ✅ รันแล้ว | เพิ่ม `bg_image`/`bg_opacity`/`bg_grayscale` — ยืนยันคอลัมน์มีจริง |
| `cms/schema-pages-v6.sql` | ✅ รันแล้ว | เพิ่ม `page_sections.images_grayscale` — ยืนยันคอลัมน์มีจริง |
| `cms/schema-pages-v7.sql` | ✅ รันแล้ว | เพิ่ม `bg_type`/`bg_color`/`bg_gradient_from`/`bg_gradient_to`/`bg_gradient_direction` — ยืนยันคอลัมน์มีจริง |
| `cms/schema-pages-v8.sql` | ✅ รันแล้ว | เพิ่ม `page_sections.heading_align` — ยืนยันคอลัมน์มีจริง |
| `cms/seed-index-sections.sql` | ✅ รันแล้ว | ยืนยันเพจ `index` มี 6 section จริงตรงตาม anchor_id ที่ seed ไว้ (`our-story`/`our-business`/`products`/`news-events`/`our-partners`/`contact-us`) |
| `cms/seed-career-sections.sql` | ✅ รันแล้ว | ยืนยันเพจ `career` มี 4 section จริงตรงตาม anchor_id ที่ seed ไว้ (`career-intro`/`career-benefits`/`career-features`/`apply-now`) |
| `cms/schema-pages-v9.sql` | ❌ **ยังไม่ได้รัน** | เพิ่ม `page_sections.button_style`/`button_color` (ปุ่มเลือกรูปแบบ Text Link/Primary/Primary Outline + สีเองได้) และ `image_links text[]` (ใส่ลิงก์แยกต่อรูปในกริดของ section) — **ต้องรันก่อนถึงจะบันทึกฟีเจอร์ 2 อย่างนี้ผ่าน `cms/page-editor.html` ได้จริง** ไม่งั้น Supabase จะ error "column does not exist" ตอนกด "บันทึก" |

## สิ่งที่ต้องทำต่อ (Next steps เรียงตามความสำคัญ)

0a. **Deploy ไฟล์ `_redirects` (+ `404.html` ใหม่) ขึ้น Netlify** — งานค้างใหม่ล่าสุด (2026-07-31) ถ้าไม่
    deploy เพจ standalone ที่สร้างผ่าน `cms/pages.html` จะเปิดผ่าน `<slug>.html` ไม่ได้เลย (ขึ้น 404 ของ
    Netlify เอง เพราะไม่มี URL rewrite rule ให้ fallback ไปที่ `promo.html?slug=...`) **และ** กฎ 404
    catch-all ใหม่ (`/*  /404.html  404`) จะยังไม่มีผลจนกว่าจะ deploy เช่นกัน (path ที่ไม่มีไฟล์จริงจะยังเจอ
    404 default ของ Netlify แทนหน้า `404.html` ของเราเอง) — วิธี deploy: commit ไฟล์ `_redirects`/`404.html`
    (อยู่ที่ root ของโปรเจกต์แล้ว) แล้ว push/deploy ตามปกติ Netlify จะอ่านไฟล์นี้เองอัตโนมัติ ไม่ต้องตั้งค่า
    อะไรเพิ่มใน Netlify Dashboard — ดูหัวข้อ "เพจ standalone (URL สะอาด)" และ "หน้า 404 (Page Not Found)"
    ด้านบนสำหรับรายละเอียดเต็ม

~~0b. Deploy `supabase/functions/manage-admins/index.ts`~~ — ✅ **เสร็จแล้ว** (ยืนยัน 2026-07-31 ผู้ใช้
    ทดสอบสร้างแอดมินจริงสำเร็จผ่าน `cms/admins.html`)

0c. **ตั้งค่า + deploy ระบบ LINE Login ให้ครบ (งานใหม่ล่าสุด 2026-07-31)** — โค้ดทั้งหมดเขียนเสร็จแล้ว แต่
    **ยังไม่ได้ทำสักขั้นตอนเดียว** ใช้งานจริงไม่ได้จนกว่าจะทำครบทุกข้อนี้ (ดูหัวข้อ "ระบบสั่งซื้อผ่าน LINE"
    ด้านบนสำหรับรายละเอียดเต็ม):
    - ตั้งค่า LINE Login channel ที่สร้างไว้แล้ว (Channel ID `2010917401`) ให้มี **Callback URL**
      `https://cpbf.co.th/line-callback.html` และ **scope `profile`/`openid`** (ปกติไม่ต้องตั้งอะไรเพิ่ม
      เพราะ LINE อนุญาต scope พื้นฐานนี้อัตโนมัติอยู่แล้ว) — ผู้ใช้หา "Linked OA" (ฟีเจอร์ผูก OA เพื่อ
      bot_prompt ตอน login) ในหน้า console ไม่เจอ จึงออกแบบไม่ให้พึ่งฟีเจอร์นี้เลย (ใช้ปุ่ม "เพิ่มเราเป็น
      เพื่อนใน LINE" ของเราเองใน `line-callback.html` แทน) — ไม่ต้องตามหาต่อ
    - Deploy Edge Function ใหม่ `supabase/functions/line-login-exchange/index.ts` (ยังไม่เคย deploy)
    - Deploy Edge Function `supabase/functions/send-line-order/index.ts` เวอร์ชันใหม่ทับของเดิม (เดิม
      deploy อยู่แล้วแต่เป็นซอร์สเก่าที่ยังไม่รับ `lineUserId`)
    - ตั้ง secret ใหม่ 2 ตัวใน Supabase Edge Function secrets: `LINE_LOGIN_CHANNEL_ID` (`2010917401`) และ
      `LINE_LOGIN_CHANNEL_SECRET` (ผู้ใช้มีค่านี้อยู่แล้ว จากตอนสร้าง channel — ห้ามใส่ในไฟล์ repo เด็ดขาด)
    - ⚠️🔧 **`LINE_ADMIN_USER_ID` ที่ deploy อยู่ตอนนี้ผิด — ต้องแก้ก่อน deploy `send-line-order` ใหม่**
      (พบระหว่างทดสอบ pre-deploy 2026-07-31): ค่าที่ตั้งไว้ปัจจุบันเป็น string 64+ ตัวอักษรที่ไม่ใช่รูปแบบ
      LINE userId จริง (userId จริงต้องขึ้นต้นด้วย `U` ตามด้วย hex 32 ตัว) — ทดสอบยิง push ตรงด้วยค่านี้แล้ว
      LINE ตอบ error "The property, 'to', in the request body is invalid" ทันที แปลว่า **การแจ้งเตือนแอดมิน
      ผ่าน LINE อาจไม่เคยทำงานเลยตั้งแต่แรก** (ไม่เกี่ยวกับงาน LINE Login เลย เป็นบั๊กเดิมที่เพิ่งเจอ) — ได้
      ค่าที่ถูกต้องมาแล้วผ่านการสร้าง Edge Function ชั่วคราว `supabase/functions/line-webhook-debug/index.ts`
      (ดัก `event.source.userId` จริงตอนแอดมินส่งข้อความหา `@cpbf` เอง) ค่าที่ถูกต้องคือ
      `U5b46d67cf227651173758cb489d41fa1` — **ต้องอัปเดต secret `LINE_ADMIN_USER_ID` ให้เป็นค่านี้ก่อน
      deploy `send-line-order` เวอร์ชันใหม่** ไม่งั้น push แจ้งแอดมินจะยัง fail ต่อไปเหมือนเดิม — ทดสอบยืนยัน
      แล้วว่าค่านี้ใช้ได้จริง (รัน `send-line-order` บนเครื่อง local ด้วย Deno พร้อม secret จริงชุดนี้ ยิง
      request จริงไปหา LINE ได้ผลลัพธ์ `{"ok":true,"adminOk":true,"customerOk":true}` — เห็นข้อความจริงเข้า
      LINE ของแอดมิน 2 ข้อความตามที่คาดไว้) — `line-webhook-debug` ลบทิ้งได้ (หรือปิด webhook ใน LINE
      console ไว้เฉยๆ ก็ได้ ไม่มีผลอะไรถ้าไม่ได้ใช้ต่อ ไม่ใช่ส่วนหนึ่งของระบบ LINE Login)
    - Deploy ไฟล์ใหม่ 2 ไฟล์ที่ root (`line-login.js`, `line-callback.html`) ขึ้น Netlify พร้อมกับไฟล์อื่น
      ที่แก้ไป (`cart.html`/`index.html`/`online_shop.html`/`product-detail.html`/`style.css`) — ผูกกับ
      "0a. Deploy `_redirects`" ข้างบน ควร deploy พร้อมกันทีเดียวเลย
    - ทดสอบ end-to-end จริงบนเว็บที่ deploy แล้วเท่านั้น (กด "สั่งซื้อผ่าน LINE" ทั้ง 4 ช่องทาง → ควร
      redirect ไป LINE Login → login แล้ว redirect กลับมาที่ `line-callback.html` → เห็นชื่อ/รูปโปรไฟล์จริง
      + ปุ่มเพิ่มเพื่อน → เปิด LINE Official Account Manager เช็คว่าเห็นข้อความยืนยันในแชทลูกค้าคนนั้นจริง)

~~0d. รัน `cms/schema-banners-v3.sql`~~ — ✅ **เสร็จแล้ว** (ยืนยันผ่าน REST API 2026-08-01 ว่ารันไปแล้วจริง
    — ดูตาราง SQL migrations ด้านบน)

0e. **รัน `cms/schema-banners-v4.sql` ใน Supabase SQL Editor** (งานใหม่ล่าสุด 2026-08-01) — จำเป็นก่อนที่
    KV Banner 2 แถวเก่า (เพจ `index`/`our_story`) จะแยกเป็น section อิสระต่อกันใน `cms/page-editor.html`
    ได้จริง — ไม่รันแล้วโค้ดใหม่ (เช็ค prefix `kv-banner-` ไม่ใช่ exact match `kv-banner` แบบเดิม) จะมองไม่เห็น
    proxy row เก่าเลยด้วยซ้ำ ทำให้ KV banner ของ 2 เพจนี้หายไปจากเว็บจริงเงียบๆ จนกว่าจะรัน (banner ที่สร้าง
    ใหม่หลังจากนี้ผ่าน `cms/banners.html` จะมี proxy row ของตัวเองให้อัตโนมัติอยู่แล้ว ไม่ต้องรอ migration —
    กระทบแค่ 3 banner เก่าที่มีอยู่ก่อนอัปเดตนี้เท่านั้น) — ดูหัวข้อ "ระบบ Banner" ด้านบน

1. **รัน `cms/schema-pages-v9.sql` ใน Supabase SQL Editor** — งานค้างที่สำคัญที่สุดตอนนี้ (แทนที่ข้อ
   v2-v8 เดิมที่ยืนยันแล้วว่ารันไปหมดแล้วจริง — ดูตาราง SQL migrations ด้านบน) เพิ่ม `button_style`/
   `button_color` (ปุ่มเลือกรูปแบบ Text Link/Primary/Primary Outline + สีเองได้) และ `image_links text[]`
   (ใส่ลิงก์แยกต่อรูปในกริดของ section) — ไม่รันจะกด "บันทึกการเปลี่ยนแปลงทั้งหมด"/"บันทึก" ใน
   `cms/page-editor.html` ไม่ได้เลย (Supabase จะ error "column does not exist")
2. **เพิ่มเนื้อหาให้ 16 หน้าที่เพิ่งแปลงเป็น Page Management** — เนื้อหาเดิม (ข้อความ/รูป) ที่เคย hardcode
   ถูกลบออกจาก HTML แล้วเพื่อเปลี่ยนมาใช้ระบบ section builder แทน แต่**ยังไม่ได้ auto-migrate เข้า
   `page_sections`** (ความเสี่ยงพิมพ์/ตัดต่อผิดถ้าทำอัตโนมัติทีเดียว 16 หน้าที่เนื้อหาไม่เหมือนกันเลย) —
   ผลคือตอนนี้ทั้ง 16 หน้าจะโชว์แค่ header+hero+footer เนื้อหาว่างเปล่าจนกว่าจะเพิ่ม section ผ่าน
   `cms/page-editor.html` เอง (ทำเองหรือขอให้ช่วยแปลงเนื้อหาเดิมทีละหน้าก็ได้)
3. **แก้ dead link ที่เหลือจากการลบ `products.html` เดิม** — หลายไฟล์ยังมี header nav/footer ลิงก์ไปหน้าที่
   ไม่มีแล้ว ต้องถามผู้ใช้ก่อนว่าจะ repoint ไป `online_shop.html` ทั้งหมดหรือหน้าไหน (ถามไปแล้วรอบหนึ่ง
   ยังไม่ได้คำตอบ — ยังไม่ได้ตรวจสอบซ้ำว่ายังเหลือกี่ไฟล์หลังงานปรับโครงสร้างเมนูรอบใหญ่ที่ผู้ใช้ทำเองนอก
   session)
4. **รัน `cms/fix-contact-us-mailto.sql`** ใน Supabase SQL Editor — งานค้างชิ้นเดียวที่เหลือจากรอบ
   Contact Us/เบอร์โทร ถ้าไม่รัน เมนู "ติดต่อเรา" ที่ header จะยังพาไปหน้า contact.html แทนที่จะเปิดอีเมล
5. **ถามผู้ใช้ให้ชัดเรื่องแถบ `.about-features`** ว่า "แยกออกจาก Hero Banner" หมายถึงเพิ่ม spacing หรือ
   ดึงเป็น section ใหม่ (คำถามเดิมถูก dismiss ไว้ ยังไม่มีคำตอบ)
6. **พิจารณาลบไฟล์ orphan**: `index1.html`, `our_service1.html`, `news-beanie-launch.html`/
   `news-kaset-fair.html`/`news-chinese-new-year.html` ที่ถูกแทนที่ด้วย news-detail.html แล้ว
7. **เพิ่ม `navRendered` event dispatch ใน products-render.js/news-render.js** — ตอนนี้การ์ดสินค้า/บทความ
   ที่ render ทีหลังด้วย JS ยังไม่ถูก i18n.js แปลภาษาซ้ำเวลาสลับ TH/EN (`page-render.js` ทำถูกแล้ว ใช้เป็น
   ตัวอย่าง pattern ได้)
8. **รวมเบอร์โทรให้เหลือเบอร์เดียว** ถ้าต้องการความสม่ำเสมอ (ตอนนี้มี 02-000-0000 กับ 02-003-3113
   ปนกันอยู่คนละจุดในเว็บ) — ต้องถามผู้ใช้ว่าเบอร์ไหนคือเบอร์จริงที่ควรใช้
9. **Deploy ขึ้นจริง** — ยังไม่มีการยืนยันว่า deploy ขึ้น Netlify (หรือที่อื่น) จริงหลังจากงานทั้งหมดนี้เสร็จ
   ถ้าจะ deploy ต้องเตรียม bundle ใหม่ให้ครบไฟล์ล่าสุดทั้งหมด (รวม CDN dependencies ของ Quill/DOMPurify
   ที่เพิ่งเพิ่มเข้ามา ต้องเช็คว่าโหลดจาก CDN ได้ปกติตอน production ด้วย)
10. **Template สำหรับหน้าใหม่** — ถ้าจะเพิ่มหน้าเว็บบ่อยๆ ในอนาคต ควรทำไฟล์ template กลาง (มี Hero Banner
    wiring ครบพร้อมใช้ + container ของ Page Management ในตัว) กันลืมต่อสายให้หน้าใหม่ทุกครั้ง ตอนนี้ยังต้อง
    copy-paste เองทุกครั้งสำหรับเพจที่ผูกเมนูจริง (`promo.html` แก้ปัญหานี้ให้หน้า standalone แล้วครบ 100%
    รวม Hero Banner ด้วย — ดูหัวข้อ "ระบบ Banner"; เมนูใหม่ที่ยังไม่มีไฟล์ `.html` จริงก็เปิดได้อัตโนมัติผ่าน
    `promo.html?slug=...` เหมือนกัน หลังแก้บั๊กใน `autoCreatePageForMenuItem()` — ดูหัวข้อ "ระบบเมนู")
