/* nav-render.js — ดึงเมนูจาก Supabase (จัดการผ่าน cms/) มาสร้าง <nav class="site-header__nav"> จริง
   แทนที่เนื้อหา static เดิมใน <nav id="siteHeaderNav"><ul>...</ul></nav> ทันทีที่โหลดสำเร็จ
   ถ้าดึงข้อมูลไม่สำเร็จ (เน็ตหลุด/ตั้งค่าไม่ครบ) จะคงเมนู static เดิมไว้เป็น fallback ไม่ทำหน้าเว็บพัง
   รองรับแค่ 2 ระดับในการแสดงผล (เมนูหลัก + เมนูย่อยแบบ mega-dropdown) ตรงกับ CSS ปัจจุบัน —
   ถ้ามีเมนูระดับที่ 3 ขึ้นไปใน CMS จะไม่ถูกแสดงใน header (เก็บไว้ใช้กับส่วนอื่นในอนาคตได้) */
(function () {
  var LANG_KEY = 'cpbf-lang';

  function currentLang() {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'th';
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
    node.setAttribute('data-th', th);
    node.setAttribute('data-en', en);
    node.textContent = currentLang() === 'en' ? en : th;
  }

  function linkAttrs(item) {
    var attrs = { href: item.url || '#' };
    if (item.open_new_tab) {
      attrs.target = '_blank';
      attrs.rel = 'noopener';
    }
    return attrs;
  }

  function buildSimpleItem(item) {
    var a = el('a', linkAttrs(item));
    bilingualText(a, item.name_th, item.name_en);
    return el('li', null, [a]);
  }

  function buildDropdownItem(item, children) {
    var trigger = el('a', linkAttrs(item));
    bilingualText(trigger, item.name_th, item.name_en);

    var list = el('ul', { class: 'nav-dropdown__list' });
    children.forEach(function (child) {
      var a = el('a', linkAttrs(child));
      bilingualText(a, child.name_th, child.name_en);
      list.appendChild(el('li', null, [a]));
    });

    var withImages = children.filter(function (c) { return !!c.image_url; });
    // rev.CPSS — เฉพาะเมนูย่อยที่มีรูปจริง (children.image_url) เท่านั้นถึงจะใช้ full-width mega panel + gallery
    // เดิม (เมนูยุค B&F) — ถ้าไม่มีรูปเลย (เมนู CPSS ทั่วไป ไม่มี gallery) ใช้ dropdown การ์ดแบบกะทัดรัดปกติแทน
    var isMega = withImages.length > 0;

    var dropdownContent = list;
    if (isMega) {
      var gallery = el('div', { class: 'nav-dropdown__gallery' });
      withImages.forEach(function (child) {
        var img = el('img', { src: child.image_url, class: 'nav-dropdown__gallery-image' });
        img.setAttribute('data-th-alt', child.name_th);
        img.setAttribute('data-en-alt', child.name_en);
        img.setAttribute('alt', currentLang() === 'en' ? child.name_en : child.name_th);

        var label = el('span', { class: 'nav-dropdown__gallery-label' });
        bilingualText(label, child.name_th, child.name_en);

        var galleryLink = el('a', Object.assign({ class: 'nav-dropdown__gallery-item' }, linkAttrs(child)), [
          img,
          el('span', { class: 'nav-dropdown__gallery-overlay', 'aria-hidden': 'true' }),
          label,
        ]);
        gallery.appendChild(galleryLink);
      });
      dropdownContent = el('div', { class: 'nav-dropdown__mega-inner' }, [list, gallery]);
    }

    var dropdown = el('div', { class: 'nav-dropdown' + (isMega ? ' nav-dropdown--mega' : '') }, [dropdownContent]);
    return el('li', { class: 'has-dropdown' + (isMega ? ' has-dropdown--mega' : '') }, [trigger, dropdown]);
  }

  function rebindMobileBehavior(nav) {
    var hamburger = document.getElementById('headerHamburger');
    if (!hamburger) return;

    function closeMenu() {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      nav.querySelectorAll('.has-dropdown.is-open').forEach(function (li) {
        li.classList.remove('is-open');
      });
    }

    nav.querySelectorAll('.has-dropdown > a').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth > 900) return;
        e.preventDefault();
        var li = trigger.parentElement;
        var wasOpen = li.classList.contains('is-open');
        nav.querySelectorAll('.has-dropdown.is-open').forEach(function (openLi) {
          if (openLi !== li) openLi.classList.remove('is-open');
        });
        li.classList.toggle('is-open', !wasOpen);
      });
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth > 900) return;
        if (link.parentElement.classList.contains('has-dropdown') && link.parentElement.parentElement === nav.querySelector('ul')) {
          return;
        }
        closeMenu();
      });
    });
  }

  async function renderNav() {
    var nav = document.getElementById('siteHeaderNav');
    if (!nav || !window.cmsSupabase) return;
    var listEl = nav.querySelector(':scope > ul');
    if (!listEl) return;

    var { data, error } = await window.cmsSupabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('nav-render.js: โหลดเมนูจาก Supabase ไม่สำเร็จ ใช้เมนู static เดิมแทน', error);
      return;
    }

    var byParent = {};
    data.forEach(function (item) {
      var key = item.parent_id || 'root';
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(item);
    });

    var roots = byParent.root || [];
    var newList = document.createElement('ul');

    roots.forEach(function (item) {
      var children = byParent[item.id] || [];
      if (children.length > 0) {
        newList.appendChild(buildDropdownItem(item, children));
      } else {
        newList.appendChild(buildSimpleItem(item));
      }
    });

    listEl.replaceWith(newList);
    rebindMobileBehavior(nav);
    document.dispatchEvent(new CustomEvent('navRendered'));
  }

  document.addEventListener('DOMContentLoaded', renderNav);
})();
