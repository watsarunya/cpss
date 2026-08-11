/* i18n.js — สลับภาษาไทย/อังกฤษทั้งเว็บแบบไม่ต้องรีเฟรชหน้า
   วิธีใช้ต่อ element: เก็บข้อความไทย (ค่าเริ่มต้นของเว็บ) ไว้ในเนื้อหา/attribute ปกติ
   แล้วเพิ่ม data-en="..." (หรือ data-en-placeholder / data-en-aria-label / data-en-alt / data-en-title)
   สำหรับ element ที่เนื้อหาเริ่มต้นเป็นภาษาอังกฤษอยู่แล้ว (เช่น "Products") ให้ใส่ data-th="..." แทน
   ค่าที่ยังไม่มี attribute คู่ตรงข้าม จะถูก cache จากเนื้อหาปัจจุบันอัตโนมัติ (ไม่ต้องใส่ทั้งคู่เสมอไป) */

(function () {
  var STORAGE_KEY = 'cpbf-lang';

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'th';
  }

  function applyTextSwap(el, lang) {
    if (!el.hasAttribute('data-en') && !el.hasAttribute('data-th')) return;
    var cacheAttr = lang === 'en' ? 'data-th' : 'data-en';
    var useAttr = lang === 'en' ? 'data-en' : 'data-th';
    if (!el.hasAttribute(cacheAttr)) {
      el.setAttribute(cacheAttr, el.textContent);
    }
    if (el.hasAttribute(useAttr)) {
      el.textContent = el.getAttribute(useAttr);
    }
  }

  function applyAttrSwap(el, lang, htmlAttr, dataSuffix) {
    var enKey = 'data-en-' + dataSuffix;
    var thKey = 'data-th-' + dataSuffix;
    if (!el.hasAttribute(enKey) && !el.hasAttribute(thKey)) return;
    var cacheAttr = lang === 'en' ? thKey : enKey;
    var useAttr = lang === 'en' ? enKey : thKey;
    if (!el.hasAttribute(cacheAttr)) {
      el.setAttribute(cacheAttr, el.getAttribute(htmlAttr) || '');
    }
    if (el.hasAttribute(useAttr)) {
      el.setAttribute(htmlAttr, el.getAttribute(useAttr));
    }
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-en], [data-th]').forEach(function (el) {
      applyTextSwap(el, lang);
    });
    document.querySelectorAll('[data-en-placeholder], [data-th-placeholder]').forEach(function (el) {
      applyAttrSwap(el, lang, 'placeholder', 'placeholder');
    });
    document.querySelectorAll('[data-en-aria-label], [data-th-aria-label]').forEach(function (el) {
      applyAttrSwap(el, lang, 'aria-label', 'aria-label');
    });
    document.querySelectorAll('[data-en-alt], [data-th-alt]').forEach(function (el) {
      applyAttrSwap(el, lang, 'alt', 'alt');
    });
    document.querySelectorAll('[data-en-title], [data-th-title]').forEach(function (el) {
      applyAttrSwap(el, lang, 'title', 'title');
    });

    var codeEl = document.querySelector('.site-header__lang-code');
    if (codeEl) codeEl.textContent = lang === 'en' ? 'EN' : 'TH';

    document.querySelectorAll('.site-header__lang-option').forEach(function (opt) {
      var isActive = opt.getAttribute('data-lang') === lang;
      opt.classList.toggle('is-active', isActive);
      opt.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-th', lang !== 'en');
  }

  function setLang(next) {
    localStorage.setItem(STORAGE_KEY, next);
    applyLang(next);
  }

  function closeMenu(btn, menu) {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  function openMenu(btn, menu) {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  function bindLangSwitcher() {
    var btn = document.getElementById('langSwitcherBtn');
    var menu = document.getElementById('langSwitcherMenu');
    if (!btn || !menu || btn.dataset.i18nBound) return;
    btn.dataset.i18nBound = 'true';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) {
        openMenu(btn, menu);
      } else {
        closeMenu(btn, menu);
      }
    });

    menu.querySelectorAll('.site-header__lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setLang(opt.getAttribute('data-lang'));
        closeMenu(btn, menu);
        btn.focus();
      });
    });

    document.addEventListener('click', function (e) {
      if (!menu.hidden && !btn.contains(e.target) && !menu.contains(e.target)) {
        closeMenu(btn, menu);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) {
        closeMenu(btn, menu);
        btn.focus();
      }
    });
  }

  // ส่วนใหญ่ทุกหน้า header/footer ฝังอยู่ใน HTML โดยตรงอยู่แล้ว พร้อมตั้งแต่ DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    bindLangSwitcher();
    applyLang(getLang());
  });

  // เมนู <nav> ถูกดึงจาก Supabase มาแทนที่ทีหลังผ่าน nav-render.js (fetch แบบ async)
  // — element ใหม่ที่เพิ่งสร้างต้องได้รับการ apply ภาษาปัจจุบันซ้ำอีกครั้ง
  document.addEventListener('navRendered', function () {
    applyLang(getLang());
  });
})();
