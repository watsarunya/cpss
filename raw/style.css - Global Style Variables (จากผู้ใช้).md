# style.css - Global Style Variables (จากผู้ใช้)

> บันทึกต้นฉบับ CSS ที่ผู้ใช้ส่งมาในแชท (2026-07-17) พร้อมคำสั่ง "create body style.css ของเว็บไซต์" — นำไปสร้างไฟล์ `design/style.css`

```css
/* 1. กำหนดค่าตัวแปรสีหลัก (Global Variables) */
:root {
  --primary-color: #135AF7;       /* น้ำเงินหลัก - ใช้กับปุ่มหลัก, ลิงก์สำคัญ */
  --accent-pink: #E91E63;         /* ชมพูสด - ใช้กับปุ่มรอง, Tag ไฮไลต์, จุดดึงสายตา */
  --vibrant-yellow: #FFFDE7;      /* เหลืองนีออนอุ่น - ใช้เป็นพื้นหลังการ์ด หรือแถบไฮไลต์ */

  --bg-main: #FFFFFF;             /* พื้นหลังหลัก - ใช้สีขาวเพื่อให้สีสดๆ ลอยเด่นขึ้นมา */
  --bg-card: #FFFDE7;             /* พื้นหลังการ์ดหรือกล่องข้อความเด่น */

  --font-title: #333333;          /* สีหัวข้อ - เทาเข้มเกือบดำ ให้ความรู้สึกโมเดิร์นและอ่านง่าย */
  --font-desc: #666666;           /* สีคำอธิบาย - เทากลาง ลดความแข็งของข้อความยาวๆ */
  --font-light: #FFFFFF;          /* สีตัวอักษรบนปุ่มเข้ม */
}

/* 2. สไตล์สำหรับพื้นหลัง (Background) */
body {
  background-color: var(--bg-main);
  color: var(--font-title);
  font-family: 'Inter', 'Kanit', sans-serif;
  margin: 0;
  padding: 0;
}

/* 3. สไตล์สำหรับตัวอักษร (Typography) */
.web-title {
  color: var(--font-title);
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.web-description {
  color: var(--font-desc);
  font-size: 1.1rem;
  line-height: 1.6;
}

.highlight-text {
  background-color: #FFEB3B;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

/* 4. สไตล์สำหรับปุ่ม (Buttons) */
.btn-primary {
  background-color: var(--primary-color);
  color: var(--font-light);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(19, 90, 247, 0.3);
}

.btn-primary:hover {
  background-color: #0A46D3;
  transform: translateY(-2px);
}

.btn-accent {
  background-color: var(--accent-pink);
  color: var(--font-light);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(233, 30, 99, 0.3);
}

.btn-accent:hover {
  background-color: #C2185B;
  transform: translateY(-2px);
}
```
