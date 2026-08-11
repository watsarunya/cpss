---
type: raw-source
title: "Hero Banner Section - HTML+CSS (จากผู้ใช้)"
captured: 2026-07-18
---

> หมายเหตุ: ไฟล์นี้บันทึกเนื้อหา HTML+CSS ที่ผู้ใช้พิมพ์ส่งเข้ามาในแชทเพื่อสั่ง "ปรับ section บนสุด ดังนี้ Section 1: Hero Banner" — เป็นการสรุปโครงสร้าง/เนื้อหาต้นฉบับที่ผู้ใช้ส่งมา ไม่ใช่ transcript ตัวอักษรต่อตัวอักษร 100%

## คำสั่งผู้ใช้

"ปรับ section บนสุด ดังนี้ Section 1: Hero Banner" ตามด้วย markup HTML สำหรับ hero section ใหม่ (คอมเมนต์ในต้นฉบับระบุ "Section 1: Hero Banner") พร้อม stylesheet เต็ม

## Section 1: Hero Banner (HTML ต้นฉบับ — โครงสร้าง)

`<section class="hero-section" id="home">` ประกอบด้วย `.hero-section__container`:

- Decorative elements: 4 `<span class="hero-decoration ...">` (จุดกลม 2 อัน + pill เอียง 2 อัน)
- `<header class="hero-section__header">`: eyebrow "CP B&F Company Limited", `<h1 class="hero-section__title">Crafted for <span>every business</span></h1>`, description ภาษาไทย, ปุ่ม 2 อัน (`.btn-primary` "ดูบริการของเรา →" / `.btn-accent` "ติดต่อเรา")
- `.hero-gallery` — grid รูปโพลารอยด์ 4 ใบ (`.hero-photo--one/two/three/four` เอียง/ยกสูงต่างกัน) แต่ละใบมี `.hero-photo__image-wrapper` > `<img src="assets/image/hero-business-0X.png">` + `.hero-photo__caption` (ข้อความอังกฤษสั้นๆ)

## CSS ที่ผู้ใช้ส่งมา ("Global Variables" + "Section 1: Hero Banner")

- `@import` Google Fonts (Inter + Kanit) — ซ้ำกับที่มีอยู่แล้วใน `design/style.css`
- `:root` ชุดใหม่มี token ที่ซ้ำกับที่มีอยู่แล้วทั้งหมด: `--primary-color`/`--primary-hover`/`--primary-soft`/`--accent-pink`/`--accent-pink-hover`/`--accent-pink-soft`/`--vibrant-yellow`/`--highlight-yellow`/`--bg-main`/`--bg-card`/`--font-title`/`--font-desc`/`--font-light` (ค่าตรงกันทุกตัวกับ `design/style.css` ปัจจุบัน) + token ใหม่เฉพาะ hero: `--hero-font`≈`--font-family` (ซ้ำ), `--hero-container-width:1500px` (ไม่ซ้ำ ต่างจาก `--container-width:1440px`), `--hero-polaroid-bg:#fffdf3` (ไม่ซ้ำ), `--hero-shadow` (ไม่ซ้ำ)
- Redefine Base/Reset (`*,*::before,*::after{box-sizing:border-box}`, `html{scroll-behavior:smooth}`, `body{...}`, `img{...}`, `a{...}`) — ซ้ำกับที่มีอยู่แล้วใน `design/style.css` ทุกจุด
- Redefine `.btn-primary`/`.btn-accent` ("Shared Buttons") ด้วยค่าที่เกือบเหมือนของเดิมทุกจุด (ต่างแค่ `min-height:50px` vs `48px` เดิม)
- CSS component เต็มสำหรับ "Section 1: Hero Banner" (`.hero-section` พร้อม radial-gradient background + `::before` inset border), `.hero-section__container/__header/__eyebrow/__title/__title span/__description/__actions`, `.hero-gallery`, `.hero-photo` + 4 variant (`--one/--two/--three/--four` แต่ละแบบมี transform เอียง/ยกสูงต่างกัน + hover), `.hero-photo__image-wrapper/__image/__caption`, `.hero-decoration` + 4 variant (dot/pill), focus-visible accessibility, responsive breakpoint 1100px/767px/390px, `prefers-reduced-motion`

## หมายเหตุการนำไปใช้งาน (ดูรายละเอียดเต็มใน wiki)

ดู [[Hero Banner Section - HTML+CSS]] (wiki/sources) และ [[Wireframe หน้าแรก (Redesign cpbf.co.th)]] § rev.14 สำหรับการตัดสินใจปรับก่อนใช้งานจริงในหน้า — ที่สำคัญที่สุดคือ path รูป `assets/image/hero-business-0X.png` ในต้นฉบับต้องแก้เป็น `../raw/assets/image/hero-business-0X.png` ให้ตรงกับ path จริงที่ใช้ในไฟล์ (รูปทั้ง 4 ไฟล์มีอยู่จริงแล้วใน `raw/assets/image/`)
