/* footer-render.js — สร้างคอลัมน์เมนูใน footer อัตโนมัติจาก menu_items (จัดการผ่าน cms/index.html > จัดการเมนู)
   กฎ: เมนูหลักที่มีเมนูย่อย → ได้คอลัมน์ของตัวเอง (ชื่อเมนูหลักเป็นหัวคอลัมน์ เมนูย่อยเรียงเป็นลิงก์ข้างใต้)
       เมนูหลักที่ไม่มีเมนูย่อย → รวมกันอยู่ใต้คอลัมน์เดียวหัวข้อ "บริษัท" (ท้ายสุดเสมอ)
   ใช้ query เดียวกับ nav-render.js แต่แยกไฟล์กัน (คนละ container คนละจังหวะ render ไม่ผูกกัน) */
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
    node.setAttribute('data-th', th || '');
    node.setAttribute('data-en', en || th || '');
    node.textContent = currentLang() === 'en' ? (en || th || '') : (th || en || '');
  }

  function linkAttrs(item) {
    var attrs = { href: item.url || '#' };
    if (item.open_new_tab) {
      attrs.target = '_blank';
      attrs.rel = 'noopener';
    }
    return attrs;
  }

  function buildColumn(headingTh, headingEn, items) {
    var heading = el('h3', { class: 'site-footer__heading' });
    bilingualText(heading, headingTh, headingEn);

    var links = items.map(function (item) {
      var a = el('a', linkAttrs(item));
      bilingualText(a, item.name_th, item.name_en);
      return a;
    });

    return el('div', { class: 'site-footer__column' }, [heading].concat(links));
  }

  async function renderFooterMenu() {
    var container = document.getElementById('footerMenuColumns');
    if (!container || !window.cmsSupabase) return;

    var { data, error } = await window.cmsSupabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.warn('footer-render.js: โหลดเมนูจาก Supabase ไม่สำเร็จ ไม่แสดงคอลัมน์เมนูใน footer', error);
      return;
    }

    var byParent = {};
    data.forEach(function (item) {
      var key = item.parent_id || 'root';
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(item);
    });

    var roots = byParent.root || [];
    var columns = document.createDocumentFragment();
    var companyItems = [];

    roots.forEach(function (item) {
      var children = byParent[item.id] || [];
      if (children.length > 0) {
        columns.appendChild(buildColumn(item.name_th, item.name_en, children));
      } else {
        companyItems.push(item);
      }
    });

    if (companyItems.length > 0) {
      columns.appendChild(buildColumn('บริษัท', 'Company', companyItems));
    }

    container.innerHTML = '';
    container.appendChild(columns);
    document.dispatchEvent(new CustomEvent('navRendered'));
  }

  document.addEventListener('DOMContentLoaded', renderFooterMenu);
})();
