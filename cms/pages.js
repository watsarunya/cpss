/* cms/pages.js — Page Management: รายการเพจ (ผูกเมนู + standalone), เพิ่มเพจ standalone, ลบเฉพาะ standalone
   จัดการ section รายเพจอยู่ที่ page-editor.html?id=... */
(function () {
  var TABLE = 'pages';
  var items = [];
  var menuItemsById = {};
  var menuOrder = []; // menu_items ทั้งหมด (รวมที่ไม่มีเพจของตัวเอง เช่น "Our Products") เรียง depth-first ตามเว็บจริง
  var menuDepthById = {};
  var childrenCountByParent = {};
  var sectionCounts = {};
  var searchTerm = '';
  var typeFilter = '';

  var tableBody = document.getElementById('pageTableBody');
  var emptyState = document.getElementById('pageEmptyState');
  var typeFilterSelect = document.getElementById('pageTypeFilter');
  var modalOverlay = document.getElementById('pageModalOverlay');
  var form = document.getElementById('pageForm');
  var formError = document.getElementById('pageFormError');

  function itemMatchesFilters(item) {
    if (typeFilter === 'menu' && item.is_standalone) return false;
    if (typeFilter === 'standalone' && !item.is_standalone) return false;
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.title_th || '').toLowerCase().indexOf(q) !== -1 ||
      (item.title_en || '').toLowerCase().indexOf(q) !== -1 ||
      (item.page_key || '').toLowerCase().indexOf(q) !== -1 ||
      (item.slug || '').toLowerCase().indexOf(q) !== -1
    );
  }

  function pageForMenuId(menuId) {
    return items.find(function (it) { return it.menu_item_id === menuId; });
  }

  // เมนูที่ไม่มีเพจของตัวเอง (เช่น "Our Products") แต่มีลูก ให้ถือว่า "ตรงกับ filter" ถ้าลูกอย่างน้อย 1 ตัว
  // มีเพจที่ตรงกับ filter อยู่ — กันไม่ให้หัวข้อกลุ่มหายไปตอนค้นหา ทั้งที่ข้างในยังมีรายการที่ตรงอยู่
  function headerMatchesFilters(menuItem) {
    if (!searchTerm && !typeFilter) return true;
    return menuOrder.some(function (child) {
      if (child.parent_id !== menuItem.id) return false;
      var page = pageForMenuId(child.id);
      return page && itemMatchesFilters(page);
    });
  }

  function buildHeaderRow(menuItem, depth) {
    var tr = document.createElement('tr');
    tr.className = 'cms-menu-row cms-menu-row--group';
    tr.dataset.depth = String(Math.min(depth, 3));

    var td = document.createElement('td');
    td.colSpan = 6;
    var nameWrap = document.createElement('div');
    nameWrap.className = 'cms-menu-row__name';
    var iconWrap = document.createElement('span');
    iconWrap.className = 'cms-menu-row__icon';
    iconWrap.textContent = '📁';
    nameWrap.appendChild(iconWrap);
    var strong = document.createElement('strong');
    strong.textContent = menuItem.name_th + ' (เมนูหลัก — ไม่มีเพจของตัวเอง)';
    nameWrap.appendChild(strong);
    td.appendChild(nameWrap);
    tr.appendChild(td);

    return tr;
  }

  // เพจที่ "แสดงได้จริง": ผูกเมนูที่ยังมีอยู่จริง หรือเป็น standalone ตั้งใจ หรือเป็นหน้าแรก (page_key='index'
  // ไม่มีเมนูของตัวเองใน Menu Management แต่ต้องจัดการได้เสมอ) — เพจที่เคยผูกเมนูแต่เมนูถูกลบไปแล้ว
  // (menu_item_id เป็น null และไม่ใช่ standalone) จะไม่นับรวมทั้งในลิสต์และสถิติด้านบน
  function visibleItems() {
    return items.filter(function (it) { return it.is_standalone || it.menu_item_id != null || it.page_key === 'index'; });
  }

  function render() {
    tableBody.innerHTML = '';
    var rowCount = 0;

    // "หน้าแรก" ปักหมุดไว้เป็นรายการแรกสุดเสมอ (ไม่มีเมนูของตัวเองใน Menu Management เลย)
    var homePage = items.find(function (it) { return it.page_key === 'index'; });
    if (homePage && itemMatchesFilters(homePage)) {
      tableBody.appendChild(buildRow(homePage, 0));
      rowCount += 1;
    }

    menuOrder.forEach(function (menuItem) {
      var depth = menuDepthById[menuItem.id] || 0;
      var page = pageForMenuId(menuItem.id);

      if (page) {
        if (itemMatchesFilters(page)) {
          tableBody.appendChild(buildRow(page, depth));
          rowCount += 1;
        }
      } else if (childrenCountByParent[menuItem.id] && headerMatchesFilters(menuItem)) {
        tableBody.appendChild(buildHeaderRow(menuItem, depth));
      }
    });

    // เพจ standalone จริงๆ (สร้างผ่าน "+ เพิ่มเพจ standalone" ตั้งใจไม่ผูกเมนู) เรียงตามชื่อ ต่อท้ายสุด
    // ⚠️ เพจที่เคยผูกเมนูแต่เมนูถูกลบไปแล้ว (menu_item_id เป็น null แต่ is_standalone = false) จะไม่แสดงใน
    // รายการนี้อีกต่อไปตามที่ผู้ใช้ขอ (ข้อมูลเพจยังอยู่ใน DB เหมือนเดิม ไม่ได้ลบ — ถ้าสร้างเมนูใหม่ที่ url
    // ตรงกับ page_key เดิมอีกครั้ง autoCreatePageForMenuItem() ใน menu.js จะผูกกลับให้อัตโนมัติ)
    var standalonePages = items
      .filter(function (it) { return it.is_standalone; })
      .filter(itemMatchesFilters)
      .sort(function (a, b) { return (a.title_th || '').localeCompare(b.title_th || '', 'th'); });
    standalonePages.forEach(function (item) {
      tableBody.appendChild(buildRow(item, 0));
      rowCount += 1;
    });

    emptyState.hidden = rowCount > 0;
    renderStats();
  }

  function renderStats() {
    var visible = visibleItems();
    var standalone = visible.filter(function (it) { return it.is_standalone; });
    document.getElementById('statTotalPages').textContent = visible.length;
    document.getElementById('statMenuPages').textContent = visible.length - standalone.length;
    document.getElementById('statStandalonePages').textContent = standalone.length;
  }

  // URL จริงที่เปิดเพจนี้ได้ (สำหรับแสดงเป็นลิงก์ในลิสต์) — เพจ standalone เปิดผ่าน URL สะอาด
  // "<slug>.html" เสมอ (ไม่มีไฟล์ .html ของตัวเองจริงๆ แต่ Netlify rewrite ไปที่ promo.html?slug=<slug>
  // ให้อัตโนมัติแบบ 200 โดย address bar ไม่เปลี่ยน — ดูไฟล์ _redirects ที่ root), เพจที่ผูกเมนูให้ใช้ url
  // จริงของเมนูนั้น (ซึ่ง autoCreatePageForMenuItem ใน menu.js จะ auto-สลับเป็น promo.html?slug=... ให้เอง
  // ถ้าไฟล์ .html ที่ตั้งใจไว้ยังไม่มีอยู่จริง — ยังใช้รูปแบบเดิมตรงนี้เพราะ _redirects รองรับทั้งสองแบบอยู่แล้ว)
  function pageViewUrl(item) {
    if (item.page_key === 'index') return 'index.html';
    if (item.is_standalone) {
      return encodeURIComponent(item.slug || item.page_key || '') + '.html';
    }
    var menu = item.menu_item_id ? menuItemsById[item.menu_item_id] : null;
    if (menu && menu.url) return menu.url;
    return encodeURIComponent(item.slug || item.page_key || '') + '.html';
  }

  function buildRow(item, depth) {
    var tr = document.createElement('tr');
    tr.className = 'cms-menu-row';
    tr.dataset.depth = String(Math.min(depth || 0, 3));

    var tdPage = document.createElement('td');
    var nameWrap = document.createElement('div');
    nameWrap.className = 'cms-menu-row__name';

    var iconWrap = document.createElement('span');
    iconWrap.className = 'cms-menu-row__icon';
    iconWrap.textContent = item.page_key === 'index' ? '🏠' : '📄';
    nameWrap.appendChild(iconWrap);

    var textWrap = document.createElement('span');
    textWrap.className = 'cms-menu-row__text';
    var strong = document.createElement('strong');
    strong.textContent = item.title_th || '(ไม่มีชื่อ)';
    var viewUrl = pageViewUrl(item);
    var link = document.createElement('a');
    link.href = '../' + viewUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.title = 'เปิดดูหน้านี้ในแท็บใหม่';
    link.textContent = viewUrl;
    textWrap.appendChild(strong);
    textWrap.appendChild(link);
    nameWrap.appendChild(textWrap);

    tdPage.appendChild(nameWrap);
    tr.appendChild(tdPage);

    var tdType = document.createElement('td');
    var badge = document.createElement('span');
    badge.className = 'cms-badge';
    badge.textContent = item.page_key === 'index' ? 'หน้าแรก' : (item.is_standalone ? 'Standalone' : 'ผูกกับเมนู');
    tdType.appendChild(badge);
    tr.appendChild(tdType);

    var tdMenu = document.createElement('td');
    var menu = item.menu_item_id ? menuItemsById[item.menu_item_id] : null;
    if (menu) {
      tdMenu.textContent = menu.name_th;
    } else {
      tdMenu.innerHTML = '<span style="color:var(--cms-text-faint)">— ไม่มี —</span>';
    }
    tr.appendChild(tdMenu);

    var tdSections = document.createElement('td');
    tdSections.textContent = sectionCounts[item.id] || 0;
    tr.appendChild(tdSections);

    var tdStatus = document.createElement('td');
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cms-toggle' + (item.is_active ? ' is-on' : '');
    toggle.setAttribute('aria-label', item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน');
    toggle.innerHTML = '<span class="cms-toggle__knob"></span>';
    toggle.addEventListener('click', function () { toggleActive(item); });
    tdStatus.appendChild(toggle);
    tr.appendChild(tdStatus);

    var tdActions = document.createElement('td');
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'cms-row-actions';

    var manageBtn = document.createElement('a');
    manageBtn.href = 'page-editor.html?id=' + encodeURIComponent(item.id);
    manageBtn.className = 'cms-btn cms-btn--ghost';
    manageBtn.textContent = 'จัดการ Section';
    actionsWrap.appendChild(manageBtn);

    if (item.is_standalone) {
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'cms-btn cms-btn--ghost';
      deleteBtn.title = 'ลบ';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.addEventListener('click', function () { deleteItem(item); });
      actionsWrap.appendChild(deleteBtn);
    }

    tdActions.appendChild(actionsWrap);
    tr.appendChild(tdActions);

    return tr;
  }

  /* ===== Data actions ===== */

  async function loadMenuItems() {
    var { data } = await window.cmsSupabase.from('menu_items').select('id, name_th, parent_id, sort_order, url');
    var allMenuItems = data || [];
    menuItemsById = {};
    allMenuItems.forEach(function (m) { menuItemsById[m.id] = m; });

    // เดินโครงสร้างเมนูแบบ depth-first ตามลำดับจริงบนเว็บ (เมนูหลัก -> เมนูย่อยของแต่ละอันตามลำดับ)
    // เพื่อให้รายการเพจเรียงตามเมนูหลัก/เมนูย่อยตรงกับที่แสดงจริง ไม่ใช่แค่กลุ่ม top-level ก่อนแล้วค่อยเมนูย่อยทั้งหมด
    // เก็บ menu_items ทุกตัวไว้ใน menuOrder (รวมตัวที่ไม่มีเพจของตัวเอง เช่น "Our Products"/"Our Service"/"Café"
    // ซึ่งเป็นแค่ dropdown parent) เพื่อโชว์เป็นหัวข้อกลุ่มใน render() ไม่ให้หายไปจากรายการทั้งที่มีลูกอยู่จริง
    var byParent = {};
    childrenCountByParent = {};
    allMenuItems.forEach(function (m) {
      var key = m.parent_id || 'root';
      (byParent[key] = byParent[key] || []).push(m);
      if (m.parent_id) childrenCountByParent[m.parent_id] = (childrenCountByParent[m.parent_id] || 0) + 1;
    });
    Object.keys(byParent).forEach(function (key) {
      byParent[key].sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
    });

    menuOrder = [];
    menuDepthById = {};
    (function walk(parentKey, depth) {
      (byParent[parentKey] || []).forEach(function (m) {
        menuDepthById[m.id] = depth;
        menuOrder.push(m);
        walk(m.id, depth + 1);
      });
    })('root', 0);
  }

  async function loadSectionCounts() {
    var { data } = await window.cmsSupabase.from('page_sections').select('page_id');
    sectionCounts = {};
    (data || []).forEach(function (s) {
      sectionCounts[s.page_id] = (sectionCounts[s.page_id] || 0) + 1;
    });
  }

  // ⚠️🔧 เมนูที่สร้างผ่าน cms/index.html (จัดการเมนู) โดยเว้น URL ว่างไว้ (ตั้งใจให้จัดการเนื้อหาผ่าน Page
  // Management แทนที่จะพิมพ์ชื่อไฟล์ .html เอง) เดิม autoCreatePageForMenuItem() ใน menu.js จะข้ามการสร้าง
  // เพจให้เลยถ้า url ว่าง (เช็คแค่ตอนสร้างเมนูใหม่ครั้งเดียว) ทำให้เมนูเหล่านี้ไม่มีแถวใน `pages` ตาราง
  // เลยไม่โผล่ในรายการนี้ทั้งที่เป็นเมนูจริงที่ต้องจัดการ section ได้ — ฟังก์ชันนี้ไล่หาเมนูทุกตัวที่ "เป็นใบ"
  // (ไม่มีเมนูย่อย — เมนูที่มีลูกยังคงแสดงเป็นหัวข้อกลุ่มไม่มีเพจของตัวเองเหมือนเดิม) แต่ยังไม่มีเพจผูกอยู่
  // แล้วสร้างเพจเปล่าให้อัตโนมัติ พร้อมตั้ง url ของเมนูนั้นให้ชี้ไปเพจใหม่ (รูปแบบ URL สะอาด "<slug>.html"
  // ผ่าน Netlify _redirects เหมือนเพจ standalone) — รันทุกครั้งที่เปิดหน้านี้ เพื่อ backfill เมนูเก่าที่เคย
  // สร้างไว้ก่อนหน้านี้ด้วย ไม่ใช่แค่เมนูใหม่ที่จะสร้างต่อจากนี้
  async function backfillMissingPages() {
    var existingKeys = {};
    items.forEach(function (it) {
      if (it.page_key) existingKeys[it.page_key] = true;
    });

    var toCreate = menuOrder.filter(function (m) {
      return !pageForMenuId(m.id) && !childrenCountByParent[m.id];
    });
    if (toCreate.length === 0) return false;

    for (var i = 0; i < toCreate.length; i++) {
      var m = toCreate[i];
      var url = (m.url || '').trim();
      var isRealFile = !!url && url !== '#' && url.indexOf('#') === -1 && url.indexOf('?') === -1 && /\.html?$/i.test(url);

      var pageKey, slug;
      if (isRealFile) {
        pageKey = url.replace(/\.html?$/i, '');
        slug = pageKey;
      } else {
        var base = slugify(m.name_en || m.name_th || 'page') || 'page';
        slug = base;
        var n = 2;
        while (existingKeys[slug]) {
          slug = base + '-' + n;
          n += 1;
        }
        pageKey = slug;
      }
      existingKeys[pageKey] = true;

      var insertRes = await window.cmsSupabase
        .from('pages')
        .insert({
          page_key: pageKey,
          slug: slug,
          menu_item_id: m.id,
          title_th: m.name_th || '',
          title_en: m.name_en || '',
          is_standalone: false,
          is_active: true,
        })
        .select()
        .maybeSingle();

      if (!insertRes.error && !isRealFile) {
        await window.cmsSupabase.from('menu_items').update({ url: slug + '.html' }).eq('id', m.id);
      }
    }

    return true;
  }

  async function loadItems() {
    var { data, error } = await window.cmsSupabase.from(TABLE).select('*');

    if (error) {
      window.cmsToast('โหลดข้อมูลเพจไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    items = data || [];
    await loadMenuItems();

    var created = await backfillMissingPages();
    if (created) {
      var refetch = await window.cmsSupabase.from(TABLE).select('*');
      items = refetch.data || items;
    }

    await loadSectionCounts();
    render();
  }

  async function toggleActive(item) {
    var next = !item.is_active;
    item.is_active = next;
    render();
    var { error } = await window.cmsSupabase.from(TABLE).update({ is_active: next }).eq('id', item.id);
    if (error) {
      item.is_active = !next;
      render();
      window.cmsToast('อัปเดตสถานะไม่สำเร็จ: ' + error.message, 'error');
    }
  }

  async function deleteItem(item) {
    var msg = 'ลบเพจ "' + (item.title_th || item.id) + '"? Section ทั้งหมดในเพจนี้จะถูกลบไปด้วย การกระทำนี้ย้อนกลับไม่ได้';
    if (!window.confirm(msg)) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบเพจเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Add standalone page modal ===== */

  // เช็คว่าไฟล์ .html มีอยู่จริงในโปรเจกต์ไหม (fetch HEAD request จริงไปที่ root ของเว็บ — cms/pages.js
  // รันอยู่ใน cms/ ต้องขึ้น ../ ก่อนเสมอ) เน็ตหลุด/CORS ฯลฯ ให้ถือว่ามีอยู่จริงไว้ก่อน (ปลอดภัยกว่าปล่อยให้
  // สร้าง slug ที่อาจชนไฟล์จริงโดยไม่รู้ตัว — เหมือน pattern เดียวกับ menu.js's checkFileExists)
  async function checkFileExists(filename) {
    try {
      var res = await fetch('../' + filename, { method: 'HEAD', cache: 'no-store' });
      return res.ok;
    } catch (err) {
      return true;
    }
  }

  function slugify(text) {
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  var slugManuallyEdited = false;

  function openModal() {
    formError.textContent = '';
    form.reset();
    slugManuallyEdited = false;
    modalOverlay.hidden = false;
    document.getElementById('fieldPageTitleTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  function focusField(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') el.focus();
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var titleThInput = document.getElementById('fieldPageTitleTh');
    var titleEnInput = document.getElementById('fieldPageTitleEn');
    var slugInput = document.getElementById('fieldPageSlug');
    var titleTh = titleThInput.value.trim();
    var titleEn = titleEnInput.value.trim();
    var slug = slugify(slugInput.value || titleEn || titleTh);

    if (!titleTh) {
      formError.textContent = 'กรุณากรอกชื่อเพจภาษาไทย';
      focusField(titleThInput);
      return;
    }
    if (!titleEn) {
      formError.textContent = 'กรุณากรอกชื่อเพจภาษาอังกฤษ';
      focusField(titleEnInput);
      return;
    }
    if (!slug) {
      formError.textContent = 'กรุณากรอก slug';
      focusField(slugInput);
      return;
    }
    if (items.some(function (it) { return it.slug === slug; })) {
      formError.textContent = 'Slug นี้ถูกใช้ไปแล้ว กรุณาเปลี่ยน slug';
      focusField(slugInput);
      return;
    }

    // เช็คว่า <slug>.html ชนกับไฟล์ .html จริงที่มีอยู่แล้วในโปรเจกต์ไหม (เช่น "career") — ถ้าชน เพจนี้จะเปิด
    // ไม่ได้เลยแบบเงียบๆ เพราะ Netlify จะ serve ไฟล์จริงเสมอ ไม่มีวัน rewrite ไปที่ promo.html?slug=... ให้
    // (ดู _redirects ที่ root — กฎ rewrite ใช้เฉพาะ path ที่ไม่มีไฟล์จริงตรงกันเท่านั้น)
    var submitBtn = document.getElementById('pageFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังตรวจสอบ...';
    var fileCollision = await checkFileExists(slug + '.html');
    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';
    if (fileCollision) {
      formError.textContent = 'Slug "' + slug + '" ชนกับไฟล์ ' + slug + '.html ที่มีอยู่แล้วในเว็บไซต์ — เพจนี้จะเปิดไม่ได้ กรุณาเปลี่ยน slug';
      focusField(slugInput);
      return;
    }

    var payload = {
      page_key: slug,
      slug: slug,
      title_th: titleTh,
      title_en: titleEn,
      is_standalone: true,
      is_active: true,
    };

    var submitBtn = document.getElementById('pageFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result = await window.cmsSupabase.from(TABLE).insert(payload).select().maybeSingle();

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    window.cmsToast('เพิ่มเพจเรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    document.getElementById('addPageBtn').addEventListener('click', openModal);
    document.getElementById('pageModalClose').addEventListener('click', closeModal);
    document.getElementById('pageModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    // Auto-fill slug จากชื่อเพจ EN แบบ real-time ขณะพิมพ์ — หยุด auto-fill ทันทีที่แอดมินแก้ช่อง slug เอง
    // โดยตรง (ครั้งแรกที่พิมพ์ในช่อง slug เท่านั้น ไม่ใช่ทุกครั้งที่ค่าถูกเซ็ตจากโค้ด) เพื่อไม่ให้ทับค่าที่
    // แอดมินตั้งใจแก้เองไปแล้ว
    var slugInput = document.getElementById('fieldPageSlug');
    var titleEnInput = document.getElementById('fieldPageTitleEn');
    titleEnInput.addEventListener('input', function () {
      if (slugManuallyEdited) return;
      slugInput.value = slugify(titleEnInput.value);
    });
    slugInput.addEventListener('input', function () {
      slugManuallyEdited = true;
    });

    document.getElementById('pageSearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    typeFilterSelect.addEventListener('change', function () {
      typeFilter = typeFilterSelect.value;
      render();
    });

    await loadItems();
  });
})();
