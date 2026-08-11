-- CP B&F CMS — Banner Management v4: KV Banner แยก section ต่อ banner แล้ว (ไม่ใช้ proxy row ร่วมกันทั้งเพจ)
-- เดิม (schema-banners-v3.sql) banner หลายอันในเพจเดียวกันใช้ page_sections row เดียวกัน (anchor_id='kv-banner'
-- ค่าคงที่) จัดลำดับแยกจากกันไม่ได้ — ตอนนี้แต่ละ banner ได้ proxy row ของตัวเอง (anchor_id='kv-banner-<id>')
-- รันหลัง schema-banners-v3.sql เสมอ — ปลอดภัยรันซ้ำได้ (idempotent)

-- ลบ proxy row แบบเก่า (ใช้ร่วมกันทั้งเพจ) ทิ้งทั้งหมด — banner แต่ละอันจะได้ proxy row ของตัวเองแทนด้านล่าง
delete from page_sections where anchor_id = 'kv-banner';

-- สร้าง proxy row ใหม่ (anchor_id = 'kv-banner-' || banner.id) ให้ทุก KV banner ที่ active อยู่ในปัจจุบัน
-- ต่อเพจ 1 อัน วางท้ายสุดของลำดับ section ปัจจุบันของเพจนั้น (เรียงตาม banners.sort_order เดิมเพื่อคงลำดับ
-- สัมพัทธ์ระหว่าง banner ของเพจเดียวกันไว้ใกล้เคียงเดิมที่สุด) — ข้ามไปเงียบๆ ถ้าหาเพจไม่เจอ หรือมี
-- proxy row ของ banner นั้นอยู่แล้ว (กันรันซ้ำแล้ว insert ซ้ำ)
do $$
declare
  b record;
  v_page_id uuid;
  v_next_order integer;
  v_key_guess text;
begin
  for b in
    select * from banners where section = 'kv' and is_active = true order by page_url, sort_order
  loop
    v_key_guess := regexp_replace(b.page_url, '\.html$', '');
    select id into v_page_id from pages where page_key = v_key_guess or slug = v_key_guess limit 1;
    if v_page_id is null then
      continue;
    end if;
    if exists (select 1 from page_sections where page_id = v_page_id and anchor_id = 'kv-banner-' || b.id) then
      continue;
    end if;
    select coalesce(max(sort_order), -1) + 1 into v_next_order from page_sections where page_id = v_page_id;
    insert into page_sections (page_id, anchor_id, layout, body_th, is_active, sort_order)
    values (v_page_id, 'kv-banner-' || b.id, 'custom-html', '<!-- static-proxy -->', true, v_next_order);
  end loop;
end $$;
