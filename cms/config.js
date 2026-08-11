/* cms/config.js — ใส่ค่าจาก Supabase Dashboard > Project Settings > API
   SUPABASE_URL   = Project URL (เช่น https://xxxxxxxx.supabase.co)
   SUPABASE_ANON_KEY = anon public key (ขึ้นต้นด้วย "eyJ...")
   ⚠️ ใช้ได้เฉพาะ "anon public" key เท่านั้น ห้ามใช้ "service_role" key ในไฟล์นี้เด็ดขาด
      (ไฟล์นี้รันบนเบราว์เซอร์ผู้ใช้ ใครก็เปิดดูค่าได้ — service_role key ต้องไม่ปรากฏในโค้ดฝั่ง client) */

window.CMS_CONFIG = {
  SUPABASE_URL: 'https://jimgurxijwgnrtvoqidx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbWd1cnhpandnbnJ0dm9xaWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzkxMzUsImV4cCI6MjEwMTMxNTEzNX0.z5m-U8JUak7Iv11So2-x9UWldCQDTD3oT30W0Uw2O4c',
};
