-- CP B&F CMS — Banner Management v2: Hero Banner แยกตามเพจ + จัดตำแหน่งข้อความได้
-- รันหลัง schema-banners.sql (ต้องมีตาราง banners อยู่แล้ว) — วางใน SQL Editor แล้ว Run ครั้งเดียว

alter table banners add column if not exists page_url text default '';
alter table banners add column if not exists text_align text not null default 'left'
  check (text_align in ('left', 'right', 'center'));

-- แบนเนอร์ hero เดิม (ก่อนแยกตามเพจ) ทั้งหมดเคยใช้ร่วมกันทุกหน้าโดยมี index.html เป็นจุดกำเนิด
-- ย้ายให้เป็นของ index.html โดยเฉพาะ — หน้าอื่นที่ยังไม่มีแบนเนอร์เป็นของตัวเองจะซ่อน section ไปจนกว่าจะเพิ่มผ่าน CMS
update banners set page_url = 'index.html' where section = 'hero' and (page_url is null or page_url = '');

-- แก้ trigger เดิม (schema-banners.sql) ให้นับโควตา 5 ต่อ "section + page_url" แทนที่จะนับรวมทั้ง section
-- (KV banner ไม่มี page_url แยก ยังนับรวมทั้ง section เหมือนเดิม)
create or replace function check_banner_limit()
returns trigger as $$
begin
  if new.section = 'hero' then
    if (select count(*) from banners where section = 'hero' and page_url = new.page_url) >= 5 then
      raise exception 'เกินโควตาแบนเนอร์สูงสุด 5 รายการต่อหน้า (%)', new.page_url;
    end if;
  else
    if (select count(*) from banners where section = new.section) >= 5 then
      raise exception 'เกินโควตาแบนเนอร์สูงสุด 5 รายการต่อ section (%)', new.section;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create index if not exists banners_page_url_idx on banners (section, page_url, sort_order);
