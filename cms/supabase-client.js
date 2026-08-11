/* cms/supabase-client.js — สร้าง Supabase client ตัวเดียวใช้ร่วมกันทุกหน้าใน cms/ */
(function () {
  if (!window.supabase || !window.CMS_CONFIG) {
    console.error('Supabase SDK หรือ config.js ยังไม่ถูกโหลด');
    return;
  }
  window.cmsSupabase = window.supabase.createClient(
    window.CMS_CONFIG.SUPABASE_URL,
    window.CMS_CONFIG.SUPABASE_ANON_KEY
  );
})();
