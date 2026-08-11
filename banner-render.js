/* banner-render.js — ดึง Hero Banner (แยกตามเพจ) จาก Supabase (จัดการผ่าน cms/banners.html) มา render
   กฎ: ถ้าเพจปัจจุบันไม่มีแบนเนอร์ที่ active อยู่เลย (หรือดึงข้อมูลไม่สำเร็จ) ให้ซ่อน section ทั้งหมดไปเลย
   ไม่ใช้ fallback แบบ static เหมือนเดิมอีกต่อไป เพราะ requirement ใหม่คือ "ไม่มีแบนเนอร์ = ไม่มี section"
   ⚠️ KV Banner ย้ายไป render ผ่าน page-render.js แล้ว (ไม่ auto-run ที่นี่อีกต่อไป) เพราะ KV Banner ต้อง
   จัดลำดับเทียบกับ page_sections ได้ (ผ่าน "static proxy" anchor_id='kv-banner') ซึ่งต้องรู้ตำแหน่งที่ถูกต้อง
   ก่อน insert DOM — buildKvSection() ยังอยู่ที่นี่ (เก็บ markup builder ไว้ที่เดียว) แค่ expose ผ่าน
   window.cpbfBanners ให้ page-render.js เรียกใช้แทนที่จะ duplicate โค้ด */
(function () {
  function currentLang() {
    return localStorage.getItem('cpbf-lang') === 'en' ? 'en' : 'th';
  }

  // เพจ standalone (promo.html?slug=...) ทุกอันใช้ไฟล์ "promo.html" ไฟล์เดียวกันหมด ต้องรวม slug เข้าไป
  // ในคีย์ page_url ด้วย ไม่งั้นทุกเพจ standalone จะแชร์ Hero Banner ชุดเดียวกันหมดโดยไม่ตั้งใจ — คีย์นี้ต้อง
  // ตรงกับที่ cms/banners.js สร้างตอนแอดมินเลือกเพจ standalone จาก dropdown เป๊ะๆ (encodeURIComponent(slug))
  function currentPage() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (name === 'promo.html') {
      var slug = new URLSearchParams(window.location.search).get('slug') || '';
      if (slug) return name + '?slug=' + encodeURIComponent(slug);
    }
    return name;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] === undefined || attrs[key] === null || attrs[key] === '') return;
        node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function bilingualText(node, th, en) {
    node.setAttribute('data-th', th || '');
    node.setAttribute('data-en', en || th || '');
    node.textContent = currentLang() === 'en' ? (en || th || '') : (th || en || '');
  }

  function alignClass(prefix, align) {
    var a = ['left', 'right', 'center'].indexOf(align) !== -1 ? align : 'left';
    return prefix + '--align-' + a;
  }

  function buildHeroSlide(banner) {
    var img = el('img', {
      src: currentLang() === 'en' ? (banner.image_en || banner.image_th) : (banner.image_th || banner.image_en),
      class: 'hero-showcase__bg-image',
    });
    img.setAttribute('data-th', banner.image_th || '');
    img.setAttribute('data-en', banner.image_en || banner.image_th || '');
    img.setAttribute('alt', banner.title_th || banner.title_en || '');

    var heading = el('h2', { class: 'hero-showcase__heading' });
    bilingualText(heading, banner.title_th, banner.title_en);

    var description = null;
    if (banner.description_th || banner.description_en) {
      description = el('p', { class: 'hero-showcase__description' });
      bilingualText(description, banner.description_th, banner.description_en);
    }

    var cta = null;
    if (banner.button_text) {
      var ctaLabel = document.createElement('span');
      ctaLabel.textContent = banner.button_text;
      var arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      cta = el('a', { href: banner.link_url || '#', class: 'ch-button' }, [ctaLabel, arrow]);
    }

    var overlay = el('div', { class: 'hero-showcase__overlay' }, [heading, description, cta]);
    var showcase = el('div', { class: 'hero-showcase ' + alignClass('hero-showcase', banner.text_align) }, [
      img,
      el('span', { class: 'hero-showcase__scrim', 'aria-hidden': 'true' }),
      overlay,
    ]);
    return el('div', { class: 'hero-slider__slide' }, [showcase]);
  }

  function buildKvSection(banner) {
    var img = el('img', {
      src: currentLang() === 'en' ? (banner.image_en || banner.image_th) : (banner.image_th || banner.image_en),
      class: 'kv-banner__image',
    });
    img.setAttribute('data-th', banner.image_th || '');
    img.setAttribute('data-en', banner.image_en || banner.image_th || '');
    img.setAttribute('alt', banner.title_th || banner.title_en || '');

    var title = el('h2', { class: 'kv-banner__title' });
    bilingualText(title, banner.title_th, banner.title_en);

    var contentChildren = [title];
    if (banner.description_th || banner.description_en) {
      var desc = el('p', { class: 'kv-banner__description' });
      bilingualText(desc, banner.description_th, banner.description_en);
      contentChildren.push(desc);
    }
    if (banner.button_text) {
      var btn = el('a', { href: banner.link_url || '#', class: 'kv-banner__button' });
      btn.textContent = banner.button_text;
      contentChildren.push(btn);
    }

    var content = el('div', { class: 'kv-banner__content' }, contentChildren);
    return el('section', { class: 'kv-banner ' + alignClass('kv-banner', banner.text_align) }, [
      img,
      el('div', { class: 'kv-banner__overlay', 'aria-hidden': 'true' }),
      content,
    ]);
  }

  async function renderHero() {
    var section = document.getElementById('heroSection') || document.querySelector('.hero-section');
    var track = document.getElementById('heroSliderTrack');
    if (!section || !track) return;

    if (!window.cmsSupabase) {
      section.hidden = true;
      return;
    }

    var { data, error } = await window.cmsSupabase
      .from('banners')
      .select('*')
      .eq('section', 'hero')
      .eq('page_url', currentPage())
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('banner-render.js: โหลด Hero Banner ไม่สำเร็จ ซ่อน section', error);
      section.hidden = true;
      return;
    }

    track.innerHTML = '';
    data.forEach(function (banner) {
      track.appendChild(buildHeroSlide(banner));
    });

    section.hidden = false;
    window.initHeroSlider();
    document.dispatchEvent(new CustomEvent('navRendered')); // ให้ i18n.js apply ภาษาซ้ำกับ element ใหม่
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHero();
  });

  window.cpbfBanners = {
    buildKvSection: buildKvSection,
    currentPage: currentPage,
  };
})();
