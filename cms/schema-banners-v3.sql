-- CP B&F CMS — Banner Management v3: KV Banner แยกตามเพจ + จัดลำดับเทียบกับ Section ได้
-- รันหลัง schema-banners-v2.sql และ schema-pages-v8.sql (ต้องมีตาราง banners/pages/page_sections ครบ)
-- ปลอดภัยรันซ้ำได้ (idempotent)

-- KV banner เดิมทั้งหมดผูกกับ index.html โดย fact (เป็นหน้าเดียวที่เคยมี #kvBannerContainer) —
-- ย้ายให้เป็นของ index.html อย่างเป็นทางการเหมือนที่ hero ทำไว้ใน v2
update banners set page_url = 'index.html' where section = 'kv' and (page_url is null or page_url = '');

-- แก้ trigger ให้ KV โควตา 5 ต่อ "เพจ" เหมือน hero แล้ว (เดิมนับรวมทั้ง site เพราะ KV ไม่เคยแยกตามเพจมาก่อน)
create or replace function check_banner_limit()
returns trigger as $$
begin
  if (select count(*) from banners where section = new.section and page_url = new.page_url) >= 5 then
    raise exception 'เกินโควตาแบนเนอร์สูงสุด 5 รายการต่อหน้า (%)', new.page_url;
  end if;
  return new;
end;
$$ language plpgsql;

-- สร้าง "static proxy" page_sections row ให้ KV Banner ของหน้าแรก (index.html) เพื่อให้จัดลำดับเทียบกับ
-- section อื่นๆ ผ่าน cms/page-editor.html ได้ (ดู page-render.js's isProxySection/anchor_id='kv-banner') —
-- วางไว้ท้ายสุดของลำดับปัจจุบัน (ตำแหน่งเดิมของ #kvBannerContainer ที่เคยอยู่หลัง #pageSectionsContainer พอดี)
-- ปลอดภัยรันซ้ำได้ (เช็คว่ามีอยู่แล้วก่อน insert เสมอ)
do $$
declare
  v_page_id uuid;
  v_next_order integer;
begin
  select id into v_page_id from pages where page_key = 'index';
  if v_page_id is null then
    return;
  end if;

  if exists (select 1 from page_sections where page_id = v_page_id and anchor_id = 'kv-banner') then
    return;
  end if;

  select coalesce(max(sort_order), -1) + 1 into v_next_order from page_sections where page_id = v_page_id;

  insert into page_sections (page_id, anchor_id, layout, body_th, is_active, sort_order)
  values (v_page_id, 'kv-banner', 'custom-html', '<!-- static-proxy -->', true, v_next_order);
end $$;
