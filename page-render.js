/* page-render.js — โมดูลกลาง: ระบบจัดการเพจ (Page Management)
   ดึงเพจ + section จริงจาก Supabase (pages/page_sections) มา render เป็น .page-section
   ใช้กับ container <div id="pageSectionsContainer" data-page-key="..."> (หรือ data-page-slug="..." สำหรับ promo.html)
   ต้องโหลดหลัง cms/supabase-client.js และ DOMPurify CDN, ก่อน i18n.js

   ⚠️ 404 handling: ถ้าเข้าถึงเพจที่ถูกลบ/ปิดใช้งาน (`pages.is_active=false`) หรือเมนูที่ผูกเพจนั้นไว้ถูกปิด
   ใช้งาน (`menu_items.is_active=false`) จะ redirect ไป `/404.html` อัตโนมัติ (`window.location.replace`)
   ยกเว้น container ที่ตั้ง `data-additive="true"` (เช่น `online_shop.html` ที่เนื้อหาจริงของหน้าทำงานเป็น
   อิสระจาก Page Management — section นี้เป็นแค่ส่วนเสริม ไม่ควรทำให้ทั้งหน้าใช้งานไม่ได้ถ้าปิด/ลบไป) —
   ดูหัวข้อ "หน้า 404 (Page Not Found)" ใน CLAUDE.md สำหรับรายละเอียดเต็ม
   หมายเหตุ: เนื้อหา rich text (heading/body) render เฉพาะ TH เท่านั้น — เหมือน pattern เดิมของ
   product-detail.html/news-detail.html/products-render.js ที่ยังไม่รองรับสลับภาษา EN สำหรับข้อมูลจาก DB
   (ฟิลด์ _en ถูกเก็บไว้ใน DB รอวันที่ระบบ i18n รองรับ dynamic content)

   ⚠️ KV Banner: render ที่นี่ด้วย (ไม่ใช่ banner-render.js อีกต่อไป) ผ่าน "static proxy" section พิเศษ
   ที่ anchor_id ขึ้นต้นด้วย 'kv-banner-' ตามด้วย id ของ banner นั้นตรงๆ (isKvBannerProxy — banner แต่ละอันมี
   proxy row ของตัวเอง ไม่ใช้ร่วมกัน จัดลำดับเทียบกับ section อื่นแยกจากกันได้อิสระ) — ต่างจาก static proxy
   ทั่วไปตรงที่ไม่มี <section> เดิมให้จับคู่ จึงสร้าง #kvBannerContainer-<id> ขึ้นใหม่เองแล้วดึง banner ตาม id
   ที่ฝังอยู่ใน anchor_id มา render ตรงตำแหน่งที่ proxy row นั้นถูกจัดลำดับไว้ ทำให้ KV Banner เพิ่ม/จัดลำดับ
   เทียบกับ section อื่นได้ในทุกเพจโดยไม่ต้องแก้ไฟล์ HTML ของแต่ละหน้าเลย ต้องโหลดหลัง banner-render.js เสมอ
   (ใช้ window.cpbfBanners) */
(function () {
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function sanitize(html) {
    if (!html) return '';
    return window.DOMPurify ? DOMPurify.sanitize(html) : escapeHtml(html);
  }

  // เพจจะ "มองเห็นได้" ก็ต่อเมื่อ pages.is_active=true เอง และ (ถ้าผูกกับเมนู) เมนูนั้นต้อง is_active=true
  // ด้วย — ไม่งั้นถือว่าไม่พบเพจ (ให้ init() พาไปหน้า 404) เพื่อไม่ให้เข้าถึงเพจ/เมนูที่ถูกปิดใช้งานผ่าน URL ตรงได้
  function isPageVisible(page) {
    if (!page || !page.is_active) return false;
    if (page.menu_items && page.menu_items.is_active === false) return false;
    return true;
  }

  async function fetchPageByKey(key) {
    var { data, error } = await window.cmsSupabase
      .from('pages')
      .select('*, menu_items(is_active)')
      .eq('page_key', key)
      .maybeSingle();
    if (error) {
      console.error('โหลดข้อมูลเพจไม่สำเร็จ:', error.message);
      return null;
    }
    return isPageVisible(data) ? data : null;
  }

  async function fetchPageBySlug(slug) {
    var { data, error } = await window.cmsSupabase
      .from('pages')
      .select('*, menu_items(is_active)')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('โหลดข้อมูลเพจไม่สำเร็จ:', error.message);
      return null;
    }
    return isPageVisible(data) ? data : null;
  }

  async function fetchSections(pageId) {
    var { data, error } = await window.cmsSupabase
      .from('page_sections')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('โหลด section ของเพจไม่สำเร็จ:', error.message);
      return [];
    }
    return data || [];
  }

  // KV Banner ทั้งหมดของเพจปัจจุบัน (จัดการผ่าน cms/banners.html แท็บ "KV Banner") — เรียกครั้งเดียวเมื่อเจอ
  // "static proxy" section แบบ kv-banner-* อย่างน้อย 1 อัน แล้วให้ renderSections() หา banner ที่ตรงกับแต่ละ
  // proxy row เอง (จับคู่ด้วย id ที่ฝังอยู่ใน anchor_id — ดู kvBannerIdFromAnchor()/renderSections ด้านล่าง)
  async function fetchKvBanners(pageUrl) {
    var { data, error } = await window.cmsSupabase
      .from('banners')
      .select('*')
      .eq('section', 'kv')
      .eq('page_url', pageUrl)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('โหลด KV Banner ไม่สำเร็จ:', error.message);
      return [];
    }
    return data || [];
  }

  /* จัดรูป 1-4 รูปเป็นแถวๆ ตามจำนวน (อ้างอิง .about-story__collage เดิม):
     1 รูป -> แถวเดียว 1 รูป | 2 รูป -> แถวเดียว 2 รูปเท่ากัน
     3 รูป -> แถวบน 2 รูป (กว้าง+แคบ) + แถวล่าง 1 รูปเต็ม | 4 รูป -> 2 แถว แถวละ 2 รูปเท่ากัน */
  function collageRows(images) {
    if (images.length <= 1) return [{ items: images, splitClass: '' }];
    if (images.length === 2) return [{ items: images, splitClass: 'page-section__collage-row--split' }];
    if (images.length === 3) {
      return [
        { items: images.slice(0, 2), splitClass: 'page-section__collage-row--wide-narrow' },
        { items: images.slice(2, 3), splitClass: '' },
      ];
    }
    return [
      { items: images.slice(0, 2), splitClass: 'page-section__collage-row--split' },
      { items: images.slice(2, 4), splitClass: 'page-section__collage-row--split' },
    ];
  }

  // รวม images (text[]) + image_links (text[] ตำแหน่งตรงกัน) เป็น [{url, link}] ตัวเดียว ให้ฟังก์ชัน
  // render รูปทั้งสองแบบ (collage/image-row) ใช้ร่วมกัน — ไม่มี image_links (เพจเก่าก่อน schema-pages-v9)
  // ก็ยังทำงานได้ปกติ แค่ไม่มีรูปไหนมีลิงก์เลย
  function zipImageLinks(images, links) {
    return (images || []).map(function (url, i) {
      return { url: url, link: (links && links[i]) || '' };
    });
  }

  function buildImageTag(item, altText) {
    var img = '<img src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(altText) + '" loading="lazy" />';
    return item.link ? '<a href="' + escapeHtml(item.link) + '">' + img + '</a>' : img;
  }

  function buildCollageHtml(images, altText, grayscale) {
    if (!images || !images.length) return '';
    var rows = collageRows(images);
    var rowsHtml = rows.map(function (row) {
      var itemsHtml = row.items.map(function (item) {
        return '<div class="page-section__collage-item">' + buildImageTag(item, altText) + '</div>';
      }).join('');
      return '<div class="page-section__collage-row ' + row.splitClass + '">' + itemsHtml + '</div>';
    }).join('');

    var collageClass = 'page-section__collage page-section__collage--' + images.length;
    if (grayscale === false) collageClass += ' page-section__collage--no-grayscale';

    return (
      '<div class="page-section__media">' +
        '<div class="' + collageClass + '">' + rowsHtml + '</div>' +
      '</div>'
    );
  }

  /* layout image-top/image-bottom: จัดรูป 1-4 รูปเป็นแถวเดียวเสมอ (ไม่ใช่ collage แบบ image-left/right)
     ขนาดเท่ากันทุกรูป กึ่งกลางแถว จำนวนคอลัมน์ = จำนวนรูปที่ใส่ (auto ตามจำนวน ไม่ต้องเลือกเอง) */
  function buildImageRowHtml(images, altText, grayscale) {
    if (!images || !images.length) return '';
    var itemsHtml = images.map(function (item) {
      return '<div class="page-section__image-row-item">' + buildImageTag(item, altText) + '</div>';
    }).join('');

    var rowClass = 'page-section__image-row page-section__image-row--' + images.length;
    if (grayscale === false) rowClass += ' page-section__image-row--no-grayscale';

    return (
      '<div class="page-section__media">' +
        '<div class="' + rowClass + '">' + itemsHtml + '</div>' +
      '</div>'
    );
  }

  /* พื้นหลัง full-bleed (เต็มความกว้างจอ ไม่มี padding ซ้าย/ขวา) ใช้ได้กับทุก layout รวม custom-html
     ปรับ % ความโปร่งใส (opacity) และ % grayscale ได้อิสระต่อ section — .page-section ต้องมี
     position:relative + overflow:hidden ใน CSS เพื่อให้ layer นี้ absolute เต็มพื้นที่ได้ถูกต้อง
     รองรับ 3 รูปแบบ (bg_type): 'image' (เดิม), 'color' (สีพื้นเดียว), 'gradient' (เส้นตรง 2 สี
     ปรับทิศทางได้ บน→ล่าง หรือ ขวา→ซ้าย) */
  function buildBgHtml(section) {
    var bgType = section.bg_type || 'image';
    var opacity = section.bg_opacity == null ? 100 : section.bg_opacity;
    var grayscale = section.bg_grayscale == null ? 0 : section.bg_grayscale;
    var baseStyle = 'opacity:' + (opacity / 100) + ';filter:grayscale(' + grayscale + '%);';

    if (bgType === 'color') {
      if (!section.bg_color) return '';
      var colorStyle = baseStyle + 'background-color:' + escapeHtml(section.bg_color) + ';';
      return '<div class="page-section__bg" style="' + colorStyle + '"></div>';
    }

    if (bgType === 'gradient') {
      if (!section.bg_gradient_from || !section.bg_gradient_to) return '';
      var direction = section.bg_gradient_direction || 'to bottom';
      var gradientStyle =
        baseStyle +
        'background-image:linear-gradient(' + escapeHtml(direction) + ', ' +
        escapeHtml(section.bg_gradient_from) + ', ' + escapeHtml(section.bg_gradient_to) + ');';
      return '<div class="page-section__bg" style="' + gradientStyle + '"></div>';
    }

    if (!section.bg_image) return '';
    var imageStyle =
      baseStyle +
      'background-image:url(\'' + String(section.bg_image).replace(/'/g, "\\'") + '\');';
    return '<div class="page-section__bg" style="' + imageStyle + '"></div>';
  }

  function hasBg(section) {
    var bgType = section.bg_type || 'image';
    if (bgType === 'color') return !!section.bg_color;
    if (bgType === 'gradient') return !!(section.bg_gradient_from && section.bg_gradient_to);
    return !!section.bg_image;
  }

  function buildSection(section) {
    var el = document.createElement('section');
    el.className = 'page-section page-section--' + (section.layout || 'image-left');
    if (hasBg(section)) el.className += ' page-section--has-bg';
    if (section.anchor_id) el.id = section.anchor_id;

    var bgHtml = buildBgHtml(section);

    // custom-html: แอดมินเขียน HTML เองทั้งหมด (เก็บใน body_th) — render ตรงๆ ไม่มี grid/media/card ครอบ
    // เพื่อให้ออกแบบ layout อิสระได้เต็มที่ (เช่น full-bleed background, custom class ของตัวเอง) ยัง sanitize
    // ด้วย DOMPurify เหมือน section แบบอื่นทุกประการ
    if (section.layout === 'custom-html') {
      el.innerHTML = bgHtml + '<div class="page-section__custom-content">' + sanitize(section.body_th) + '</div>';
      return el;
    }

    var button = '';
    if (section.button_text_th && section.button_link) {
      // button_style: 'text-link' (เดิม — btn-primary ขีดเส้นใต้ + ลูกศร), 'primary' (ปุ่มทึบ),
      // 'primary-outline' (ปุ่มขอบ) — 2 แบบหลังใช้ button_color เป็นสีได้อิสระ (fallback สี primary ของเว็บ
      // ถ้าไม่ตั้ง) ผ่าน CSS var --page-section-btn-color ตั้งอยู่นี่แทนที่จะ hardcode ใน style.css
      var btnStyle = section.button_style || 'text-link';
      var btnClass = btnStyle === 'primary' ? 'page-section__btn--primary'
        : btnStyle === 'primary-outline' ? 'page-section__btn--primary-outline'
        : 'btn-primary page-section__btn';
      var btnColorStyle = (btnStyle !== 'text-link' && section.button_color)
        ? ' style="--page-section-btn-color:' + escapeHtml(section.button_color) + '"'
        : '';
      var btnLabel = escapeHtml(section.button_text_th) + (btnStyle === 'text-link' ? ' →' : '');
      button =
        '<a href="' + escapeHtml(section.button_link) + '" class="' + btnClass + '"' + btnColorStyle + '>' +
          btnLabel +
        '</a>';
    }

    // image-top/image-bottom: รูปเรียงแถวเดียว 1-4 คอลัมน์ (ไม่ใช่ collage) — image-left/right ยังคงใช้ collage เดิม
    // แต่ละรูปใส่ลิงก์แยกได้ (image_links — parallel array ตำแหน่งตรงกับ images) ผ่าน zipImageLinks()
    var zippedImages = zipImageLinks(section.images, section.image_links);
    var mediaHtml = (section.layout === 'image-top' || section.layout === 'image-bottom')
      ? buildImageRowHtml(zippedImages, section.heading_th, section.images_grayscale !== false)
      : buildCollageHtml(zippedImages, section.heading_th, section.images_grayscale !== false);

    var headingAlign = section.heading_align || 'left';
    var titleClass = 'page-section__title' + (headingAlign !== 'left' ? ' page-section__title--' + headingAlign : '');

    el.innerHTML =
      bgHtml +
      '<div class="section-container">' +
        '<div class="page-section__grid">' +
          mediaHtml +
          '<div class="page-section__card">' +
            (section.heading_th ? '<h2 class="' + titleClass + '">' + escapeHtml(section.heading_th) + '</h2>' : '') +
            '<div class="page-section__text">' + sanitize(section.body_th) + '</div>' +
            button +
          '</div>' +
        '</div>' +
      '</div>';

    return el;
  }

  /* "Static proxy" section — สำหรับ section ที่มี JS ผูกอยู่จริงในหน้าเว็บ (เช่น ฟอร์มที่ยิงไป Edge
     Function จริง, carousel ที่ดึงข้อมูลจาก Supabase ผ่าน inline script ของหน้านั้นเอง) ซึ่งย้ายเนื้อหาเข้า
     DB มา render ใหม่แบบ async ไม่ได้ (จะทำให้ script เดิมหา container ไม่เจอตอน DOMContentLoaded แล้วพัง
     เงียบๆ) — page_sections row ประเภทนี้ไม่ได้เก็บเนื้อหาจริงใน body_th เลย (เก็บแค่ PROXY_MARKER คงที่)
     มีไว้แค่เก็บค่าพื้นหลัง (bg_*) + ลำดับ (sort_order) เท่านั้น จับคู่กับ <section> เดิมที่มีอยู่แล้วในหน้า
     ผ่าน anchor_id ที่ต้องตรงกับ id จริงเป๊ะๆ — ใช้ร่วมกันได้ทุกหน้า (index.html/career.html/ในอนาคต) ไม่ต้อง
     เขียนสคริปต์เฉพาะหน้าซ้ำทุกครั้ง */
  var PROXY_MARKER = '<!-- static-proxy -->';

  function isProxySection(section) {
    return !!section.anchor_id && (section.body_th || '').trim() === PROXY_MARKER;
  }

  // KV Banner ใช้ "static proxy" แบบเดียวกัน แต่ต่างจาก proxy อื่นตรงที่ไม่มี <section> เดิมอยู่แล้วในหน้าให้
  // จับคู่ — สร้าง container ขึ้นใหม่แล้วดึง banner จาก banners (section='kv') มา render เอง ทำให้ "รองรับ
  // การเพิ่มในทุกเพจ" ได้โดยไม่ต้องแก้ไฟล์ HTML แต่ละหน้าเลย — ⚠️ anchor_id เป็น `kv-banner-<banner id>`
  // (ไม่ใช่ค่าคงที่ 'kv-banner' ตัวเดียวเหมือนเดิมอีกต่อไป) ผูก 1 proxy row ต่อ banner 1 อันตรงๆ ผ่าน id ที่
  // ฝังอยู่ใน anchor_id เอง เพื่อให้ banner หลายอันในเพจเดียวกันจัดลำดับเทียบกับ section อื่นแยกจากกันได้อิสระ
  // (เดิมใช้ anchor_id เดียวกันหมด ทำให้ banner ทุกอันของเพจถูกจัดกลุ่มมาแสดงต่อกันที่ตำแหน่งเดียว)
  var KV_BANNER_PREFIX = 'kv-banner-';

  function isKvBannerProxy(section) {
    return typeof section.anchor_id === 'string' &&
      section.anchor_id.indexOf(KV_BANNER_PREFIX) === 0 &&
      isProxySection(section);
  }

  function kvBannerIdFromAnchor(anchorId) {
    return anchorId.slice(KV_BANNER_PREFIX.length);
  }

  function buildKvBannerContainer(banner) {
    if (!banner || !window.cpbfBanners) return null;
    var container = document.createElement('div');
    container.id = 'kvBannerContainer-' + banner.id;
    container.appendChild(window.cpbfBanners.buildKvSection(banner));
    return container;
  }

  // เพิ่ม/อัปเดตเลเยอร์พื้นหลังให้ <section> เดิมที่มีอยู่แล้วในหน้า โดยไม่แตะเนื้อหาเดิมข้างในเลย — เปิดใช้
  // เฉพาะตอนที่ตั้งค่าพื้นหลังไว้จริงเท่านั้น (ถ้าไม่ได้ตั้ง จะไม่แตะ position/overflow ของ section เดิมเลย
  // กัน regression กับเอฟเฟกต์ที่อาจพึ่ง overflow:visible อยู่ เช่น carousel/dropdown ที่ล้นขอบ)
  function applyBgToStaticElement(el, section) {
    var existingBg = el.querySelector(':scope > .page-section__bg');
    if (existingBg) existingBg.remove();

    var bgHtml = hasBg(section) ? buildBgHtml(section) : '';
    el.classList.toggle('page-section--has-bg', !!bgHtml);
    if (!bgHtml) return;

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.insertAdjacentHTML('afterbegin', bgHtml);
    Array.prototype.forEach.call(el.children, function (child) {
      if (child.classList.contains('page-section__bg')) return;
      child.style.position = 'relative';
      child.style.zIndex = '1';
    });
  }

  function renderSections(container, sections, kvBanners) {
    sections.forEach(function (section) {
      if (isKvBannerProxy(section)) {
        var bannerId = kvBannerIdFromAnchor(section.anchor_id);
        var banner = (kvBanners || []).find(function (b) { return b.id === bannerId; });
        var kvEl = buildKvBannerContainer(banner);
        if (!kvEl) return; // banner นี้ถูกลบ/ปิดใช้งานไปแล้ว — ไม่ต้องแสดงอะไรเลย
        applyBgToStaticElement(kvEl, section);
        container.appendChild(kvEl);
      } else if (isProxySection(section)) {
        var existingEl = document.getElementById(section.anchor_id);
        if (!existingEl) return; // เผื่อ element เดิมหายไปโดยไม่คาดคิด ข้ามไปเงียบๆ ไม่พังทั้งหน้า
        applyBgToStaticElement(existingEl, section);
        container.appendChild(existingEl);
      } else {
        container.appendChild(buildSection(section));
      }
    });
  }

  async function init(container) {
    if (!container || !window.cmsSupabase) return;

    var pageSlug = container.dataset.pageSlug;
    var pageKey = container.dataset.pageKey;
    var attemptedLookup = !!pageSlug || !!pageKey; // มี key/slug ให้ค้นหาจริงๆ (ไม่ใช่แค่ container เปล่า)

    var page = pageSlug
      ? await fetchPageBySlug(pageSlug)
      : pageKey
      ? await fetchPageByKey(pageKey)
      : null;

    if (!page) {
      // ไม่พบเพจ (ถูกลบ/ปิดใช้งาน/เมนูที่ผูกไว้ถูกปิดใช้งาน) — พาไปหน้า 404 ยกเว้น container แบบ additive
      // (เช่น online_shop.html ที่เนื้อหาจริงของหน้าทำงานเป็นอิสระจาก Page Management อยู่แล้ว ปิด/ลบเพจนี้
      // ไม่ควรทำให้ทั้งหน้าใช้งานไม่ได้)
      if (attemptedLookup && container.dataset.additive !== 'true') {
        window.location.replace('/404.html');
      }
      return;
    }

    var sections = await fetchSections(page.id);
    var needsKv = sections.some(isKvBannerProxy);
    var kvBanners = needsKv && window.cpbfBanners
      ? await fetchKvBanners(window.cpbfBanners.currentPage())
      : [];
    renderSections(container, sections, kvBanners);

    document.dispatchEvent(new CustomEvent('navRendered'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#pageSectionsContainer').forEach(function (container) {
      init(container);
    });
  });

  window.cpbfPages = {
    fetchPageByKey: fetchPageByKey,
    fetchPageBySlug: fetchPageBySlug,
    fetchSections: fetchSections,
    fetchKvBanners: fetchKvBanners,
    buildSection: buildSection,
    buildBgHtml: buildBgHtml, // เปิดใช้แยกจาก buildSection() — applyBgToStaticElement() ใช้ปะพื้นหลังนี้ให้
                              // static proxy section เดิม โดยไม่ต้องสร้าง section ใหม่ทั้งอัน
    hasBg: hasBg,
    renderSections: renderSections,
    init: init,
  };
})();
