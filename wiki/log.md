# Log

บันทึกเหตุการณ์ตามลำดับเวลา แบบ append-only ห้ามแก้ไข/ลบ entry เก่า (ดูสเปกใน `CLAUDE.md` ข้อ 6)

Tip: `grep "^## \[" wiki/log.md | tail -5` เพื่อดู entry ล่าสุด

---

## [2026-07-17] setup | สร้างสคีมา Wiki เริ่มต้น
- สร้าง `CLAUDE.md`, `wiki/index.md`, `wiki/log.md`
- สร้างโฟลเดอร์ `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, `raw/assets/`

## [2026-07-17] ingest | เข้าสู่ระบบ (cpbf.co.th homepage)
- สร้าง [[เข้าสู่ระบบ]] ใน `wiki/sources/`
- ไม่มี entity/concept ใหม่ (เนื้อหาต้นฉบับเป็นแบนเนอร์รูปภาพ ไม่มี alt text ที่ระบุตัวตนได้)
- อัปเดต `wiki/index.md`

## [2026-07-17] ingest | Brief Redesign เว็บไซต์ cpbf.co.th
- บันทึกต้นฉบับ brief ที่ผู้ใช้ให้มาไว้ที่ `raw/Brief Redesign เว็บไซต์ cpbf.co.th.md`
- สร้าง [[Brief Redesign เว็บไซต์ cpbf.co.th]] ใน `wiki/sources/`
- สร้าง entity ใหม่ [[cpbf.co.th (บริษัท)]] — สายธุรกิจ/บริการ/สินค้า
- สร้าง concept ใหม่ [[โครงการ Redesign เว็บไซต์ cpbf.co.th]] — UI style guide, site map, e-commerce flow
- อัปเดตหน้าเดิม [[เข้าสู่ระบบ]] เพิ่มลิงก์ไปหน้าใหม่ทั้งสอง
- อัปเดต `wiki/index.md`

## [2026-07-17] query | wireframe หน้าแรก
- สร้าง mockup `design/homepage-wireframe.html` (static HTML, ไม่ใช่โค้ด production)
- บันทึกผลลัพธ์กลับเป็น concept ใหม่ [[Wireframe หน้าแรก (Redesign cpbf.co.th)]]
- อัปเดต [[โครงการ Redesign เว็บไซต์ cpbf.co.th]] ส่วนสถานะ
- อัปเดต `wiki/index.md`

## [2026-07-17] query | revise wireframe หน้าแรก (rev.1)
- แก้ไข `design/homepage-wireframe.html`: อัปเดตโลโก้ (ไอคอน+wordmark), อัปเดต hero banner (feature chips + product visual แทน blob/sticker เดิม), ลบตัวอักษรกำกับ a-e ออกจากทุก section, เพิ่มคำอธิบายเต็ม 200-500 ตัวอักษรให้ทั้ง 5 เมนู (เกี่ยวกับเรา/ธุรกิจของเรา/บริการของเรา/ช้อปสินค้า/ข่าวสารและกิจกรรม)
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] ตามการเปลี่ยนแปลง + flag ว่าข้อความ "เกี่ยวกับเรา" เป็นฉบับร่าง รอตรวจทาน

## [2026-07-17] ingest | Design Assets - Logo และ Hero Banner
- พบไฟล์ที่ผู้ใช้วางไว้ที่ `raw/assets/image/logo.webp` และ `raw/assets/image/Hero banner.png`
- สร้าง [[Design Assets - Logo และ Hero Banner]] ใน `wiki/sources/`
- **อัปเดต [[cpbf.co.th (บริษัท)]] — ยืนยันชื่อบริษัทจริงเป็น "CP B&F"** จากโลโก้ (แก้ข้อความ "ยังไม่ทราบชื่อเต็มบริษัท" เดิม)
- แก้ไข `design/homepage-wireframe.html` (rev.2): แทนที่โลโก้ placeholder ด้วย `logo.webp` จริง, แทนที่ visual วงกลมสินค้าด้วย `Hero banner.png` จริง (flag ว่าเป็นภาพสต็อก placeholder "BRAND")
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]], `wiki/index.md`

## [2026-07-17] ingest | CI Guideline และ Reference Design
- พบไฟล์ที่ผู้ใช้วางไว้ที่ `raw/assets/CI/` (ไฟล์ CI ทางการ: สี/โลโก้/ฟอนต์/VBL, จำนวนมากเป็น working file ภายใน) และ `raw/assets/ref/` (5 ภาพ mood/style reference)
- สร้าง [[CI Guideline และ Reference Design]] ใน `wiki/sources/` — สรุปสีทางการ (Digital/Print), โลโก้ทางการล่าสุด, ฟอนต์ทางการ (FC Gimmick/IBM Plex Sans Thai Looped/Bricolage Grotesque), ไอคอน "หยดน้ำ" ประจำแบรนด์, ยืนยันชื่อนิติบุคคลเต็มจาก certificate ฟอนต์; flag ว่า VBL Usage PDF (>100MB) และไฟล์ .ai/.psd ยังไม่ได้เปิดอ่าน
- **อัปเดต [[cpbf.co.th (บริษัท)]]** — ยืนยันชื่อนิติบุคคลเต็ม "บริษัท ซีพี บีแอนด์เอฟ (ไทยแลนด์) จำกัด (CP B&F (Thailand) Co., Ltd.)" และเพิ่มส่วน "Brand System ทางการ" (สี/โลโก้/ฟอนต์/shape)
- แก้ไข `design/homepage-wireframe.html` (rev.3): แทนที่ชุดสีสมมุติทั้งหมดด้วยสีทางการจาก CI, เปลี่ยนโลโก้เป็นไฟล์ทางการล่าสุด (`AW_CPB&F logo RGB updated_29-10-24.png`), เพิ่มฟอนต์ Bricolage Grotesque, ปรับทรงการ์ด/badge ให้ล้อไอคอน "หยดน้ำ", เปลี่ยน services section เป็น gradient navy-primary, เพิ่มชื่อนิติบุคคลเต็มใน footer
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (checklist + revision history), `wiki/index.md`

## [2026-07-17] query | revise wireframe หน้าแรก (rev.4 — layout ตาม ref)
- ผู้ใช้ feedback ว่า rev.3 ยังไม่ได้ redesign ตาม `raw/assets/ref/` จริงๆ (rev.3 ปรับแค่สี/โลโก้ ยัง layout เดิม) — เปิดอ่านภาพ ref ทั้ง 5 ซ้ำอย่างละเอียด พบจุดร่วม: bold display type, sticker/seal badge, doodle, tag pill, bento grid ไม่สมมาตร, dashed callout box, stats strip, CTA banner พื้นสีตันก่อน footer
- แก้ไข `design/homepage-wireframe.html` (rev.4): เพิ่ม tag pill + marker highlight + doodle + seal-badge ใน hero, เพิ่ม dashed-callout ใน about section, เปลี่ยนการ์ดธุรกิจจาก grid-4 เท่ากันเป็น bento grid ขนาดไม่เท่ากัน, เพิ่ม stats-strip 4 ช่องใน services, เพิ่ม mini-tag sticker บนการ์ดสินค้า, เพิ่ม CTA banner พื้นแดง+blob ก่อน footer
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "Layout/มู้ดตาม reference" + revision history), `wiki/index.md`
- หมายเหตุ: ลอง set up local static server ผ่าน `mcp__Claude_Preview` เพื่อ preview แต่ sandbox ไม่อนุญาต (`getcwd: Operation not permitted`); Chrome MCP tool ก็เปิด `file://` URL ไม่ได้ (auto-prepend `https://`) — ใช้ bash `open` เปิดไฟล์ในเบราว์เซอร์ default ของผู้ใช้แทน ใช้งานได้ปกติ

## [2026-07-17] query | redesign section เกี่ยวกับเรา (rev.5)
- ผู้ใช้ส่งภาพ ref ใหม่ (composite: IT-Kids photo panel + Solar Pop "what I do" icon row) สั่งให้ redesign section เกี่ยวกับเราตามภาพนี้ตรงๆ, ใช้ title/description ภาษาอังกฤษ, สี/ฟอนต์ตาม CI
- แก้ไข `design/homepage-wireframe.html` (rev.5): แทนที่ section เกี่ยวกับเราเดิม (ย่อหน้าไทย + dashed callout) ด้วย photo panel พื้นสี `var(--skyblue)` + blob ชมพู + รูป `Hero banner.png` + headline อังกฤษไฮไลต์แดง "FULL-SERVICE OEM PARTNER FOR FOOD & BEVERAGE BRANDS" + "what we do" icon row 4 ช่อง (วงกลมสีเหลือง/azure/แดง/เขียว) พร้อม divider และ SVG doodle ลูกศรโค้ง
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "About section rev.5" + flag ⚠️ ภาษาไม่สม่ำเสมอทั้งหน้า + checklist), `wiki/index.md`

## [2026-07-17] ingest | ข่าวและกิจกรรม - รูปภาพและเนื้อหาข่าว
- พบไฟล์ที่ผู้ใช้วางไว้ที่ `raw/assets/News/` (new1.jpeg, news2.jpeg, new3.jpeg) — รูปข่าว Beanie Coffee เปิดตัว / Beanie Coffee ที่งาน Kaset Fair / กิจกรรมตรุษจีน 2568
- บันทึกข้อความข่าว 3 รายการที่ผู้ใช้พิมพ์ส่งมาไว้ที่ `raw/News - เนื้อหาข่าว 3 รายการ (จากผู้ใช้).md`
- สร้าง [[ข่าวและกิจกรรม - รูปภาพและเนื้อหาข่าว]] ใน `wiki/sources/`
- อัปเดต [[cpbf.co.th (บริษัท)]] — เพิ่มแบรนด์ย่อย **Beanie Coffee** ใน § สินค้าที่วางขาย, เพิ่ม § บุคลากร ใหม่ (คุณสรรเสริญ สมัยสุต ประธานเจ้าหน้าที่บริหาร, ⚠️ ยังไม่ยืนยันขอบเขตตำแหน่ง)
- แก้ไข `design/homepage-wireframe.html` (rev.6): redesign section "ข่าวสารและกิจกรรม" ตาม ref ที่ผู้ใช้ส่ง — ลบ description ใต้หัวข้อ, เพิ่มปุ่ม "ดูทั้งหมด", แทนที่การ์ดตัวอย่างด้วยรูปข่าวจริง 3 ไฟล์ + เนื้อหาข่าวจริง (title/description ตามที่ผู้ใช้ให้มาคำต่อคำ), เพิ่ม CSS ตัด description 3 บรรทัดอัตโนมัติ (`-webkit-line-clamp`) ลงท้าย "...", เพิ่มปุ่ม "เพิ่มเติม" ต่อการ์ด
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "News section rev.6" + structure table + revision history + checklist), `wiki/index.md`

## [2026-07-17] query | ปรับสไตล์การ์ดข่าว (rev.6.1) ตามภาพ ref เพิ่มเติม
- ผู้ใช้ส่งภาพ ref เพิ่มเติม (การ์ดสไตล์ "What is going on with us" — รูป+กล่องคำบรรยายพื้นสีตัน โค้งมนต่อเนื่อง ไม่มีเส้นขอบ) สั่งให้อ้างอิง border ของรูป, border ของกล่องคำบรรยาย, และสีพื้นหลัง ตามภาพนี้
- แก้ไข `design/homepage-wireframe.html` (rev.6.1): เปลี่ยนการ์ดข่าวจากขอบหนา+hard-shadow (สไตล์ sticker เดิม) เป็นการ์ด flat color-block ไร้เส้นขอบ มุมโค้งต่อเนื่องระหว่างรูปกับกล่องคำบรรยาย, พื้นหลังสลับสีตัน CI (primary/แดง/เหลือง), ลบ tag badge NEWS/EVENT ออก, เปลี่ยนปุ่ม "เพิ่มเติม" เป็นลิงก์ขีดเส้นใต้
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มรายละเอียด rev.6.1 ในหัวข้อ "News section rev.6" + revision history)

## [2026-07-17] ingest | Shop Online - รายการสินค้า 5 รายการ
- บันทึกรายการสินค้าจริง 5 รายการที่ผู้ใช้พิมพ์ส่งมา (ชื่อ, URL บางรายการ, description, ราคา) ไว้ที่ `raw/Shop Online - รายการสินค้า 5 รายการ (จากผู้ใช้).md`
- สร้าง [[Shop Online - รายการสินค้า 5 รายการ]] ใน `wiki/sources/`
- อัปเดต [[cpbf.co.th (บริษัท)]] — เพิ่มตาราง "สินค้าจริงที่วางขาย" 5 SKU พร้อมราคาใน § สินค้าที่วางขาย
- ถามผู้ใช้ (AskUserQuestion) ว่าจะเลือก 4 จาก 5 สินค้าอย่างไรให้ตรงกับ "แสดง 4 รายการ" — ผู้ใช้ตอบ "default 4 product และรองรับการ slide เพื่อดูเพิ่มเติม"
- แก้ไข `design/homepage-wireframe.html` (rev.7): redesign section ช้อปสินค้าเป็น "SHOP ONLINE" — เปลี่ยนหัวข้อ (ตัดใหญ่กลางหน้า, ไม่มี description), แทนที่การ์ดหมวดหมู่ placeholder 7 ใบด้วยการ์ดสินค้าจริง 5 รายการ (ชื่อ/description ตัด 3 บรรทัด/ราคา/ปุ่ม "ดูเพิ่มเติม"+"เพิ่มลงตะกร้า"), เปลี่ยน `.shop-grid` เป็น slider เลื่อนดู (scroll-snap, เห็น 4 ใบพร้อมกัน) พร้อมปุ่มลูกศร prev/next, การ์ดสไตล์ soft-tint + category pill ล้อ CSS reference ที่ผู้ใช้ส่งมา (ตัดองค์ประกอบเฉพาะแบรนด์ต้นแบบ เช่น รูปทรงถ้วย/sparkle ออก) — ⚠️ ยังไม่มีรูปสินค้าจริง ใช้ emoji placeholder เหมือนเดิม
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "Shop section rev.7" + structure table + revision history + checklist), `wiki/index.md`

## [2026-07-17] ingest | Our Services - เนื้อหาบริการ 4 รายการ
- บันทึกเนื้อหาบริการเต็ม 4 รายการที่ผู้ใช้พิมพ์ส่งมา ไว้ที่ `raw/Our Services - เนื้อหาบริการ 4 รายการ (จากผู้ใช้).md`
- สร้าง [[Our Services - เนื้อหาบริการ 4 รายการ]] ใน `wiki/sources/`
- อัปเดต [[cpbf.co.th (บริษัท)]] § บริการ — ขยายเป็นคำอธิบายเต็ม, ปรับชื่อ "OEM เมล็ดกาแฟ"→"Coffee Roasting Service" และ "OEM เครื่องดื่ม"→"บริการผลิตเครื่องดื่มครบวงจร" (ไม่ใช่ความขัดแย้ง เป็นรายละเอียดเพิ่มของบริการเดิม)
- แก้ไข `design/homepage-wireframe.html` (rev.8): redesign section บริการของเราเป็น "Our Services" — เปลี่ยนหัวข้อ (ตัดใหญ่ uppercase, ไม่มี description), เปลี่ยนพื้นหลัง section จาก dark gradient เป็นพื้นอ่อน, แทนที่การ์ด pill เล็ก 4 ใบด้วยการ์ดใหญ่พื้น primary ตัน (min-height 320px) จัดวางแบบ stagger เอียง/เลื่อนสลับพร้อมชื่อ+คำอธิบายเต็ม, ปรับ stats-strip เดิมให้ contrast กับพื้นอ่อน, เพิ่ม responsive breakpoint 1023px/767px (breakpoint ชุดแรกในไฟล์ทั้งหมด) ตาม CSS reference ที่ผู้ใช้ส่งมา
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "Services section rev.8" + structure table + revision history), `wiki/index.md`

## [2026-07-17] ingest | style.css - Global Style Variables
- บันทึก CSS global ที่ผู้ใช้ส่งมาพร้อมคำสั่ง "create body style.css ของเว็บไซต์" ไว้ที่ `raw/style.css - Global Style Variables (จากผู้ใช้).md`
- สร้างไฟล์จริง `design/style.css` (ตัวแปรสี `:root`, `body` พื้นฐาน, utility class `.web-title`/`.web-description`/`.highlight-text`, ปุ่ม `.btn-primary`/`.btn-accent`) ตามเนื้อหาที่ผู้ใช้ให้มา verbatim
- สร้าง [[style.css - Global Style Variables]] ใน `wiki/sources/`
- ⚠️ พบสีขัดแย้งกับ CI ทางการ: `--primary-color:#135AF7` คือสี placeholder เดิมที่ถูกแทนที่ด้วย CI ทางการ `#1B5EF9` ไปแล้วตั้งแต่ rev.3, และ `--accent-pink:#E91E63`/`--vibrant-yellow:#FFFDE7` ไม่มีอยู่ใน CI palette ทางการ — แจ้งผู้ใช้แล้ว, ยังไม่ผูกไฟล์นี้เข้ากับ `design/homepage-wireframe.html`
- อัปเดต [[cpbf.co.th (บริษัท)]] § Brand System ทางการ (เพิ่มหมายเหตุ ⚠️), [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "style.css — ไฟล์ global stylesheet แยกต่างหาก"), `wiki/index.md`

## [2026-07-17] query | ยืนยันทิศทางสี style.css + ผูกเข้ากับ mockup (rev.9)
- ถามผู้ใช้ (AskUserQuestion) ว่าต้องการแก้สีใน `design/style.css` ให้ตรงกับ CI ทางการหรือไม่ — ผู้ใช้ตอบ **"เก็บสีเดิมไว้ตามที่ส่งมา"** (ยืนยันว่า `#135AF7`/`#E91E63`/`#FFFDE7` เป็นทิศทางสีใหม่ที่ตั้งใจ ไม่ใช่ CI ทางการ)
- ตรวจสอบไม่พบชื่อ class ชนกัน (`.btn-primary`, `.btn-accent`, `.web-title`, `.web-description`, `.highlight-text`) และไม่มีตัวแปร CSS ชนกัน (`--primary-color` ของ style.css คนละชื่อกับ `--primary` ที่ใช้อยู่เดิม)
- แก้ไข `design/homepage-wireframe.html` (rev.9): เพิ่ม `<link rel="stylesheet" href="style.css">` ใน `<head>` ก่อนบล็อก `<style>` เดิม (inline style เดิมยัง override ได้ตาม cascade รูปลักษณ์หน้าเดิมไม่เปลี่ยน)
- อัปเดต [[cpbf.co.th (บริษัท)]] § Brand System ทางการ (ปรับหมายเหตุ ⚠️ ให้สะท้อนว่าผู้ใช้ยืนยันแล้ว), [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (อัปเดตหัวข้อ style.css + revision history rev.9), `wiki/index.md`

## [2026-07-17] ingest | News & Contact Section - HTML+CSS (rev.10)
- บันทึกต้นฉบับ HTML+CSS ที่ผู้ใช้ส่งมาสำหรับ section "News & Event" (redesign) และ "Contact Us" (ใหม่) ไว้ที่ `raw/News & Contact Section - HTML+CSS (จากผู้ใช้).md`
- สร้าง [[News & Contact Section - HTML+CSS]] ใน `wiki/sources/` — สรุปเนื้อหาต้นฉบับ + จุดที่ต้องปรับก่อนใช้งานจริง
- รวม CSS token/reset/component ชุดใหม่จากผู้ใช้เข้า `design/style.css` (ขยายจาก rev.9) — เก็บ `.highlight-text` เดิมไว้เพราะไม่มีในชุดใหม่
- แก้ไข `design/homepage-wireframe.html` (rev.10): ลบ CSS เดิมของ News section ออกจาก inline `<style>` (ชื่อ class `.news-grid`/`.news-card` ชนกับของใหม่ใน style.css), redesign section ข่าวสารและกิจกรรมทั้งหมดด้วยโครงสร้าง BEM ใหม่ — **แทนเนื้อหาข่าว placeholder ที่ผู้ใช้ส่งมาด้วยเนื้อหาข่าวจริงเดิม 3 รายการ** (Beanie Coffee เปิดตัว / Kaset Fair / ตรุษจีน 2568) เพราะมีข้อมูลจริงอยู่แล้วในระบบ ไม่ใช้ placeholder ทับ, เพิ่ม section ใหม่ "Contact Us" ก่อน `<footer>` (คง `.cta-banner` เดิมจาก rev.4 ไว้ด้วย) — เปลี่ยน Website เป็นโดเมนจริง `www.cpbf.co.th` (Email/เบอร์โทร/ที่อยู่ยังเป็น placeholder เพราะไม่มีข้อมูลจริงในระบบ), เปลี่ยน route ลิงก์สมมุติเป็น anchor ภายในหน้า
- อัปเดต [[cpbf.co.th (บริษัท)]] (เพิ่ม § ข้อมูลติดต่อ ⚠️ ยังเป็น placeholder), [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] (เพิ่มหัวข้อ "News & Contact section rev.10" + structure table + revision history + checklist ใหม่ 4 ข้อ), `wiki/index.md`
- ⚠️ ประเด็นที่ยังไม่ได้ถามผู้ใช้ตรงๆ: การแทนข่าว placeholder ด้วยข่าวจริง, การเปลี่ยน Website เป็นโดเมนจริง, และตอนนี้มี CTA ซ้อนกัน 2 อัน (`.cta-banner` + `.contact-section`) — บันทึกไว้ใน checklist รอผู้ใช้ยืนยัน

## [2026-07-17] ingest | Our Business Section - HTML+CSS (rev.11)
- บันทึกต้นฉบับคำสั่งลบ section "ธุรกิจของเรา" + ปรับ section "Our Services" ที่ผู้ใช้ส่งมาไว้ที่ `raw/Our Business Section - HTML+CSS (จากผู้ใช้).md`
- สร้าง [[Our Business Section - HTML+CSS]] ใน `wiki/sources/` สรุปเนื้อหาและจุดตัดสินใจปรับก่อนใช้งานจริง
- แก้ไข `design/homepage-wireframe.html` (rev.11): ลบ section "ธุรกิจของเรา" (`id="business"`, bento grid) ทั้งหมด, แทนที่ section "Our Services" (`id="services"`) ด้วย section ใหม่ "Our Business" (`id="our-business"`) — ยุบรวม 2 section เดิมเป็น 1 section เดียว ใช้เนื้อหาบริการจริงเดิม 4 รายการจาก [[Our Services - เนื้อหาบริการ 4 รายการ]], ลบ CSS เดิม (`.bento`/`.bento-card`/`.service-card`/`.stats-strip`) ออกจาก inline `<style>`, รวม nav link `#business`/`#services` เหลือ `#our-business` รายการเดียว
- เพิ่ม "Section 8: Our Business" ใน `design/style.css` (`.business-section`/`.business-grid`/`.business-card__*`) โดยไม่ overwrite utility class ที่มีอยู่แล้ว (`.web-title`/`.web-description`/`.btn-primary`/`.btn-accent`/`:root` tokens)
- อัปเดต [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] § rev.11, structure table, checklist, ประวัติการแก้ไข
- ⚠️ ประเด็นที่ยังไม่ได้ถามผู้ใช้ตรงๆ: การตีความว่า "ปรับ Our Services" หมายถึงยุบรวมกับ "ธุรกิจของเรา" เป็น section เดียว, การตัด `.stats-strip` (4 สถิติ) ทิ้งไปพร้อมกัน

## [2026-07-17] ingest | About Us Section - HTML+CSS (rev.12)
- สร้าง `raw/About Us Section - HTML+CSS (จากผู้ใช้).md` — บันทึกคำสั่งผู้ใช้ "เปลี่ยน section about เป็นตามนี้" พร้อม markup HTML+CSS เต็ม
- สร้าง `wiki/sources/About Us Section - HTML+CSS.md` — สรุปเนื้อหา + 7 จุดที่ต้องปรับก่อนใช้งานจริง
- แก้ไข `design/homepage-wireframe.html` — ลบ section "เกี่ยวกับเรา" เดิม (rev.5: photo panel + what-we-do row) ทั้งหมด แทนที่ด้วย section ใหม่ `.about-section`/`.about-card` (`id="about-us"`), ลบ inline CSS เก่า (`.about-panel`/`.about-photo`/`.about-copy`/`.whatwedo-row`/`.whatwedo-item`/`.circle-badge`) เหลือ comment อ้างอิง, อัปเดต nav link `#about` → `#about-us`
- แก้ไข `design/style.css` — เพิ่ม token ใหม่ (`--about-container-width`, `--about-card-radius`, `--about-shadow`) และ "Section 9: About Us" CSS component เต็ม (ไม่ overwrite `.web-title`/`.web-description`/tokens เดิม), เพิ่ม `.about-card` เข้า reduced-motion block
- อัปเดต `wiki/entities/cpbf.co.th (บริษัท).md` — เพิ่ม § ประวัติ (ก่อตั้งปี 2016, เครือเจริญโภคภัณฑ์ ⚠️ ยังไม่มี source อื่นยืนยันซ้ำ), เพิ่ม sources อ้างอิง
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` — แก้ตาราง structure แถว "เกี่ยวกับเรา" เป็น "About Us (redesign, rev.12)", เพิ่ม § "About Us section rev.12", flag ⚠️ ใน § rev.5 เดิมว่าถูกแทนที่แล้ว, เพิ่ม checklist 2 ข้อใหม่ (ยืนยันข้อมูลปีก่อตั้ง/เครือ CP, สีของ section About Us เปลี่ยนจาก CI), เพิ่ม revision history
- อัปเดต `wiki/index.md` — เพิ่ม entry source ใหม่, อัปเดต entry entity + concept
- ตรวจสอบโครงสร้างด้วย Python script: `<section>`/`</section>` สมดุล (7/7), CSS brace สมดุล, ไม่มี class เก่าตกค้าง (`about-panel`/`about-photo`/`about-copy`/`whatwedo-row`/`whatwedo-item`/`circle-badge` = 0)
- ⚠️ ประเด็นที่ยังไม่ได้ถามผู้ใช้ตรงๆ: (1) ข้อมูลปีก่อตั้ง 2016/เครือเจริญโภคภัณฑ์ยังไม่มี source อื่นยืนยันซ้ำ (2) การเปลี่ยนสี section About Us จาก CI ทางการเป็นชุดสี `design/style.css` ทำให้ต่างจาก hero/footer ที่ยังใช้ CI

## [2026-07-18] ingest | About Us Section - ปรับตาม screenshot จริง (rev.12 follow-up)
- ผู้ใช้ส่ง screenshot ของ section About Us ที่ render จริง (ไม่มี highlights grid) พร้อมสั่ง "ปรับให้เป็นแบบนี้และเพิ่มปุ่ม 'อ่านเพิ่มเติม' สี #e91e63"
- แก้ไข `design/homepage-wireframe.html` — ลบ `.about-card__highlights` (3 สถิติ: 2016/CP/F&B) ออกจาก markup, เพิ่มปุ่ม `<a class="btn-accent about-card__button">อ่านเพิ่มเติม</a>` แทนที่
- แก้ไข `design/style.css` — ลบ CSS `.about-card__highlights`/`.about-highlight__*` และ responsive override ที่เกี่ยวข้องออกทั้งหมด, เพิ่ม `.about-card__button { margin-top: 8px; }`, ขยาย `.about-card__content` เป็น `max-width: 100%` ให้ตรงกับสัดส่วนข้อความในภาพ — ใช้ `.btn-accent` ที่มีอยู่แล้ว (สี `var(--accent-pink)` = `#e91e63` ตรงกับที่ผู้ใช้ระบุ) แทนการสร้าง class สีใหม่
- ตรวจสอบโครงสร้างด้วย Python script: section/brace สมดุล, ไม่มี `about-highlight` เหลือค้างทั้ง HTML และ CSS
- อัปเดต `wiki/sources/About Us Section - HTML+CSS.md`, `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (§ ตาราง + § rev.12), `wiki/index.md`

## [2026-07-18] ingest | Online Shop Section - HTML+CSS (rev.13)
- สร้าง `raw/Online Shop Section - HTML+CSS (จากผู้ใช้).md`
- สร้าง `wiki/sources/Online Shop Section - HTML+CSS.md`
- แก้ไข `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` — เพิ่ม § Online Shop section rev.13, อัปเดตตารางโครงสร้างหน้า, flag rev.7 เดิมว่าถูกแทนที่แล้ว, เพิ่ม checklist 2 ข้อ, เพิ่ม revision history
- แก้ไข `design/homepage-wireframe.html` — แทนที่ section "SHOP ONLINE" slider เดิม (rev.7) ด้วย `.shop-section`/`.shop-grid`/`.shop-card` (`id="online-shop"`), title เปลี่ยนเป็น "Online shop", ใช้สินค้าจริง 5 SKU เดิมจาก [[Shop Online - รายการสินค้า 5 รายการ]], อัปเดต nav link `#shop` → `#online-shop`, ลบ inline CSS เดิมของ section นี้
- แก้ไข `design/style.css` — เพิ่ม "Section 10: Online Shop" (ไม่ overwrite utility class/token ที่มีอยู่แล้ว), เพิ่ม `.shop-card` เข้า reduced-motion block
- อัปเดต `wiki/index.md`

## [2026-07-18] ingest | Online Shop Section — ปรับเพิ่ม slider (rev.13 follow-up)
- ผู้ใช้ขอเพิ่ม "ขอเป็น default 4 และ slide เหมือนเดิม" หลัง rev.13 (ที่เพิ่งเปลี่ยนเป็น card-grid แสดงสินค้าทั้ง 5 พร้อมกัน)
- แก้ `design/homepage-wireframe.html` และ `design/style.css`: ครอบ `.shop-grid` ด้วย `.shop-section__slider` + ปุ่ม `.shop-nav.prev`/`.shop-nav.next` (scrollBy, id="shopGrid"), เปลี่ยน `.shop-grid` เป็น scroll-snap slider (แสดง 4 การ์ด เลื่อนดูใบที่ 5 ได้) — คงดีไซน์การ์ดใหม่ของ rev.13 ไว้ทั้งหมด
- อัปเดต `wiki/sources/Online Shop Section - HTML+CSS.md`, `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, rev.13 section, revision history), `wiki/index.md`

## [2026-07-18] ingest | Hero Banner Section - HTML+CSS (rev.14)
- สร้าง `raw/Hero Banner Section - HTML+CSS (จากผู้ใช้).md`
- สร้าง `wiki/sources/Hero Banner Section - HTML+CSS.md`
- แก้ไข `design/homepage-wireframe.html` — ลบ section hero เดิม (rev.1-4, พื้นน้ำเงิน + blob/sticker/float-chip collage) ทิ้งทั้งหมด แทนที่ด้วย section ใหม่ `.hero-section` (`id="home"` เปลี่ยนจาก `id="hero"` เดิม) — eyebrow, h1 "Crafted for every business", description ไทย, ปุ่ม "ดูบริการของเรา"/"ติดต่อเรา", polaroid gallery 4 รูปจริง `hero-business-01.png`-`04.png` (มีอยู่แล้วใน `raw/assets/image/`, ไม่ต้องใช้ placeholder) แก้ path เป็น `../raw/assets/image/...` ให้ตรงกับที่ใช้จริง, ลบ CSS เดิมเฉพาะที่ hero ใช้คนเดียว (`.hero-art`/`.blob`/`.sticker`/`.hero-features`/`.product-stack`/`.hero-banner-img`/`.float-chip`/`.tag-pill`/`.seal-badge`/`.marker`/`.btn-outline`) แต่คง `.btn-solid`/`.doodle` ไว้เพราะยังใช้ใน `.cta-banner` ท้ายหน้า
- แก้ไข `design/style.css` — เพิ่ม token ใหม่ที่ไม่ซ้ำ (`--hero-container-width`, `--hero-shadow`) และ "Section 11: Hero Banner" CSS component เต็ม (ไม่ overwrite `:root` tokens/Base reset/`.btn-primary`/`.btn-accent` เดิม), เพิ่ม `.hero-photo` เข้า reduced-motion block
- ตรวจสอบโครงสร้างด้วย Python script: section/article/div/button/figure/header/css brace สมดุลทั้งหมด, ไม่มี class เก่าตกค้าง
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, § rev.14, checklist สีไม่สม่ำเสมอ, revision history, frontmatter sources), `wiki/index.md`

## [2026-07-20] query | ปรับ Header Menu bar (rev.15)
- ผู้ใช้สั่งผ่านแชท 6 ข้อ (ไม่มี markup แนบมา): ปรับรายการเมนู 5 รายการ (เกี่ยวกับเรา/ธุรกิจของเรา/บริการของเรา/ช้อปปิ้งออนไลน์/ข่าวสารและกิจกรรม), เมนูชิดขวา, โลโก้ซ้าย, ไอคอน Login/Shopping cart/Translate language (default TH), navbar transparent วางทับ bg ของ section แรก
- แก้ `design/homepage-wireframe.html` — ลบ header เดิม (พื้นขาว, sticky, ปุ่มข้อความ) ทั้งหมด แทนที่ด้วย `.site-header` ใหม่ (โลโก้ซ้าย/เมนู 5 รายการขวา/ไอคอน 3 อัน) — ⚠️ "ธุรกิจของเรา"+"บริการของเรา" ชี้ไป `#our-business` เดียวกันเพราะถูกยุบรวมไปแล้วตั้งแต่ rev.11
- แก้ `design/style.css` — เพิ่ม "Section 12: Header / Navbar" ท้ายไฟล์ก่อน Reduced Motion block, เปลี่ยน header จาก `position:sticky` เป็น `position:absolute` transparent overlay ทับเฉพาะ Hero Banner section แรก (⚠️ ไม่ค้างบนสุดตลอดการ scroll อีกต่อไป), สีตัวอักษร/ไอคอนขาว (`--font-light`) reuse token เดิมทั้งหมด ไม่เพิ่ม token ใหม่
- ตรวจสอบโครงสร้างด้วย Python script: section/header/nav/ul/li/div/button/a/figure สมดุลทั้งหมด, css brace สมดุล (295/295), ไม่มี class เก่า (`nav-cta`/`cart-btn`/`login-btn`) หลงเหลือในโค้ดจริง
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, § Header/Navbar rev.15, checklist สีไม่สม่ำเสมอ + 3 ข้อใหม่, revision history, frontmatter), `wiki/index.md`
- ⚠️ ประเด็นที่ยังไม่ได้ถามผู้ใช้ตรงๆ: (1) เมนู "ธุรกิจของเรา"/"บริการของเรา" ชี้ anchor เดียวกัน (2) header ไม่ sticky ตลอดหน้าอีกต่อไป หลัง scroll ผ่าน hero จะไม่มี nav bar ค้าง (3) ไอคอน login/cart/language เป็น static placeholder ไม่มีฟังก์ชันจริง

## [2026-07-20] query | ปรับพื้นหลัง Header + ขยายโลโก้ (rev.15.1)
- ผู้ใช้ขอผ่านแชท: "เพิ่ม BG #ffffff ให้ Header และขยายขนาด[ข้อความท้ายอ่านไม่ออก]" — ใช้ AskUserQuestion ถามยืนยันสิ่งที่ต้องขยาย (โลโก้/เมนู/ทั้ง header) ผู้ใช้ตอบ "โลโก้"
- แก้ `design/style.css` § Section 12 (Header/Navbar): `.site-header` background เปลี่ยนจาก `transparent` เป็น `var(--bg-main)` (reuse token เดิม), `.site-header__logo img` ขยายจาก 40px เป็น 56px, `.site-header__nav a`/`.site-header__icon-btn` สีตัวอักษร/ไอคอน/border เปลี่ยนจาก `--font-light` (ขาว) เป็น `--font-title` (เข้ม) พร้อม hover state ใหม่ (necessary consequence ของพื้นขาว ไม่ใช่ scope creep)
- ผลข้างเคียง: `.hero-section` padding-top ขยายจาก 76px เป็น 96px กัน header ที่สูงขึ้น (จากโลโก้ใหญ่ขึ้น) ทับ eyebrow/h1 ของ hero
- ตรวจสอบโครงสร้างด้วย Python script: css brace สมดุล (295/295)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, section body, revision history), `wiki/index.md`

## [2026-07-20] query | ปรับ Hero Banner: ตัด border/eyebrow/ปุ่ม, เปลี่ยนเป็นแบนเนอร์เดียว (rev.16)
- ผู้ใช้สั่งผ่านแชท พร้อมแนบภาพ "Thai Specialty Coffee" banner (แบรนด์ "ATO Chiang Rai"): ไม่ต้องมี border ของ section, ไม่ต้องมีข้อความ "CP B&F Company Limited", ไม่ต้องมีปุ่ม "ดูบริการของเรา"/"ติดต่อเรา", ลบ 4 รูปภาพเดิมออกแล้วใส่แบนเนอร์ภาพนี้แทน
- ไม่มี path ไฟล์ภาพในแชท จึงถามผู้ใช้ก่อน — ผู้ใช้ระบุ path `raw/assets/image/hero-business.png` (ไฟล์มีอยู่แล้วในเครื่อง ตรวจสอบแล้วตรงกับภาพที่แนบมา)
- แก้ `design/homepage-wireframe.html` — ลบ `.hero-section__eyebrow`, `.hero-section__actions` (ปุ่ม 2 อัน), `.hero-gallery` (polaroid 4 รูป) ออกจาก `.hero-section`, แทนที่ด้วย `.hero-banner` แบนเนอร์ภาพเดียว
- แก้ `design/style.css` — ลบ `.hero-section::before` (inset border), `.hero-section__eyebrow`, `.hero-section__actions`, `.hero-gallery`/`.hero-photo*` (รวม responsive breakpoints 1100px/767px/390px และ reduced-motion block) ออกทั้งหมด เพิ่ม `.hero-banner`/`.hero-banner__image` ใหม่ (reuse `--hero-shadow` token เดิม)
- ตรวจสอบโครงสร้างด้วย Python script: HTML tag สมดุลทุกตัว, CSS brace สมดุล (268/268)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, section body ใหม่, checklist, revision history), `wiki/index.md`
- ⚠️ ภาพแบนเนอร์ที่ใช้เป็นสื่อโปรโมทสินค้าของแบรนด์อื่น ("ATO Chiang Rai") ไม่ใช่เนื้อหาของ CP B&F เอง ยังไม่ยืนยันว่าเป็นภาพชั่วคราวหรือถาวร

## [2026-07-20] query | แยกสลาย Hero Banner เป็น layer พร้อม parallax animation (rev.17)
- ผู้ใช้สั่งผ่านแชท อ้างอิงภาพ `raw/assets/image/hero-business.png` (จาก rev.16) เป็น "ref" ให้แยกสลาย asset ข้อความ/รูปภาพออกจากกัน มี animation ขยับได้ ใช้รูปสินค้าไดคัท `raw/assets/image/New Project.png`, ระบุ BG `#1B5RF0` (hex ไม่ถูกต้อง)
- ถาม AskUserQuestion 2 ข้อ: (1) สี BG ที่ถูกต้อง — ผู้ใช้เลือก `#1B5EF9` (2) รูปแบบ animation — ผู้ใช้เลือก "Parallax ตาม mouse/scroll"
- ตรวจสอบ `New Project.png` ด้วย `file`/`sips` (PIL ไม่มีในเครื่อง): 325×544 RGBA มี alpha channel จริง = ไดคัทจริง
- แก้ `design/homepage-wireframe.html`: ยุบ `.hero-banner` ออก แทนที่ด้วย `.hero-showcase` (index/caption/title/description/badges/product/features แยก element, ใส่ `data-depth` แต่ละตัว), เพิ่ม `<script>` parallax ก่อน `</body>` (script แรกในไฟล์นี้ — mousemove/scroll ภายใน `[data-hero-parallax]`, เคารพ `prefers-reduced-motion`)
- แก้ `design/style.css`: เปลี่ยน `.hero-section` background เป็น `var(--primary)` (reuse token CI เดิมที่มีอยู่แล้วใน inline `<style>`, ตรงกับสีที่ผู้ใช้เลือกเป๊ะ), ลบ `.hero-section__header`/`__title`/`__description`/`.hero-banner`/`.hero-banner__image` (rev.16) ออก, เพิ่มระบบ `.hero-showcase` CSS ใหม่ทั้งหมด, เพิ่ม `transition: transform` บน `[data-depth]` ให้ parallax smooth, อัปเดต responsive breakpoints (1100/767/390px) ให้ตรงกับ class ใหม่
- ตรวจสอบด้วย Python script: CSS brace สมดุล (293/293), HTML tag สมดุลทุกตัว (รวม script/ul/li ใหม่); grep ยืนยันไม่มี class เดิมค้าง
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, section body ใหม่, checklist, revision history), `wiki/index.md`
- ⚠️ เนื้อหายังเป็นสื่อโปรโมทแบรนด์ "ATO Chiang Rai" เหมือนเดิม (แค่เปลี่ยนวิธีนำเสนอ), ⚠️ ไม่ได้ทำกราฟิกเจดีย์/วัดจากภาพ ref เพราะไม่มี asset แยก, ⚠️ นี่คือ JS ตัวแรกที่เพิ่มเข้าไฟล์ mockup (เดิม static ทั้งหมด)

## [2026-07-20] query | จัดตำแหน่ง/ขนาด font Hero Banner ให้ตรงกับภาพ ref 100% (rev.18)
- ผู้ใช้สั่งผ่านแชท: "Lay out ขนาด font ตำแหน่งการจัดวางต่าง ๆ ต้องตรงกับตัวอย่างนี้ raw/assets/image/hero-business.png 100%"
- ไม่มี ImageMagick ในเครื่อง จึงติดตั้ง `pillow`+`numpy` ผ่าน `pip3` แล้ววิเคราะห์พิกเซลของภาพ (ยืนยันขนาดจริง 1376×702px ด้วย `sips`) — background-diff mask + row/column band detection สกัดพิกัด % ของทุก element (title/index/caption/description/badges/product/features) พร้อม crop ภาพขยายตรวจด้วยตาอีกชั้น (พบว่าตำแหน่ง "02" ที่ตีความไว้ผิดใน rev.17 จริงๆ อยู่กึ่งกลางแนวตั้งกับ "COFFEE" ไม่ใช่ใกล้ caption)
- แก้ `design/homepage-wireframe.html`: ลบ `.hero-decoration` 4 ชิ้น (dot/pill จาก rev.1-4 เดิม, ไม่มีในภาพ ref), ลบ wrapper div `__top`/`__main`/`__copy`/`__visual` ของ `.hero-showcase` ทำให้ elements เป็น child ตรงเพื่อ absolute positioning (คง `data-depth` เดิมทุกตัว)
- แก้ `design/style.css`: เปลี่ยน `.hero-showcase` จาก flexbox เป็น `position:relative` + `aspect-ratio:1376/702` + `container-type:inline-size`, วาง element ย่อยด้วย `position:absolute` (%) ตามพิกัดที่วัดได้, font-size ใช้ `clamp()`+หน่วย `cqw` ให้สเกลตามความกว้าง container, title `z-index:1` อยู่หลังรูปสินค้า `z-index:2` ให้ตรงกับภาพ ref, ลบ `.hero-decoration*` CSS block, ลดรูป media query (1100px/767px) เหลือปรับ padding เท่านั้น
- ตรวจสอบด้วย Python script: CSS brace สมดุล (267/267), HTML tag สมดุลทุกตัว, grep ยืนยันไม่มี class เดิมค้าง
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, § Hero Banner rev.18, checklist 2 ข้อใหม่, revision history), `wiki/index.md`
- ⚠️ ไม่สามารถตรวจสอบด้วยเบราว์เซอร์จริงได้ (Claude in Chrome ไม่เชื่อมต่อในรอบนี้) — ตรวจได้แค่ระดับโครงสร้าง แนะนำผู้ใช้เปิดไฟล์ดูด้วยตาเพื่อยืนยัน, ⚠️ ไม่ได้ทำลวดลายขอบล่าง/กราฟิกเจดีย์เหมือนเดิม, เนื้อหายังเป็นสื่อโปรโมทแบรนด์ "ATO Chiang Rai" เหมือนเดิม

## [2026-07-20] query | ลดขนาด + จัดกึ่งกลางรูปสินค้าใน Hero Banner (rev.18.1)
- ผู้ใช้สั่งผ่านแชท: "ต้องลดขนาดถุงกาแฟลงเพื่อไม่ให้ทับ asset ข้อความด้านล่าง และขยับให้ถุงกาแฟอยู่กลางหน้าจอ"
- แก้ `design/style.css` § `.hero-showcase__product`: ลด `width:36%`→`26%`, `top:8%`→`9%` — คำนวณความสูงจริงจากอัตราส่วนภาพ `New Project.png` (325×544, h/w≈1.674) ได้ขอบล่างรูปใหม่ที่ y≈52.5% ซึ่งอยู่เหนือ `.hero-showcase__description` (เริ่ม y=55%) มีระยะห่างกันชน ~2.5% และไม่ชน `.hero-showcase__badges` (เริ่ม x=70%, ขอบขวารูปใหม่ x=63%)
- จัดกึ่งกลางแนวนอนด้วย `left:37%` (= `50% - width/2`) แทนการใช้ `left:50%; transform:translateX(-50%)` เพราะ element นี้มี `data-depth="0.6"` — parallax JS จาก rev.17 จะ `element.style.transform = translate3d(...)` ทับ inline transform ทุกครั้งที่ mousemove/scroll ถ้าใช้ transform สำหรับ centering จะถูกล้างหายระหว่างขยับเมาส์ จึงใช้ percentage-based `left` แทนเพื่อไม่ให้ขัดกับ parallax (⚠️ `transform:rotate(-2deg)` เดิมยังมีปัญหานี้อยู่ก่อนแล้วตั้งแต่ rev.17 — ไม่ใช่ regression ใหม่ ยังไม่ได้แก้)
- ตรวจสอบด้วย Python script: CSS brace สมดุล (267/267)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (§ Hero Banner rev.18 เพิ่ม follow-up rev.18.1, revision history)

## [2026-07-20] query | เพิ่ม slider หลายแบนเนอร์ใน Hero Banner (rev.19)
- ผู้ใช้สั่งผ่านแชท: "แบนเนอร์ section แรกลองรับการแสดงหลายแบนเนอร์ ต้องสามารถเลื่อนได้ ช่วยเพิ่มแบนเนอร์รูปแบบเดียวกันกับภาพปัจจุบัน ใช้ asset ข้อความเดียวกันก่อนได้เลยแต่เปลี่ยนภาพ ถุงกาแฟเป็นภาพนี้ raw/assets/image/New Project.png และเปลี่ยนจาก 02 เป็น 01"
- ตีความ: `New Project.png` คือรูปสินค้าที่ `.hero-showcase__product` ใช้อยู่แล้ว (ตั้งแต่ rev.17) จึงหมายถึงใช้เนื้อหา/รูปเดิมซ้ำเป็น placeholder ของแบนเนอร์ใหม่ชั่วคราว ตัวแปรหลักคือลำดับ index number (01 ใหม่ก่อน, 02 เดิมขยับเป็นลำดับสอง)
- แก้ `design/homepage-wireframe.html`: ห่อ `.hero-showcase` ด้วย `.hero-slider`/`.hero-slider__track` (`id="heroSliderTrack"`)/`.hero-slider__slide` (ล้อแพทเทิร์น `.shop-section__slider`/`.shop-grid` เดิมจาก rev.13), เพิ่ม slide ใหม่ลำดับแรก (index "01", เนื้อหา/รูปเหมือน slide เดิมทุกอย่าง), slide เดิมขยับเป็นลำดับสอง (index "02"), เพิ่มปุ่ม `.hero-slider__nav--prev`/`--next` ใช้ `scrollBy({left:±track.clientWidth})`
- แก้ parallax `<script>` (rev.17): เปลี่ยนจาก `document.querySelector('[data-hero-parallax]')` (ตัวเดียว) เป็น `document.querySelectorAll(...)` + `forEach` ตั้ง mousemove/mouseleave/scroll listener แยกอิสระทุก stage — ป้องกันปัญหา parallax ทำงานเฉพาะ slide แรกเท่านั้น
- แก้ `design/style.css`: เพิ่ม `.hero-slider`/`.hero-slider__track`/`.hero-slider__slide`/`.hero-slider__nav*` (scroll-snap, ปุ่มกลม 44px คล้าย `.shop-nav`) ก่อนบล็อก `.hero-showcase` เดิม
- ตรวจสอบด้วย Python script: CSS brace สมดุล (275/275), HTML tag สมดุลทุกตัว (`html.parser` stack-based ตรวจ mismatch/unclosed — ไม่พบปัญหา)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (structure table, § Hero Banner rev.19 ใหม่, checklist 3 ข้อใหม่, revision history), `wiki/index.md`
- ⚠️ ไม่สามารถตรวจสอบด้วยเบราว์เซอร์จริงได้ (Claude in Chrome ไม่เชื่อมต่อ), ⚠️ เนื้อหา slide ใหม่ซ้ำกับ slide เดิมทุกตัวอักษร (placeholder ชั่วคราวตามที่ผู้ใช้ระบุ), ⚠️ ไม่มี dot indicator บอกตำแหน่ง slide ปัจจุบัน, ⚠️ ยังไม่ได้ถามยืนยันลำดับ slide (01 ก่อน/02 หลัง) ตรงๆ กับผู้ใช้

## [2026-07-20] query | แก้ slide 01 ของ Hero Banner: รูปสินค้า + ข้อความ Chiang Mai (rev.19.1)
- ผู้ใช้สั่งผ่านแชท: "แก้ไขภาพถุงกาแฟในภาพแรก 01 เป็นภาพนี้ raw/assets/image/New Project1.png" และ "แก้ไขข้อความจาก Chiang rai เป็น Chiang Mai"
- ยืนยันไฟล์ `raw/assets/image/New Project1.png` มีอยู่จริงด้วย `sips` (325×504px)
- แก้ `design/homepage-wireframe.html` เฉพาะ slide 01: เปลี่ยน `.hero-showcase__product-image` src เป็น `New Project1.png`, แทนที่ "Chiang Rai" ทุกจุด (caption 2 จุด, description 1 จุด, badge "Region:" 1 จุด) เป็น "Chiang Mai" — slide 02 ไม่แตะต้อง
- ตรวจสอบด้วย Python: HTML tag สมดุลทุกตัว (`html.parser` stack-based), CSS brace สมดุล (275/275, ไม่ได้แก้ CSS)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (§ Hero Banner rev.19 เพิ่ม follow-up rev.19.1, revision history), `wiki/index.md`
- ⚠️ ยังไม่ยืนยันว่า "Chiang Mai" ถูกต้องตามข้อมูลจริงหรือเป็นแค่การทดสอบความแตกต่างของ slide

## [2026-07-20] query | ปรับ padding/margin ทุก section ให้เท่ากัน (rev.20)
- ผู้ใช้สั่ง: "ทุก section ไม่ต้องมี margin / แต่ละ section padding ต้องเท่ากัน คือ บน-ล่าง-ซ้าย-ขวา =50 เท่ากันทั้งหมด"
- พบ 7 `<section>` ในหน้า: `.hero-section`, `.about-section`, `.business-section`, `.shop-section`, `.news-section`, `.cta-banner`, `.contact-section`
- แก้ `design/style.css` 6 จุด: เปลี่ยน padding ของ hero/about/business/shop/news (เดิมส่วนใหญ่ `96px 32px 112px` หรือ `96px 28px 48px`) เป็น `padding: 50px`, เพิ่ม `padding: 50px` ให้ `.contact-section` (เดิมไม่มี padding ประกาศไว้เลย)
- แก้ inline `<style>` ใน `design/homepage-wireframe.html` 1 จุด: `.cta-banner` ลบ `margin:16px 32px 56px` ออก, เปลี่ยน `padding:56px 44px` เป็น `padding:50px`
- ไม่แตะ margin ของ element ย่อยภายใน section (เช่น `.business-section__header{margin:0 auto 56px}`) เพราะตีความว่าคำสั่งพูดถึง margin ระดับ section เท่านั้น
- ตรวจสอบด้วย Python: CSS brace สมดุล (275/275), HTML tag สมดุลทุกตัว (`html.parser` stack-based)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § ปรับ padding/margin ทุก section rev.20, checklist 2 ข้อใหม่, revision history), `wiki/index.md`
- ⚠️ เสี่ยง `.site-header` (absolute overlay, สูง ~92px) ทับเนื้อหา hero เพราะ padding-top ลดจาก 96px (ที่ตั้งใจกันไว้ตั้งแต่ rev.15.1) เหลือ 50px — ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง
- ⚠️ ระยะห่างระหว่าง section ทั้งหน้าแน่นขึ้นมาก (จากเดิมสูงสุด 112px เหลือ 50px ทุกด้าน) และ `.cta-banner` เสีย margin แยกจาก section ข้างเคียง

## [2026-07-20] query | ลบ .cta-banner section ออกทั้งหมด (rev.21)
- ผู้ใช้สั่ง (ส่ง screenshot ประกอบ): "ลบ Section นี้ออก" — ระบุ `.cta-banner` (พื้นแดง "พร้อมสั่งซื้อหรือร่วมงานกับเรา หรือยัง? 🚀" + ปุ่ม "ติดต่อเราเลย")
- ลบ `<section class="cta-banner">...</section>` ออกจาก `design/homepage-wireframe.html` (เดิมอยู่ระหว่าง Online Shop กับ Contact Us)
- ลบ CSS ที่เกี่ยวข้องออกจาก inline `<style>` ทั้งหมด: `.cta-banner`, `.cta-banner::before`, `.cta-banner h2`, `.cta-banner p`, `.cta-banner .btn-solid`
- ลบ dead code `.btn-solid` และ `.doodle` (utility class ที่ใช้เฉพาะใน `.cta-banner` เท่านั้น ตรวจสอบแล้วไม่มีที่อื่นเรียกใช้)
- แก้ปัญหา checklist "CTA ซ้ำซ้อน" ที่ค้างมาตั้งแต่ rev.10 (มาร์คว่าแก้แล้วในหน้า concept)
- ตรวจสอบด้วย Python: HTML tag สมดุลทุกตัว (`html.parser` stack-based), inline `<style>` brace สมดุล (24/24)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § CTA Banner section rev.21, ปิด checklist เดิม, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริงว่าระยะห่างระหว่าง Online Shop กับ Contact Us (ตอนนี้ติดกันโดยตรง ไม่มี CTA คั่นแล้ว) ดูเหมาะสมหรือไม่

## [2026-07-20] query | เพิ่ม section "Our Partners" เหนือ Online Shop (rev.22)
- ผู้ใช้สั่ง (ส่งภาพ ref ประกอบ สไตล์ "As seen in:" โลโก้สื่อ/สำนักพิมพ์): "เพิ่ม section 'Our partners' บน Section online shop ref ตามภาพที่ส่งให้ โดยใช้โลโก้ทั้งหมดจาก raw/assets/image/Cients"
- เปิดดูภาพจริงทั้ง 12 ไฟล์ใน `raw/assets/image/Cients/` (ชื่อไฟล์เป็น UUID ไม่สื่อความหมาย) พบว่าเป็นโลโก้แบรนด์เครื่องชงกาแฟ/อุปกรณ์กาแฟทั้งหมด: Saeco, Casadio (Bologna 1950), Evoca Group, Hiway, Rancilio, Gaggia Milano, Nuova Simonelli, TCN (中吉), EGRO, NECTA, Dr.Coffee, Cunill (Desde 1957)
- ⚠️ พบว่าไม่ตรงกับภาพ ref ที่ผู้ใช้ส่งมาซึ่งเป็นโลโก้สื่อ/สำนักพิมพ์ (Today, Bustle, Real Simple, House Beautiful, Wired, Good Morning America, Chicago Tribune, OK!) — ตีความว่าภาพ ref เป็นตัวอย่างเลย์เอาต์/สไตล์เท่านั้น ใช้โลโก้จริงจากโฟลเดอร์ตามคำสั่งที่ระบุชัดเจน ยังไม่ได้ถามยืนยันตรงๆ กับผู้ใช้
- เพิ่ม `<section class="partners-section" id="our-partners">` ใน `design/homepage-wireframe.html` ระหว่าง `.business-section` (Our Business) กับ `.shop-section` (Online Shop) — มี eyebrow "Our Partners" + h2 "พันธมิตรของเรา" + แถวโลโก้ 12 ไฟล์ (`alt` ระบุชื่อแบรนด์ตามที่อ่านได้จากภาพจริง)
- เพิ่ม CSS `.partners-section`/`__header`/`__logos`/`__logo` ใหม่ใน `design/style.css` (ก่อนบล็อก Section 10: Online Shop) — `padding: 50px` ตาม convention rev.20, โลโก้ grayscale+opacity 0.6 คืนสีเต็ม+opacity 1 ตอน hover, responsive ลดขนาด/gap ที่ `max-width: 767px`
- ตรวจสอบด้วย Python: CSS brace สมดุล (283/283, +8 จากเดิม 275 ตรงกับ CSS rule ที่เพิ่ม), HTML tag สมดุลทุกตัว (`html.parser` stack-based), inline `<style>` ไม่แตะต้อง (24/24 เท่าเดิม) — ยืนยันไฟล์ภาพทั้ง 12 มีอยู่จริงตาม path `../raw/assets/image/Cients/<uuid>.png` ด้วย bash loop
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Our Partners section rev.22, checklist 2 ข้อใหม่, revision history), `wiki/index.md`
- ⚠️ เนื้อหาโลโก้ไม่ตรงกับภาพ ref (โลโก้สื่อ vs โลโก้แบรนด์กาแฟ) ยังไม่ได้ยืนยันการตีความกับผู้ใช้, ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง, ⚠️ ชื่อแบรนด์ใน `alt` เป็นการอ่านจากภาพเองไม่มีเอกสารยืนยันความสัมพันธ์พันธมิตรจริง, ⚠️ ชื่อโฟลเดอร์ `Cients` (สะกดขาด "l") คงไว้ตามเดิมเพราะ `raw/` ห้ามแก้ไข

## [2026-07-20] query | เพิ่ม margin-bottom: 0 ให้ทุก section (rev.23)
- ผู้ใช้สั่ง: "ทุก section margin-bottom =0"
- ตรวจสอบ 7 `<section>` ในหน้า: `.hero-section`, `.about-section`, `.business-section`, `.partners-section`, `.shop-section`, `.news-section`, `.contact-section` — พบว่าไม่มีจุดใดประกาศ `margin` ไว้เลยตั้งแต่แรก (ค่า default ของ browser สำหรับ `<section>` คือ 0 อยู่แล้ว ต่างจาก `<p>`/`<h1>` ที่มี margin default)
- เพิ่ม `margin-bottom: 0;` แบบระบุชัดเจนเข้าไปในกฎ CSS ระดับ base ของทั้ง 7 section ใน `design/style.css` เพื่อความชัดเจน ป้องกันความคลุมเครือในอนาคต (ไม่เปลี่ยนพฤติกรรมภาพจริงเพราะ default ก็เป็น 0 อยู่แล้ว)
- ตรวจสอบด้วย Python: CSS brace สมดุล (283/283 เท่าเดิม เพราะไม่มีการเพิ่ม/ลบ rule ใหม่ แค่เพิ่ม property ในกฎเดิม)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (revision history), `wiki/index.md`

## [2026-07-20] query | ปรับ font-size h2 title เป็น 2.5rem (rev.24)
- ผู้ใช้สั่ง: "Title h2 ปรับ font size เป็น 2.5 rem"
- พบ h2 title 6 จุดในหน้า: 5 จุดใช้ shared class `.web-title` (About Us, Our Business, Our Partners, Online Shop, News) เดิม `clamp(2.75rem, 6vw, 5.75rem)` + 1 จุดใช้ unique class `.contact-section__title` (Contact Us) เดิม `clamp(3.25rem, 7vw, 7rem)` พร้อม mobile override `clamp(3rem, 16vw, 5rem)`
- เปลี่ยนทั้ง 6 จุดเป็นค่าคงที่ `font-size: 2.5rem` (รวม mobile override ของ `.contact-section__title` ด้วยเพื่อความสอดคล้อง) ใน `design/style.css` — ไม่แตะ `<h1>` (`.hero-showcase__title` ของ Hero Banner เพราะเป็น h1 ไม่ใช่ h2 ตามที่ผู้ใช้ระบุเจาะจง)
- ตรวจสอบด้วย Python: CSS brace สมดุล (283/283 เท่าเดิม เพราะไม่มีการเพิ่ม/ลบ rule ใหม่)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (revision history), `wiki/index.md`

## [2026-07-20] query | รวมฟอนต์ทั้งเว็บเป็น IBM Plex Sans Thai (rev.25)
- ผู้ใช้สั่ง: "set style all font in website is IBM Plex Sans Thai"
- พบว่าเดิมมี 2 ระบบฟอนต์ปนกัน: `design/style.css` ใช้ `--font-family: "Inter", "Kanit", sans-serif` (ผูกกับ body และ element ส่วนใหญ่ผ่าน `var(--font-family)`) ส่วน inline `<style>` ใน `design/homepage-wireframe.html` ตั้ง body เป็น `'IBM Plex Sans Thai'` แต่ h1/h2/`.section-head span` ใช้ `'Bricolage Grotesque','IBM Plex Sans Thai'` — เกิดการชนกันของฟอนต์ระหว่างองค์ประกอบต่างชนิด
- เปลี่ยน `--font-family` ใน `:root` ของ `design/style.css` เป็น `"IBM Plex Sans Thai", sans-serif` (กระทบทุก element ที่อ้าง var นี้: body, `.shop-card__title/__description`, `.hero-section`, `.site-header`), เปลี่ยน `@import` Google Fonts บนสุดไฟล์จาก Inter/Kanit เป็น IBM Plex Sans Thai
- แก้ inline `<style>` ใน `design/homepage-wireframe.html`: ตัด `'Bricolage Grotesque'` ออกจากกฎ `h1,h2,.section-head span` เหลือ `'IBM Plex Sans Thai'` อย่างเดียว, อัปเดต `<link>` Google Fonts ใน `<head>` ตัด `family=Bricolage+Grotesque` ออก และเพิ่ม weight `800` ให้ IBM Plex Sans Thai (เดิมมีแค่ 400-700 แต่ไฟล์ใช้ `font-weight:800` จริง 13 จุด)
- ตรวจสอบด้วย Python: CSS brace สมดุล (283/283 เท่าเดิม), HTML tag สมดุลทุกตัว (`html.parser` stack-based)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (revision history, checklist 1 ข้อใหม่), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริงว่าฟอนต์โหลด/แสดงผลถูกต้องทุกจุด

## [2026-07-20] query | เปลี่ยนสี #e91e63 เป็น #e975cd (rev.26)
- ผู้ใช้สั่ง: "change #e91e63 to #e975cd"
- พบว่า `#e91e63` hardcode อยู่จุดเดียวในทั้งโปรเจกต์: `--accent-pink` ใน `:root` ของ `design/style.css` (element อื่นทั้งหมดอ้างผ่าน `var(--accent-pink)`)
- เปลี่ยนค่าเป็น `#e975cd` — ไม่ได้แตะ `--accent-pink-hover`/`--accent-pink-soft` เพราะผู้ใช้ระบุแค่ค่าเดียว
- สังเกตว่า `#e975cd` ตรงกับ `--pink:#E975CD` ในชุดสี CI ทางการ (ประกาศไว้ใน inline `<style>` ของ `design/homepage-wireframe.html`) พอดี ทำให้ accent-pink ของระบบสี style.css ใกล้เคียง CI มากขึ้น
- ตรวจสอบด้วย Python: CSS brace สมดุล (283/283 เท่าเดิม), ยืนยันไม่มี `#e91e63` เหลือในไฟล์
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (revision history), `wiki/index.md`

## [2026-07-20] query | ปรับ logo strip Our Partners เป็นแถวเดียวเลื่อนได้ (rev.27)
- ผู้ใช้สั่ง: "Our Partners update height to 100px show max limit 1 line if over can slid for view more"
- `.partners-section__logo` เปลี่ยน `height` จาก `40px` เป็น `100px` (mobile `≤767px` จาก `30px` เป็น `70px` รักษาสัดส่วนลดลงคล้ายเดิม), เพิ่ม `flex-shrink: 0` กันโลโก้บีบเล็กลงเวลาแถวแน่น
- `.partners-section__logos` เปลี่ยนจาก `flex-wrap: wrap` (หลายบรรทัด กึ่งกลาง) เป็น `flex-wrap: nowrap` + `overflow-x: auto` + `justify-content: flex-start` (แถวเดียว เลื่อนแนวนอนได้เมื่อล้น จัดชิดซ้ายแทนกึ่งกลางเพื่อไม่ให้โลโก้ฝั่งซ้ายโดนตัดตอน scroll) — ซ่อน scrollbar ด้วย `scrollbar-width: none` + `::-webkit-scrollbar{display:none}` ตามแพทเทิร์นเดียวกับ `.shop-grid` (rev.7/13) ที่มีอยู่แล้วในไฟล์
- ตรวจสอบด้วย Python: CSS brace สมดุล (284/284, +1 จากเดิม 283 ตรงกับ `::-webkit-scrollbar` rule ที่เพิ่ม)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (revision history), `wiki/index.md`

## [2026-07-20] query | ตัดการ์ดกระดาษ About Us ออก เหลือ plain text (rev.28)
- ผู้ใช้สั่ง (ส่งภาพ ref สไตล์ apéritif brand: heading serif กึ่งกลาง, ย่อหน้ากึ่งกลาง, ปุ่มลิงก์ข้อความเล็ก): "Change Section About us ไม่ต้องมี BG ไม่ต้องมี Label OUR STORY เน้น show wording มีปุ่มสำหรับกดอ่านเพิ่มเติม"
- HTML: ลบ `<span class="about-card__label">About Us</span>`, `<span class="section-eyebrow about-card__eyebrow">Our Story</span>`, `<div class="about-card__divider"></div>`, `<span class="about-card__badge">CP B&F</span>` ออกจาก `design/homepage-wireframe.html` — เหลือ h2 title + คำอธิบาย 2 ย่อหน้า + ปุ่ม `.btn-accent` "อ่านเพิ่มเติม"
- CSS (`design/style.css`): `.about-section` ตัด `background-color`/`overflow:hidden`/`::before`(ลายจุด)/`::after`(blob ชมพูเบลอ) ทิ้งทั้งหมด — `.about-card` ตัด background/shadow/ขอบหยักแบบแสตมป์/`:hover` transform ทิ้ง เปลี่ยนเป็น flex กึ่งกลาง — `.about-card__content` เปลี่ยนเป็น `max-width:720px`+`text-align:center` — ลบ dead code: `.about-card__label`, `.about-card__badge` (ทุก breakpoint), `.about-card__divider`, media query `.about-card{padding:64px 40px 56px}`, token `--about-card-radius`/`--about-shadow`, และตัดอ้างอิง `.about-card`/`.about-card:hover` ออกจาก `@media (prefers-reduced-motion: reduce)`
- Judgment call ที่ไม่ได้ระบุตรงๆ ในคำสั่ง (นอกเหนือจาก BG/Label OUR STORY): ลบป้าย "About Us" + ป้ายกลม "CP B&F" ด้วย (เหตุผล: เป็น decoration overlay บนขอบการ์ดที่เพิ่งลบไป ลอยแปลกถ้าไม่มีกล่อง ไม่ตรงกับภาพ ref), ลบแถบคั่นตกแต่ง `.about-card__divider`, เปลี่ยน text-align จาก left เป็น center ตามภาพ ref — ยังไม่ได้ยืนยันกับผู้ใช้
- ตรวจสอบด้วย Python: CSS brace สมดุล (269/269, ลดจากเดิม 284), HTML tag สมดุลทุกตัว (`html.parser` stack-based)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § About Us section rev.28, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง, ⚠️ ยังไม่ได้ยืนยันกับผู้ใช้เรื่องลบป้าย "About Us"/"CP B&F"

## [2026-07-20] query | เปลี่ยน Online Shop เป็น Products section grid+view-more (rev.29)
- ผู้ใช้สั่ง "change section product" พร้อม markup HTML+CSS+JavaScript ฉบับสมบูรณ์สำหรับ product grid + quantity stepper + ปุ่ม "Add to cart" + toggle "View more/View less" และระบุเพิ่ม: "สีอ้างอิงตาม CI", "รูปสินค้าสุ่มใช้จาก raw/assets/image/New Project.png, New Project1.png, New Project2.png", "รายละเอียดสินค้าสุ่มใช้จากของเดิมไปก่อน"
- HTML (`design/homepage-wireframe.html`): เปลี่ยน nav link `#online-shop`→`#products` — แทนที่ `<section class="shop-section" id="online-shop">` (rev.13) ทั้ง block ด้วย `<section class="product-section" id="products">` — `.product-grid#productGrid` มีการ์ด `.product-card` 5 ใบ (ไม่ใช่ 8 ตาม template เพราะมีสินค้าจริงแค่ 5 รายการ ไม่ fabricate เพิ่ม) ใบที่ 5 "HEY! BEV รสทับทิม" ใส่ class `product-card--additional` ซ่อนใน "view more" — ข้อมูลสินค้า (ชื่อ/คำอธิบาย/ราคา/ลิงก์) สืบมาจาก [[Online Shop Section - HTML+CSS]] rev.13 เดิมทั้งหมด — รูปสินค้าหมุนเวียน `New Project.png`/`1`/`2` (alt ระบุ "(ภาพตัวอย่างชั่วคราว)" ชัดเจน) — ปุ่ม "Add to cart" คง `type="button"` ตาม template (ไม่ navigate) จึงย้ายลิงก์สั่งซื้อจริง (cpbf.co.th) ไปไว้ที่ `.product-card__image-link` แทน
- CSS (`design/style.css`): เพิ่ม token ใหม่ใน `:root` โดย alias ทับของเดิมแทนประกาศซ้ำ (ตอบโจทย์ "สีอ้างอิงตาม CI" เพราะ `--primary-color:#135af7` ใกล้เคียง CI `#1B5EF9` อยู่แล้ว แทนสีทอง `#c9a350` ที่ template กำหนดเอง): `--product-accent: var(--primary-color)`, `--product-accent-hover: var(--primary-hover)`, `--text-primary: var(--font-title)`, `--text-secondary: var(--font-desc)`, `--border-light: var(--border-color)` — เพิ่ม token ใหม่จริงแค่ 1 ตัว `--bg-product-section: #f4f3f1` — แทนที่ทั้ง block "Section 10: Online Shop" (`.shop-section`/`.shop-card`/`.shop-nav`/slider) ด้วย "Section 10: Products" (`.product-section`/`.product-card`/`.quantity-button`/`.product-view-more__button`/`@keyframes productFadeIn`, grid static 4 คอลัมน์ ไม่ใช่ scroll-slider แบบเดิม, responsive 1199px/767px/420px) — อัปเดต `@media (prefers-reduced-motion: reduce)` ตัด `.shop-card`/`.shop-card__button` ออก เพิ่ม `.product-card`/`.product-card__button`/`.product-view-more__icon`
- JavaScript: เพิ่ม `<script>` ที่สองใน `homepage-wireframe.html` ต่อจาก Hero Parallax script เดิม — ผูก `viewMoreButton` toggle class `is-expanded` บน `#productGrid` + สลับ label + `aria-expanded` + scroll-into-view ตอนยุบ, ผูกปุ่ม `.quantity-button--minus`/`--plus` คำนวณ min/max จาก attribute ของ `.quantity-input`
- ตรวจสอบด้วย Python: CSS brace สมดุล (262/262), HTML tag สมดุลทุกตัว (`html.parser` stack-based, ไม่มี error)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Products section rev.29, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง (layout, JS toggle, quantity stepper), ⚠️ รูปสินค้าเป็น placeholder ชั่วคราวหมุนเวียน 3 ไฟล์ ไม่ใช่ภาพสินค้าจริง, ⚠️ มีแค่ 5 การ์ดไม่ใช่ 8 ตาม template ต้นฉบับ ยังไม่ได้ยืนยันกับผู้ใช้ว่ามีสินค้าเพิ่มเติมจะให้ข้อมูลตามมาทีหลังหรือไม่

## [2026-07-20] query | restyle Products section ตามภาพ ref apéritif brand "What's in Season" (rev.30)
- ผู้ใช้ส่งภาพ ref (heading serif กึ่งกลาง "What's in Season", การ์ดสินค้าไม่มีกล่อง/เงา, ขวดสินค้าวางหน้ารูปทรงโค้งประตูสี, ชื่อสินค้า serif, คำอธิบายกึ่งกลางสีเทาไม่มีบรรทัดราคาแยก, quantity stepper แบนเรียบ, ปุ่ม "ADD TO CART • $39.99" สีทอง/มัสตาร์ดมุมมนเล็กน้อยเต็มความกว้าง) พร้อมข้อความ: "ต้องการให้ปรับ section shop online เป็นตาม design นี้"
- CSS-only (`design/style.css`) — ไม่แตะ HTML/JS ของ rev.29:
  - เพิ่ม Google Font import "Playfair Display" + token ใหม่ `--font-serif: "Playfair Display", serif` — ใช้กับ `.product-heading__title` และ `.product-card__name`
  - `.product-card`: ตัด background/border/box-shadow/border-radius ออกทั้งหมด เปลี่ยนเป็น flex column กึ่งกลาง โปร่งใส (ไม่มีกล่อง)
  - `.product-card__visual`: เปลี่ยนจากกล่องพื้นหลังทึบเป็น container โปร่งใสขนาดคงที่ (`max-width:220px; height:260px`) จัดรูปสินค้าชิดล่าง
  - เพิ่ม `.product-card__visual::before` สร้างรูปทรงโค้งประตู (arch) ด้วย `border-radius:999px 999px 0 0` วางไว้หลังรูปสินค้า (`z-index:0` vs รูป `z-index:1`) ใช้สี `--product-bg` เดิมต่อการ์ด (ไม่เปลี่ยนชุดสีต่อสินค้าจาก rev.29)
  - ซ่อนบรรทัดราคาแยก `.product-card__price { display:none }` (DOM คงไว้ ไม่ลบ element)
  - `.quantity-button`: ตัดกรอบวงกลม/พื้นหลัง เหลือปุ่มข้อความแบนเปลี่ยนสีตอน hover เท่านั้น, `.quantity-input` ลดขนาดลง
  - `.product-card__button`: `border-radius` จาก pill เต็ม (`var(--pill-radius)`) เป็น `6px`, ความกว้างจาก auto เป็น `100%`, เพิ่ม `text-transform:uppercase`+`letter-spacing`
  - ย้าย hover effect จากการ์ดทั้งใบ (เดิมไม่มีกล่องให้ยกแล้ว) มาที่รูปสินค้าแทน: `.product-card__image-link:hover .product-card__image { transform: scale(1.04) }`
  - ตัด mobile override `text-align:left` ที่ breakpoint 767px ออก ให้กึ่งกลางทุกขนาดจอตามภาพ ref
  - อัปเดต `@media (prefers-reduced-motion: reduce)`: ย้าย selector จาก `.product-card`/`.product-card:hover` เป็น `.product-card__image`/`.product-card__image-link:hover .product-card__image`, เพิ่ม `.quantity-button` เข้า transition:none list
- Judgment call ที่ไม่ได้ระบุตรงๆ ในคำสั่ง: (1) คงสีปุ่ม "Add to cart" เป็น `var(--product-accent)` (CI blue) ไม่เปลี่ยนเป็นสีทอง/มัสตาร์ดตามภาพ ref ตรงๆ เพราะยึดคำสั่งก่อนหน้า "สีอ้างอิงตาม CI" (rev.29) เป็นหลัก ยังไม่ได้ยืนยันกับผู้ใช้ (2) คงจำนวนคอลัมน์ grid (4) และจำนวนการ์ดจริง (5, ไม่ fabricate) ตามเดิมจาก rev.29 ไม่เปลี่ยนตาม screenshot ที่แสดงแค่ 3 คอลัมน์ (ตีความว่าอาจเป็นภาพ crop ไม่ใช่ spec จำนวนคอลัมน์ตรงๆ)
- ตรวจสอบด้วย Python: CSS brace สมดุล (263/263, +1 จากเดิม 262 ตรงกับ `::before` rule ที่เพิ่ม)
- พยายามตรวจสอบด้วยเบราว์เซอร์จริง: `preview_start` ล้มเหลว (ไม่มี `.claude/launch.json`), สร้าง launch.json ใช้ `python3 -m http.server` ล้มเหลวด้วย sandbox permission error (ลบไฟล์ทิ้งแล้ว), Claude in Chrome ไม่เชื่อมต่อ — ไม่สามารถตรวจสอบด้วยเบราว์เซอร์จริงได้ในรอบนี้
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Products section rev.30, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง โดยเฉพาะสัดส่วน/ตำแหน่งรูปทรง arch ว่าตรงกับภาพ ref แค่ไหน, ⚠️ สีปุ่มและจำนวนคอลัมน์/การ์ดเป็น judgment call ที่ยังไม่ยืนยันกับผู้ใช้

## [2026-07-20] query | ปรับเพิ่ม visual/description/ปุ่ม Products section (rev.30.1)
- ผู้ใช้สั่งต่อเนื่อง 5 ข้อสั้นๆ: "product-card__visual ไม่ต้องกำหนด Height, max-width = 300px, product description max 2 lines ตัดคำ auto, style button add to cart ใช้เหมือนปุ่ม primary, ไม่ต้องมี product-heading__description, ตัด label Our product"
- CSS (`design/style.css`): `.product-card__visual` ลบ `height:260px` ออก (สูงตามเนื้อหาแทน) + `max-width` จาก `220px` เป็น `300px` — `.product-card__description` เพิ่ม `display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;` ตัดคำอัตโนมัติ 2 บรรทัด — `.product-card__button` เปลี่ยนให้ตรงสไตล์ `.btn-primary` (`design/style.css:164-193`) ทุกจุด: `border-radius:var(--pill-radius)`, `min-height:48px`, `padding:0.75rem 1.5rem`, `box-shadow:0 4px 14px rgb(19 90 247 / 30%)`, hover `transform:translateY(-2px)`, ตัด `text-transform:uppercase`/`letter-spacing` ออก — คงสี `var(--product-accent)` เดิม (ไม่มีคำสั่งเปลี่ยนสี) และคง `width:100%`
- ลบ `.product-heading__eyebrow` (label "OUR PRODUCTS") และ `.product-heading__description` (ย่อหน้าอธิบายใต้ h2) ออกทั้ง HTML element และ CSS rule — เหลือ `.product-heading` มีแค่ h2 title เดียว
- อัปเดต `@media (prefers-reduced-motion: reduce)`: เพิ่ม `.product-card__button:hover` เข้ากลุ่ม `transform:none` (จำเป็นเพราะเพิ่งเพิ่ม `translateY(-2px)` เข้าไปในปุ่มรอบนี้)
- ตรวจสอบด้วย Python: CSS brace สมดุล (261/261, ลดจาก 263 เพราะลบ 2 rule ที่ไม่ใช้แล้ว), HTML tag สมดุลทุกตัว (`html.parser` stack-based, แก้ checker ให้ไม่ false-positive กับ void element แบบ self-closing เช่น `<img/>`)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Products section rev.30.1, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง โดยเฉพาะผลของการตัด height ออกจาก `.product-card__visual` ต่อสัดส่วนรูปทรง arch (`::before`, สูง 78% ของ container เดิม)

## [2026-07-20] query | จำกัดชื่อสินค้า 1 บรรทัด, ฟอนต์ IBM Plex Sans Thai ทั้งหมด, จัดปุ่มระดับเดียวกัน (rev.30.2)
- ผู้ใช้สั่งต่อเนื่อง 3 ข้อ: "Product title Max 1 Line", "ใช้ IBM Plex Sans Thai ทั้งหมด", "ปุ่ม add to cart ต้องอยู่ในระดับเดียวกันทั้งหมด"
- CSS (`design/style.css`): `.product-card__name` เพิ่ม `white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;` จำกัด 1 บรรทัด — ลบฟอนต์ serif "Playfair Display" ออกทั้งหมด (`@import` Google Fonts + token `--font-serif` ใน `:root`), เปลี่ยน `.product-heading__title`/`.product-card__name` จาก `var(--font-serif)` เป็น `var(--font-family)` (IBM Plex Sans Thai ตาม rev.25) + เพิ่ม `font-weight` 600→700 ชดเชยความหนา — จัดปุ่ม "Add to cart" ให้อยู่ระดับเดียวกันทุกการ์ด: `.product-card` เพิ่ม `height:100%` (ยืดเต็มความสูงแถว grid), `.product-card__quantity` เพิ่ม `margin-top:auto` (ดันกลุ่ม stepper+ปุ่มชิดขอบล่างเสมอไม่ว่าเนื้อหาด้านบนจะสั้น/ยาวแค่ไหน)
- ตรวจสอบด้วย Python: CSS brace สมดุล (261/261 เท่าเดิม — ลบ `@import`/token ไม่กระทบ brace count), HTML tag สมดุลทุกตัว
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Products section rev.30.2, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง — โดยเฉพาะว่า `margin-top:auto` จัดปุ่มระดับเดียวกันได้ผลจริงหรือไม่เมื่อรวมกับความสูงรูปสินค้าที่ไม่คงที่แล้วตั้งแต่ rev.30.1

## [2026-07-20] query | ปรับ Contact section (สุดท้าย) + Footer ให้ใช้สี CI ตามภาพ ref "Mariana" (rev.31)
- ผู้ใช้ส่งภาพ ref แนบมาพร้อมสั่ง "ปรับ Section สุดท้ายและ Footer ตาม Ref นี้ ใช้สีตาม CI" — ถอดภาพจาก transcript (base64 webp) ตรวจสอบพบว่าเป็นภาพ "Mariana" 1 ใน 5 ภาพ reference เดิมที่เคย ingest ไว้ใน [[CI Guideline และ Reference Design]] ตั้งแต่ต้นโปรเจกต์
- ตรวจสอบ `design/homepage-wireframe.html` พบว่า `.contact-section` (rev.10) สร้างจากภาพ ref เดียวกันนี้อยู่แล้วทั้ง layout (3 คอลัมน์ intro/CTA/contact-panel + bottom bar) — ตีความคำสั่งเป็น **recolor เท่านั้น ไม่แตะ HTML/layout**
- อ่านสี CI ทางการจาก [[CI Guideline และ Reference Design]] § สีทางการ: Primary blue `#1B5EF9`, เหลือง `#FFE02F`, แดง `#FF242A`, ชมพู `#E975CD` (ตรงกับ `--accent-pink` ปัจจุบันอยู่แล้วตั้งแต่ rev.26 ไม่ต้องเพิ่ม token ใหม่)
- CSS (`design/style.css`): เพิ่ม token `--ci-blue`/`--ci-yellow`/`--ci-red`/`--shadow-ci-red` ใน `:root` — `.contact-section`/`.contact-section__footer`/`footer` (พื้นน้ำเงิน) `var(--primary-color)`→`var(--ci-blue)` — `.contact-section__intro`/`.contact-section__cta`(+`::after`) (พื้นเหลือง) `var(--vibrant-yellow)` (`#FFFDE7` ครีมอ่อน) → `var(--ci-yellow)` (`#FFE02F` เหลืองสดตรง ref) — `.contact-panel`/`.contact-panel__label`/`.contact-panel__button` (พื้นแดง/ส้มขวาสุดใน ref) `var(--accent-pink)`→`var(--ci-red)` พร้อม shadow ใหม่ + hover shadow โทนแดงเข้ม (จุดเปลี่ยนเด่นสุด เพราะเดิมเป็นชมพู) — `.contact-section__footer-button span` (ไอคอนดาว) `var(--accent-pink)`→`var(--ci-yellow)` ให้ตรงดาวสีเหลืองใน ref — `.contact-section__intro::after` (วงกลมตกแต่งโปร่งแสง) `var(--primary-color)`→`var(--ci-blue)`
- **`<footer>` เดิมไม่มี CSS เลยทั้งไฟล์** (ใช้ default ของ browser พื้นขาว/ตัวหนังสือดำชิดซ้าย) — เพิ่ม CSS ใหม่ทั้งหมดเป็นครั้งแรก: พื้นหลัง `var(--ci-blue)` ต่อเนื่องจาก `.contact-section__footer` ด้านบนให้ดูเป็นแถบเดียวกันตามภาพ ref (ตัวหนังสือลิขสิทธิ์อยู่ในแถบน้ำเงินเดียวกับปุ่ม "Let's work together!" ไม่ใช่แถบขาวแยกเหมือนเดิม), ตัวหนังสือขาวโปร่งแสง 70% กึ่งกลาง
- ไม่แตะ `.contact-section__intro::before` (วงกลมตกแต่งชมพูมุมซ้ายบน — สีเดิมตรงกับ CI pink อยู่แล้วตั้งแต่ rev.26 ไม่ต้องเปลี่ยน) และ padding 50px กรอบนอก section (มาจาก rev.20 ปรับให้เท่ากันทุก section ทั้งหน้า ไม่ใช่ประเด็นเฉพาะจุดนี้)
- ตรวจสอบด้วย Python: CSS brace สมดุล (262/262, +1 จาก 261 เพราะเพิ่ม rule `footer{}` ใหม่ที่ไม่เคยมีมาก่อน), HTML tag สมดุลทุกตัว (ไม่ได้แก้ HTML รอบนี้เลย)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Contact & Footer section rev.31, แก้ backlog 2 จุดเรื่อง "สีไม่สม่ำเสมอ" ให้สะท้อนสถานะล่าสุด, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง (Claude in Chrome ไม่เชื่อมต่อในรอบนี้) — โดยเฉพาะว่าไอคอนดาวสีเหลือง (`--ci-yellow`) บนปุ่มพื้นขาวมี contrast เพียงพอหรือไม่ (เป็น `aria-hidden` ตกแต่งอย่างเดียว ไม่กระทบ accessibility ของเนื้อหาจริง)

## [2026-07-20] query | ปรับ padding Contact section/footer + notation สี CI ตามคำสั่งเพิ่มเติม (rev.31.1)
- ผู้ใช้สั่งต่อเนื่อง 4 ข้อ: "section contact us padding = 0", "class=\"contact-section__footer\" padding บนล่าง = 20px", "var(--ci-yellow) change to RGB 255 224 47", "var(--ci-red) change to #FF242A"
- CSS (`design/style.css`): `.contact-section` ตัด `padding:50px` (มาจาก rev.20 ที่ปรับให้ทุก section เท่ากัน) ออกเป็น `padding:0` — เป็นจุดยกเว้นแรกจาก convention rev.20
- `.contact-section__footer` เปลี่ยน padding บน/ล่างจาก `34px` เป็น `20px` เหลือ `padding: 20px clamp(32px, 6vw, 96px)` (ซ้าย/ขวายังคง responsive เดิม ไม่ได้สั่งให้เปลี่ยน) — ปรับ `@media (max-width: 767px)` override ให้เท่ากันทุกด้าน `20px` ด้วย (judgment call เพื่อความสอดคล้อง ผู้ใช้ไม่ได้สั่งจุดนี้ตรงๆ)
- `--ci-yellow` เปลี่ยน notation จาก `#FFE02F` เป็น `rgb(255 224 47)` (ค่าสีเดียวกันทุกประการ แค่เปลี่ยนรูปแบบเขียนตามที่ผู้ใช้ระบุ)
- `--ci-red` ตรวจแล้วตรงกับ `#FF242A` ที่ตั้งไว้ตั้งแต่ rev.31 อยู่แล้ว ไม่มีการเปลี่ยนแปลงค่า
- ตรวจสอบด้วย Python: CSS brace สมดุล (262/262 เท่าเดิม — แก้แค่ value ไม่เพิ่ม/ลบ rule)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.31.1 follow-up ในหัวข้อ Contact & Footer section rev.31, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | restyle section "Our Business" ตามภาพ ref ใหม่ (rev.32)
- ผู้ใช้ส่งภาพ ref ใหม่ (4 คอลัมน์ไอคอนวงกลมสีเหลือง/ฟ้า/แดง/เหลือง + หัวข้อตัวหนาพิมพ์ใหญ่ + คำอธิบายสั้น คั่นด้วยเส้นแนวตั้ง พื้นหลังครีม) พร้อมสั่ง "change design section our-business to be Reference design"
- ตีความเป็น rebuild layout ทั้งหมดของ `.business-section` (`id="our-business"`) จากการ์ดกล่อง stagger เดิม (rev.11) เป็นแถบไอคอนคั่นเส้นแนวตั้ง — คงเนื้อหาบริการจริงเดิมทั้งหมด (Coffee Roasting/OEM น้ำดื่ม/บริการผลิตเครื่องดื่มครบวงจร/บริการรับจัดเลี้ยง จาก [[Our Services - เนื้อหาบริการ 4 รายการ]]) ไม่ fabricate เนื้อหาใหม่ตามตัวอย่าง generic ในภาพ ref (Brand Identity/Web Design/UI-UX Design/Social Design)
- HTML (`design/homepage-wireframe.html`): ตัด `.business-card__number` (เลข 01-04), `.business-card__button` (ปุ่ม "ดูรายละเอียด"), wrapper `.business-card__content` ออกจากทั้ง 4 การ์ด — เหลือ icon (emoji เดิม ☕💧🥤🍽) + h3 title + p description ตรงตามภาพ ref
- CSS (`design/style.css`): `.business-section` เพิ่มพื้นครีม `#FBF7EF` — `.business-grid` เพิ่ม `.business-card + .business-card{border-left:1px solid var(--border-color)}` สร้างเส้นคั่นคอลัมน์ — `.business-card` ตัด box-shadow/border-radius/min-height/padding/transform stagger (nth-child เลื่อน-หมุน + hover lift จาก rev.11) ออกทั้งหมด เหลือ flex column ธรรมดา — `.business-card__icon` ขยาย 56px→72px เปลี่ยนจากโปร่งแสงเป็นวงกลมทึบสี ใช้ token CI ที่มีอยู่แล้วจาก rev.31 (`--ci-blue`/`--ci-yellow`/`--ci-red`, judgment call แทนสี custom palette เดิมเพื่อให้ตรงภาพ ref มากกว่า) — ลบ CSS ปุ่มและ variant ทั้งหมด — ปรับ media query `≤1100px`/`≤767px` ให้ตัด border คั่นออกตามจำนวนคอลัมน์ที่เปลี่ยน — cleanup `@media (prefers-reduced-motion: reduce)` ลบ selector ที่อ้างถึง element ที่ลบไปแล้ว
- ไม่ได้แตะ `.business-section__header` (eyebrow/h2/intro เดิม — ภาพ ref ไม่มี header เทียบเท่า)
- ตรวจสอบด้วย Python: CSS brace สมดุล (245/245, ลดจาก 262 เพราะลบ rule มากกว่าที่เพิ่มใหม่), HTML tag สมดุลทุกตัว
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Our Business section rev.32, แก้ summary table, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง (Claude in Chrome ไม่เชื่อมต่อในรอบนี้), ⚠️ สีวงกลมไอคอนใช้ CI สด ต่างจากโทนพาสเทลนุ่มในภาพ ref — ยังไม่ยืนยันกับผู้ใช้

## [2026-07-20] query | Global button restyle + About Us background (rev.33)
- ผู้ใช้ส่งภาพ ref ใหม่ (หัวข้อฟอนต์ serif + คำอธิบาย + ปุ่ม text-link ขีดเส้นใต้ตัวพิมพ์ใหญ่ "SEE WHAT'S INSIDE" ไม่มีพื้นหลัง/pill) พร้อมสั่ง "Update Section BG color = #EBEAE7, Btn ในแต่ละ section ให้ใช้ style ตามภาพที่แนบทั้งหมด"
- คำสั่งกำกวม 2 จุด (section ไหนได้ BG ใหม่, ขอบเขตปุ่ม global หรือเฉพาะ section) — ใช้ `AskUserQuestion` ถามผู้ใช้ก่อนแก้โค้ด ผู้ใช้ตอบ: BG `#EBEAE7` → About Us, สไตล์ปุ่ม → ทุกปุ่มทั้งหน้า (global)
- CSS (`design/style.css`): `.about-section` เพิ่ม `background-color:#ebeae7`
- Restyle ปุ่ม CTA จริง 5 จุดทั้งหน้าจาก pill/shadow เป็นตัวหนังสือขีดเส้นใต้ (`border-bottom:2px solid currentcolor`, `background:none`, `padding:0`, `text-transform:uppercase`, `letter-spacing:0.08em`, hover จาก `transform+shadow` เป็น `opacity:0.7`): `.btn-primary`/`.btn-accent` (News "ดูทั้งหมด", About Us "อ่านเพิ่มเติม"), `.product-card__button` (×5 การ์ดสินค้า "Add to cart", เปลี่ยน `width:100%`→`fit-content`), `.contact-panel__button` (คงสีขาว contrast บนพื้นแดง), `.contact-section__footer-button` ("Let's work together!", คงสีขาว contrast บนพื้นฟ้า + ไอคอนดาว `--ci-yellow` เดิม)
- ปรับ mobile media query (`≤767px`): ตัด `.contact-panel__button{width:100%}` ออก, เปลี่ยน `.contact-section__footer-button` เป็น `justify-self:center`
- cleanup `@media (prefers-reduced-motion:reduce)` — ลบปุ่มทั้ง 5 ออกจากกลุ่ม `transform:none` (dead code เพราะไม่ใช้ transform แล้ว)
- judgment call: ตีความ "ปุ่ม" = ปุ่ม CTA จริงที่ตรงกับภาพ ref เท่านั้น ไม่แตะปุ่ม UI เชิงฟังก์ชัน (ไอคอน header, quantity stepper, slider nav, view-more toggle)
- ตรวจสอบด้วย Python: CSS brace สมดุล (244/244, ลดจาก 245), HTML tag สมดุลทุกตัว (ไม่มีการแก้ HTML รอบนี้)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § Global button restyle + About Us background rev.33, แก้ summary table row About Us, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Our Business/Our Partners/Products — ตัด label, ย้าย section, เปลี่ยน title/spacing (rev.34)
- ผู้ใช้สั่ง 3 ส่วนพร้อมกัน: (1) Our Business BG=`#ffffff` + ตัด label "What we do", (2) Our Partners ย้ายไปไว้ล่าง section Product + title "พันธมิตรของเรา"→"Our Partners" + ตัด label, (3) Products title "What's in Season"→"Ready to Shop?" + ลด margin-bottom ของ `.product-heading` = `30px`
- HTML (`design/homepage-wireframe.html`): ตัด `<span class="section-eyebrow">What we do</span>` ออกจาก `.business-section__header` — ย้ายบล็อก `<section class="partners-section" id="our-partners">` ทั้งหมด (พร้อม comment) จากตำแหน่งเดิม (ระหว่าง Our Business กับ Products) ไปไว้หลัง `.product-section` ปิด ก่อน `.news-section` เปิด — ลำดับ section ใหม่: hero→about→business→product→partners→news→contact — ตัด `<span class="section-eyebrow">Our Partners</span>` ออกจาก `.partners-section__header`, เปลี่ยน h2 จาก "พันธมิตรของเรา" เป็น "Our Partners" — เปลี่ยน `.product-heading__title` จาก "What's in Season" เป็น "Ready to Shop?"
- CSS (`design/style.css`): `.business-section` background `#fbf7ef`(rev.32)→`#ffffff` — `.product-heading` margin `0 auto 56px`→`0 auto 30px`, ปรับ mobile override (`≤767px`) จาก `margin-bottom:40px`→`30px` ด้วย (judgment call กันไม่ให้ spacing มือถือมากกว่า desktop)
- ตรวจสอบด้วย Python: CSS brace สมดุล (244/244 เท่าเดิม — แก้แค่ value ไม่เพิ่ม/ลบ rule), HTML tag สมดุลทุกตัว, ยืนยันลำดับ `<section>` ด้วย regex ตรงตามที่ต้องการ (`hero-section, about-section, business-section, product-section, partners-section, news-section, contact-section`)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.34, แก้ summary table row Our Business, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Header font size consistency + Product card 1 บรรทัด + View more button style (rev.35)
- ผู้ใช้สั่ง 3 ส่วน: (1) header ทุก section ต้อง consistency font-size = `2.5rem`, (2) heading การ์ดสินค้าแสดงสูงสุด 1 บรรทัดตัดคำอัตโนมัติ, (3) ปุ่ม View more ใช้ style เดียวกับ `.about-card__button`
- ตรวจสอบทุก h2 ในหน้า: `.web-title` (ใช้ร่วม About Us/Our Business/Our Partners/News) และ `.contact-section__title` เป็น `2.5rem` คงที่แล้วตั้งแต่ rev.24 — พบจุดตกหล่นจุดเดียว: `.product-heading__title` (Products) ยังใช้ `clamp(2.25rem,4vw,3rem)` เดิม เพราะ Products section เพิ่งถูกเพิ่มเข้ามาทีหลังใน rev.29 (หลัง rev.24 ที่ทำ consistency รอบแรก) — แก้เป็น `font-size: 2.5rem` คงที่
- ตรวจสอบ `.product-card__name` พบว่าจำกัด 1 บรรทัด + ellipsis (`white-space:nowrap`+`text-overflow:ellipsis`+`overflow:hidden`) ไว้แล้วตั้งแต่ rev.30.2 — ยืนยันด้วยการอ่านโค้ดจริง ไม่มีอะไรต้องแก้เพิ่ม
- `.about-card__button` เป็นแค่ modifier (`margin-top:8px`) ที่ใช้คู่กับ `.btn-accent` (text-link ขีดเส้นใต้จาก rev.33) — restyle `.product-view-more__button` (`design/style.css`) จาก pill เต็ม (border+background ตัน+hover เปลี่ยนพื้นหลัง) เป็นสไตล์เดียวกับ `.btn-accent`: `border-bottom:2px solid currentcolor`, `background:none`, `padding:0`, `border:0`, `text-transform:uppercase`, `letter-spacing:0.08em`, `font-size:0.8125rem`, hover จาก `background-color` เปลี่ยนเป็น `opacity:0.7` — คงไอคอน chevron + `rotate(180deg)` เมื่อ `aria-expanded="true"` ไว้เหมือนเดิม
- ตรวจสอบด้วย Python: CSS brace สมดุล (244/244 เท่าเดิม — แก้แค่ property/value ไม่เพิ่ม/ลบ rule), HTML tag สมดุลทุกตัว (ไม่มีการแก้ HTML รอบนี้)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.35, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Products section — ปุ่ม Add to cart วงกลม + max-width เท่ากัน + สี CI (rev.36)
- ผู้ใช้ส่งภาพ ref ("฿410" ตัวหนา + ปุ่มวงกลม "+") สั่ง 5 ส่วน: (1) ตัด quantity stepper (+/-) ออก, (2) แสดงราคา+ปุ่ม Add to cart ตามภาพ ref, (3) max-width การ์ดสินค้าต้องเท่ากัน, (4) ปุ่ม View more ตัดสัญลักษณ์ chevron ออก, (5) เรียงสี product bg `#1b5ef9→#ffe02f→#e975cd→#1b5ef9`
- HTML: ตัด `.product-card__quantity` (ปุ่ม −/+ + `.quantity-input`) และ `.product-card__button` (text-link "Add to cart" + ราคาซ้ำ) ออกทั้ง 5 การ์ด แทนที่ด้วย `.product-card__actions` ใหม่ = ราคา `฿{จำนวนเต็ม}` (ตัดทศนิยม/"บาท" ใช้สัญลักษณ์ ฿) + ปุ่มวงกลม `.product-card__add-button` (ไอคอน SVG plus)
- ตัด event listener quantity stepper ออกจาก JS ทั้งบล็อก (markup ไม่มีแล้ว), ตัด `<svg class="product-view-more__icon">` (chevron) ออกจากปุ่ม View more เหลือแค่ label ข้อความ
- เปลี่ยน `--product-bg` ของแต่ละการ์ดเป็น token CI ที่มีอยู่แล้วซึ่งตรงกับ hex ที่สั่งพอดี: `var(--ci-blue)`(`#1b5ef9`)/`var(--ci-yellow)`(`#ffe02f`)/`var(--accent-pink)`(`#e975cd`)/`var(--ci-blue)` ตามลำดับการ์ด 1-4 — การ์ดที่ 5 (ซ่อนไว้, ไม่ได้ระบุสี) ไล่ pattern ต่อเป็น `var(--ci-yellow)` (judgment call เพื่อความต่อเนื่อง)
- CSS: `.product-card` เพิ่ม `max-width:300px;margin:0 auto` ให้ทุกการ์ดกว้างเท่ากันแน่นอน (กัน overflow บนมือถือ 1 คอลัมน์), ลบ `.product-card__quantity`/`.quantity-button`/`.quantity-input`/`.product-card__button` ที่ไม่ใช้แล้ว, เพิ่ม `.product-card__actions`/`.product-card__price`/`.product-card__add-button` (วงกลม 44×44px, `background-color:var(--primary-soft)`, hover `var(--border-light)`), ลบ `.product-view-more__icon` rules, อัปเดต `@media (prefers-reduced-motion: reduce)` ให้ตรงกับ class ใหม่
- ตรวจสอบด้วย Python: CSS brace สมดุล 238/238, HTML tag สมดุลทุกตัว (แก้ script ตรวจให้รองรับ self-closing void tag เช่น `<img/>`/`<br/>` ผ่าน `handle_startendtag` — พบว่า mismatch เดิมเป็น false-positive ของ script ไม่ใช่บั๊กจริงในไฟล์), ลำดับ `<section>` ไม่เปลี่ยน
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.36, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Add to cart สีน้ำเงิน + About Us bg ใหม่ + Hero scallop edge (rev.37)
- ผู้ใช้ส่งภาพ ref สั่ง 3 ส่วน: (1) สีปุ่ม Add to cart ก่อน hover `#1b5ef9` font/icon `#ffffff`, (2) bg `.about-section` จาก `#ebeae7`→`#f4f3f1`, (3) ขอบล่าง Hero Banner เป็น Scallop/Stamp Edge ตามภาพตัวอย่าง
- CSS: `.about-section` background-color เปลี่ยนตรงๆ เป็น `#f4f3f1`
- CSS: `.product-card__add-button` เปลี่ยน `background-color`→`var(--ci-blue)`, `color`→`#ffffff`; hover เปลี่ยนจาก `var(--border-light)`→`var(--primary-hover)` (judgment call เรื่องสี hover เพราะผู้ใช้ไม่ได้ระบุ)
- CSS: เพิ่ม `.hero-section::after` ใหม่ทำรอยหยักครึ่งวงกลม (scallop/stamp) ที่ขอบล่าง — pseudo-element สูง 16px ใช้ `radial-gradient(circle 16px at 16px 16px, #f4f3f1 15px, transparent 16px)` + `background-size:32px 16px` + `background-repeat:repeat-x`, สีวงกลม `#f4f3f1` ตรงกับ bg `.about-section` ที่อยู่ถัดจาก Hero ทันที (ไม่มีช่องว่างระหว่าง section) เพื่อให้ดูเหมือนรอยบากทะลุเห็นสี section ถัดไปจริง, `z-index:3` ให้อยู่เหนือ `.hero-section__container` (z-index:2) และภาพ slide
- พิจารณาแนวทาง `mask-image`/`-webkit-mask-image` บน `.hero-section` เองก่อน แต่ปัดตกเพราะซับซ้อนกว่าและมีปัญหา cross-browser (`-webkit-mask-image` default เป็น luminance-based ต่างจาก `mask-image` แบบ alpha-based) — เลือกวิธี pseudo-element ทาสีทับแทนเพราะรู้ค่าสี section ถัดไปแน่นอนอยู่แล้ว
- ตรวจสอบด้วย Python: CSS brace สมดุล 239/239, HTML tag สมดุลทุกตัว (ไม่มีการแก้ HTML รอบนี้)
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.37, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Hero scallop edge flip แล้วลบทิ้ง + Footer redesign เต็มรูปแบบ (rev.37.1, rev.37.2, rev.38)
- ผู้ใช้สั่ง "ตรง Curve scallop/stamp ต้อง flip กลับมาอีกฝั่งนึ่ง" — ตีความเป็นกลับทิศทางนูน/เว้า (สีไหนนูนเข้าไปในสีไหน) ไม่ใช่ mirror ซ้าย-ขวา
- rev.37.1: ย้ายรอยหยักจาก `.hero-section::after` (About Us สีเทาโผล่ขึ้นเข้า Hero) เป็น `.about-section::before` (Hero สีน้ำเงินห้อยลงเข้า About Us) — เหตุผลย้าย section: `.hero-section` มี `overflow:hidden` จะตัดขอบ pseudo-element ที่ยื่นลงมาต่ำกว่ากล่องตัวเอง ส่วน `.about-section` ไม่มีข้อจำกัดนี้ — ปรับจุดศูนย์กลาง radial-gradient จาก `16px 16px` (บนของแถบ, โชว์ครึ่งวงกลมบน) เป็น `16px 0` (บนสุดของแถบ, โชว์ครึ่งวงกลมล่าง)
- ระหว่างแก้พบบั๊กเดิมที่ไม่เกี่ยวข้องโดยตรง: `.hero-section { background: var(--primary); }` อ้างตัวแปรที่ไม่มีอยู่จริงใน `:root` (มีแต่ `--primary-color`/`--primary-hover`/`--primary-dark`/`--primary-soft`) — ย้อนดู revision history rev.17 พบเจตนาเดิมคือสี `#1B5EF9` ตรงกับ `--ci-blue` ไม่ใช่ `--primary-color` (`#135af7`) — แก้เป็น `var(--ci-blue)` เพื่อให้สี Hero จริงตรงกับสีที่ scallop ใหม่อ้างอิง
- ตรวจสอบด้วย Python (rev.37.1 เดี่ยว): CSS brace สมดุล 239/239
- rev.37.2: ผู้ใช้ส่งข้อความตามมาทันที "เอา Curve scallop/stamp ออก ไม่สวย" — ลบ `.about-section::before` ทิ้งทั้งหมด กลับเป็นขอบตรงธรรมดาระหว่าง Hero กับ About Us, คงการแก้บั๊ก `--primary`→`var(--ci-blue)` ไว้ (เป็นบั๊กจริงแยกต่างหาก)
- rev.38: ผู้ใช้ส่งภาพ ref footer แบรนด์กาแฟ "MORNCOFFEE" (พื้นเทาอ่อน, 3 คอลัมน์ Contacts/Opening Hours+Events/nav+social badge, wordmark ยักษ์เต็มความกว้างมี illustration ฝังตัวอักษร, bottom bar) สั่ง "ปรับ footer เป็นตาม ref นี้"
- ตรวจ `wiki/entities/cpbf.co.th (บริษัท).md` ยืนยันว่ายังไม่มีข้อมูลติดต่อจริง (มีแต่ placeholder + โดเมนจริง `www.cpbf.co.th`) และสายธุรกิจจริง 4 อย่าง (OEM Manufacturing/Catering Service/Product/Café) — ตัดสินใจแทนเนื้อหาร้านกาแฟใน ref (Opening Hours/Events/Merch ไม่เกี่ยวกับธุรกิจ B2B ของ CP B&F) ด้วยเนื้อหาจริงที่มีอยู่แทนการ fabricate รายละเอียดสมมติ
- HTML: แทนที่ `<footer>` เดิม (บรรทัด copyright เดียว, rev.31) ด้วย `<footer class="site-footer">` ใหม่ — คอลัมน์ 1 "Contacts" (placeholder เดิม), คอลัมน์ 2 "Our Business"+"Website" (สายธุรกิจจริง 4 อย่าง + โดเมนจริง), คอลัมน์ 3 nav (reuse anchor จริงจาก header: `#about-us`/`#our-business`/`#products`/`#news-events`) + "Social Media" badge + ไอคอน Facebook/Instagram (SVG inline, ลิงก์ `#` placeholder), wordmark "CP B&F" ตัวใหญ่ (ไม่มี illustration เพราะไม่มี asset), bottom bar (copyright+ปี 2026+ลิงก์ Privacy Policy/Terms & Conditions placeholder)
- CSS: ลบ `footer {}` เดิม (พื้นน้ำเงิน CI, rev.31) แทนที่ด้วย `.site-footer` rule set เต็มรูปแบบ (13 selector: top grid 3 คอลัมน์, heading, address/text, link, nav, social badge/icon, wordmark ขนาด `clamp()`, bottom bar+legal) พื้นหลังเปลี่ยนเป็นเทาอ่อน `#f4f3f1` ตามภาพ ref (จากเดิมน้ำเงิน CI) — เพิ่ม responsive override ที่ breakpoint 1100px (grid 3→2 คอลัมน์) และ 767px (grid→1 คอลัมน์, bottom bar stack แนวตั้ง)
- ตั้งใจไม่ใส่ scallop trim บนขอบ social badge แม้ภาพ ref จะมีเส้นหยักคล้ายกัน เพราะผู้ใช้เพิ่งสั่งลบเอฟเฟกต์นี้จาก Hero ไปหมาดๆ ใน rev.37.2
- ตรวจสอบด้วย Python (รวม rev.37.2+rev.38): CSS brace สมดุล 264/264, HTML tag สมดุลทุกตัว (0 errors) — Grep ยืนยันไม่มี selector `footer` เดี่ยวเดิมหลงเหลือ
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § follow-up rev.37.1/rev.37.2 ต่อท้าย section rev.37, เพิ่ม § ใหม่ rev.38, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง

## [2026-07-20] query | Footer wordmark font-size 7rem + ลบ Contact Us main block (rev.38.1)
- ผู้ใช้สั่ง 2 ข้อพร้อมภาพ screenshot section Contact Us: (1) `.site-footer__wordmark` font-size เปลี่ยนจาก `clamp(3.5rem,13vw,11rem)` เป็นค่าคงที่ `7rem` (ข้อความ "CP B&F" ตรงกับที่ต้องการอยู่แล้ว ไม่ต้องแก้), (2) "เอา contact-section__footer ไว้ แต่เอาส่วนตามภาพออก" — ตีความว่าให้ลบ `.contact-section__main` (บล็อก intro "LET'S CREATE SOMETHING GREAT!" + cta "Have a project in mind?" + contact-panel แดง พร้อมรายการ Email/Telephone/Website/Location + ปุ่ม "ติดต่อเรา") ที่ตรงกับภาพ screenshot ทั้งหมด แต่คง `.contact-section__footer` (บาร์ล่าง "Passionate about quality..."+ปุ่ม "Let's work together!") ไว้ตามที่สั่งชัดเจน
- HTML: ลบ `<div class="contact-section__main">...</div>` ทั้งก้อนออกจาก `<section class="contact-section">` เหลือแค่ `<div class="contact-section__footer">`
- CSS: ลบ dead code ทั้งหมดที่ผูกกับ HTML ที่ถูกลบ (ตาม convention เดิม rev.21) — `.contact-section__main`, `.contact-section__intro`(+`::before`/`::after`), `.contact-section__title`(+`span`), `.contact-section__description`, `.contact-section__decorative-line`(+`::after`), `.contact-section__cta`(+`::after`), `.contact-section__cta-text`(+`strong`), `.contact-section__arrow`, `.contact-panel`, `.contact-panel__label`, `.contact-panel__title`, `.contact-list`, `.contact-list__item`, `.contact-list__icon`, `.contact-list__label`, `.contact-list a`/`address`(+`:hover`), `.contact-panel__button`(+`:hover`), `.section-eyebrow--dark` (⚠️ `.section-eyebrow` เฉยๆ ยังใช้ที่ News section เก็บไว้) — ลบ responsive override ที่ผูกกับ class เหล่านี้ใน `@media (max-width:1100px)`/`@media (max-width:767px)`, ตัด `.contact-panel__button` ออกจาก selector list ของ `@media (prefers-reduced-motion:reduce)`
- CSS: `.site-footer__wordmark` font-size เปลี่ยนเป็น `7rem` คงที่
- ตรวจสอบด้วย Python: CSS brace สมดุล 226/226, HTML tag สมดุลทุกตัว (0 errors), Grep ยืนยันไม่มี class ที่ลบเหลือค้างทั้งใน HTML และ CSS
- อัปเดต `wiki/concepts/Wireframe หน้าแรก (Redesign cpbf.co.th).md` (เพิ่ม § rev.38.1 follow-up ต่อท้าย section rev.38, revision history), `wiki/index.md`
- ⚠️ ยังไม่ได้ตรวจสอบด้วยเบราว์เซอร์จริง — Claude in Chrome extension ไม่เชื่อมต่อตลอดช่วงที่ทำงานนี้ (ลองเชื่อมต่อ 2 ครั้ง) ควรเปิดดูจริงเพื่อยืนยันขนาด/ตำแหน่งรอยหยักก่อนใช้งานจริง
