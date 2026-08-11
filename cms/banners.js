/* cms/banners.js — Banner Management: CRUD, drag-and-drop reorder, preview, max 5 ต่อเพจ
   ทั้ง Hero Banner และ KV Banner แยกการจัดการตามหน้าเพจ (page_url) แล้ว — แต่ละเพจมีโควตา 5 แบนเนอร์ของตัวเอง
   ต่อ section คนละชุดกัน (schema-banners-v3.sql) — KV Banner แต่ละอันจัดลำดับเทียบกับ page_sections (Section
   Builder) ของเพจนั้นได้อิสระต่อกันด้วย ผ่าน "static proxy" page_sections row ของตัวเอง (anchor_id=
   `kv-banner-<banner id>` — 1 แถวต่อ banner 1 อัน ไม่ใช้ร่วมกันแล้ว) ที่ ensureKvProxySection() สร้าง/หาให้
   อัตโนมัติทุกครั้งที่บันทึก KV banner (และ removeKvProxySection() ลบให้เมื่อ banner ถูกลบ) — ดู page-render.js
   สำหรับฝั่ง render จริง */
(function () {
  var TABLE = 'banners';
  var MAX_PER_SECTION = 5;
  var currentSection = 'hero';
  var currentPage = 'index.html';
  var items = []; // เฉพาะ section (+page ถ้าเป็น hero) ปัจจุบัน
  var editingId = null;
  var draggedId = null;
  var previewLang = 'th';
  var previewItem = null;
  var pageOptionsData = { active: [], standalone: [], orphan: [] };
  var imageThUploadWidget = null;
  var imageEnUploadWidget = null;

  var grid = document.getElementById('bannerGrid');
  var emptyState = document.getElementById('bannerEmptyState');
  var addBtn = document.getElementById('addBannerBtn');
  var listLabel = document.getElementById('listLabel');
  var sectionHint = document.getElementById('sectionHint');
  var pagePicker = document.getElementById('heroPagePicker');
  var pageInput = document.getElementById('heroPageInput');

  var modalOverlay = document.getElementById('bannerModalOverlay');
  var modalTitle = document.getElementById('bannerModalTitle');
  var form = document.getElementById('bannerForm');
  var formError = document.getElementById('bannerFormError');
  var fieldPageWrap = document.getElementById('fieldPageWrap');
  var fieldPageUrl = document.getElementById('fieldPageUrl');
  var fieldTextAlign = document.getElementById('fieldTextAlign');
  var alignPicker = document.getElementById('alignPicker');

  var previewOverlay = document.getElementById('previewModalOverlay');
  var previewStage = document.getElementById('previewStage');

  var SECTION_LABELS = {
    hero: { label: 'Hero Banner', hint: 'แบนเนอร์ชิ้นบนสุดของหน้าเพจ ขนาดอ้างอิง 1440×600px — จัดการแยกตามแต่ละหน้าเพจ เลือกหน้าด้านล่างเพื่อดู/แก้ไขแบนเนอร์ของหน้านั้น' },
    kv: { label: 'KV Banner', hint: 'แบนเนอร์เสริมภายในเนื้อหาเพจ — จัดการแยกตามหน้าเพจเหมือน Hero Banner และจัดลำดับเทียบกับ Section อื่นๆ ของเพจนั้นได้ผ่านหน้า "จัดการ Section" (cms/page-editor.html)' },
  };

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function basePageName(url) {
    if (!url) return '';
    return url.split('?')[0].split('#')[0].trim();
  }

  /* ===== Page picker (ใช้ร่วมกันทั้ง Hero และ KV) =====
     รายการหน้าเพจดึงมาจากชื่อเมนู (name_th) ใน menu_items ที่ is_active = true เท่านั้น
     "หน้าแรก" (index.html) ปักหมุดไว้บนสุดเสมอ เพราะไม่มีรายการเมนูของหน้าแรกอยู่ใน Menu Management
     หน้าที่มีแบนเนอร์อยู่แล้วแต่ไม่ตรงกับเมนู active (เมนูถูกปิดใช้งาน/เป็นหน้า custom) จะต่อท้ายพร้อม tag (inactive)
     เพจ standalone (สร้างผ่าน cms/pages.html "+ เพิ่มเพจ standalone", ไม่ผูกเมนูเลย) ก็มี Hero Banner ของ
     ตัวเองได้เหมือนกัน — ใช้ "<slug>.html" (URL สะอาดที่ Netlify rewrite ไปที่ promo.html?slug=<slug> ให้
     อัตโนมัติ ดู _redirects ที่ root) เป็นคีย์ page_url แทนชื่อไฟล์ (เพจ standalone ทุกอันไม่มีไฟล์ .html
     ของตัวเองจริงๆ ต้องแยกด้วย slug ไม่งั้นชนกัน ดูหมายเหตุใน banner-render.js currentPage()) ขึ้นเป็น
     optgroup แยกต่างหากเสมอ (ไม่ต้องพึ่งเมนู active เพราะไม่มีเมนูอยู่แล้ว) */

  async function populatePageOptions() {
    var menuResult = await window.cmsSupabase.from('menu_items').select('id, name_th, url, is_active, parent_id, sort_order');
    var allItems = menuResult.data || [];
    var topLevel = allItems.filter(function (m) { return !m.parent_id; })
      .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
    var parentOrder = {};
    topLevel.forEach(function (m, i) { parentOrder[m.id] = i; });
    var children = allItems.filter(function (m) { return !!m.parent_id; })
      .sort(function (a, b) {
        var pa = parentOrder[a.parent_id] != null ? parentOrder[a.parent_id] : 999;
        var pb = parentOrder[b.parent_id] != null ? parentOrder[b.parent_id] : 999;
        if (pa !== pb) return pa - pb;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    var orderedItems = topLevel.concat(children);

    var activeLabelMap = {};
    var anyLabelMap = {};
    var activeOrder = [];
    orderedItems.forEach(function (m) {
      var p = basePageName(m.url);
      if (!p || p === '#' || p === 'index.html') return;
      if (!(p in anyLabelMap)) anyLabelMap[p] = m.name_th;
      if (m.is_active && !(p in activeLabelMap)) {
        activeLabelMap[p] = m.name_th;
        activeOrder.push(p);
      }
    });

    var standaloneResult = await window.cmsSupabase.from('pages').select('title_th, slug, is_active').eq('is_standalone', true);
    var standaloneOrder = [];
    (standaloneResult.data || []).forEach(function (pg) {
      if (!pg.slug) return;
      var p = encodeURIComponent(pg.slug) + '.html';
      if (!(p in anyLabelMap)) anyLabelMap[p] = pg.title_th;
      if (pg.is_active && !(p in activeLabelMap)) {
        activeLabelMap[p] = pg.title_th;
        standaloneOrder.push(p);
      }
    });
    standaloneOrder.sort(function (a, b) { return (activeLabelMap[a] || '').localeCompare(activeLabelMap[b] || '', 'th'); });

    var bannerPagesResult = await window.cmsSupabase.from(TABLE).select('page_url').eq('section', currentSection);
    var bannerPages = new Set();
    (bannerPagesResult.data || []).forEach(function (b) {
      if (b.page_url) bannerPages.add(b.page_url);
    });
    if (currentPage) bannerPages.add(currentPage);

    // เฉพาะหน้าที่เคยมีชื่อเมนู หรือเคยเป็นเพจ standalone (แม้จะ inactive แล้ว) เท่านั้นที่ขึ้นกลุ่ม inactive
    // — หน้ารายละเอียด (News detail, Product detail ฯลฯ) ที่ไม่เคยอยู่ในทั้งสองที่เลยจะไม่ขึ้นเป็นตัวเลือก
    // เพราะไม่ควรมี Hero Banner ให้จัดการอยู่แล้ว
    var orphanPages = Array.from(bannerPages).filter(function (p) {
      return p && p !== 'index.html' && !(p in activeLabelMap) && (p in anyLabelMap);
    }).sort();

    pageOptionsData = {
      active: activeOrder.map(function (p) { return { value: p, label: activeLabelMap[p] }; }),
      standalone: standaloneOrder.map(function (p) { return { value: p, label: activeLabelMap[p] }; }),
      orphan: orphanPages.map(function (p) { return { value: p, label: anyLabelMap[p] + ' (inactive)' }; }),
    };

    renderPageSelect(pageInput, currentPage);
    renderPageSelect(fieldPageUrl, fieldPageUrl.value || currentPage);
  }

  function renderPageSelect(selectEl, selectedValue) {
    selectEl.innerHTML = '';

    var homeOpt = document.createElement('option');
    homeOpt.value = 'index.html';
    homeOpt.textContent = 'หน้าแรก';
    selectEl.appendChild(homeOpt);

    pageOptionsData.active.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.value;
      opt.textContent = p.label;
      selectEl.appendChild(opt);
    });

    if (pageOptionsData.standalone.length > 0) {
      var standaloneGroup = document.createElement('optgroup');
      standaloneGroup.label = 'เพจ Standalone';
      pageOptionsData.standalone.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.value;
        opt.textContent = p.label;
        standaloneGroup.appendChild(opt);
      });
      selectEl.appendChild(standaloneGroup);
    }

    if (pageOptionsData.orphan.length > 0) {
      var group = document.createElement('optgroup');
      group.label = 'ไม่อยู่ในเมนู Active';
      pageOptionsData.orphan.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.value;
        opt.textContent = p.label;
        group.appendChild(opt);
      });
      selectEl.appendChild(group);
    }

    selectEl.value = selectedValue || 'index.html';
    if (selectEl.value !== (selectedValue || 'index.html')) {
      var fallback = document.createElement('option');
      fallback.value = selectedValue;
      fallback.textContent = selectedValue + ' (inactive)';
      selectEl.appendChild(fallback);
      selectEl.value = selectedValue;
    }
  }

  function selectedPageLabel(selectEl) {
    var opt = selectEl.options[selectEl.selectedIndex];
    return opt ? opt.textContent : selectEl.value;
  }

  /* ===== Render ===== */

  function render() {
    grid.innerHTML = '';
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

    emptyState.hidden = sorted.length > 0;
    emptyState.textContent = currentSection === 'hero'
      ? 'หน้า "' + currentPage + '" ยังไม่มีแบนเนอร์ — กด "+ Add Banner" เพื่อเริ่มสร้างรายการแรก (ถ้าไม่เพิ่ม หน้านี้จะไม่แสดง Hero Banner เลย)'
      : 'ยังไม่มีแบนเนอร์ในหมวดนี้ — กด "+ Add Banner" เพื่อเริ่มสร้างรายการแรก';
    sorted.forEach(function (item) {
      grid.appendChild(buildCard(item));
    });

    renderStats();
    addBtn.disabled = items.length >= MAX_PER_SECTION;
    addBtn.title = addBtn.disabled ? 'ครบโควตาสูงสุด ' + MAX_PER_SECTION + ' แบนเนอร์แล้ว' : '';
  }

  function renderStats() {
    var active = items.filter(function (it) { return it.is_active; });
    document.getElementById('statTotalBanners').textContent = items.length + ' / ' + MAX_PER_SECTION;
    document.getElementById('statActiveBanners').textContent = active.length;
    document.getElementById('statInactiveBanners').textContent = items.length - active.length;
  }

  function buildCard(item) {
    var card = document.createElement('div');
    card.className = 'cms-banner-card';
    card.dataset.id = item.id;
    attachCardDragEvents(card, item);

    var thumb = document.createElement('div');
    thumb.className = 'cms-banner-card__thumb';
    if (item.image_th) {
      thumb.style.backgroundImage = 'url(\'' + item.image_th.replace(/'/g, "\\'") + '\')';
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'cms-banner-card__thumb-empty';
      placeholder.textContent = 'ยังไม่มีรูป';
      thumb.appendChild(placeholder);
    }
    var badge = document.createElement('span');
    badge.className = 'cms-banner-card__badge';
    badge.textContent = item.is_active ? 'Active' : 'Inactive';
    thumb.appendChild(badge);
    card.appendChild(thumb);

    var body = document.createElement('div');
    body.className = 'cms-banner-card__body';

    var title = document.createElement('p');
    title.className = 'cms-banner-card__title';
    title.textContent = item.title_th || item.title_en || '(ไม่มีหัวข้อ)';
    body.appendChild(title);

    var meta = document.createElement('p');
    meta.className = 'cms-banner-card__meta';
    meta.textContent = (item.link_url || 'ไม่มีลิงก์') + ' · ' + (item.text_align || 'left');
    body.appendChild(meta);

    var row = document.createElement('div');
    row.className = 'cms-banner-card__row';

    var handle = document.createElement('span');
    handle.className = 'cms-banner-card__drag';
    handle.title = 'ลากเพื่อจัดลำดับ';
    handle.setAttribute('draggable', 'true');
    handle.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/><circle cx="15" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="18" r="1.5" fill="currentColor"/></svg>';
    handle.addEventListener('dragstart', function (e) {
      draggedId = item.id;
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
    });
    handle.addEventListener('dragend', function () {
      draggedId = null;
      card.classList.remove('is-dragging');
      document.querySelectorAll('.cms-banner-card').forEach(function (c) {
        c.classList.remove('drag-over-before', 'drag-over-after');
      });
    });
    row.appendChild(handle);

    var actions = document.createElement('div');
    actions.className = 'cms-banner-card__actions';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cms-toggle' + (item.is_active ? ' is-on' : '');
    toggle.setAttribute('aria-label', item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน');
    toggle.innerHTML = '<span class="cms-toggle__knob"></span>';
    toggle.addEventListener('click', function () { toggleActive(item); });
    actions.appendChild(toggle);

    var previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'cms-btn cms-btn--ghost';
    previewBtn.title = 'Preview';
    previewBtn.innerHTML = '👁️';
    previewBtn.addEventListener('click', function () { openPreview(item); });
    actions.appendChild(previewBtn);

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'cms-btn cms-btn--ghost';
    editBtn.title = 'แก้ไข';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', function () { openModal(item.id); });
    actions.appendChild(editBtn);

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cms-btn cms-btn--ghost';
    deleteBtn.title = 'ลบ';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', function () { deleteItem(item); });
    actions.appendChild(deleteBtn);

    row.appendChild(actions);
    body.appendChild(row);
    card.appendChild(body);

    return card;
  }

  function attachCardDragEvents(card, item) {
    card.addEventListener('dragover', function (e) {
      if (!draggedId || draggedId === item.id) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var rect = card.getBoundingClientRect();
      var isBeforeHalf = e.clientX - rect.left < rect.width / 2;
      card.classList.toggle('drag-over-before', isBeforeHalf);
      card.classList.toggle('drag-over-after', !isBeforeHalf);
    });
    card.addEventListener('dragleave', function () {
      card.classList.remove('drag-over-before', 'drag-over-after');
    });
    card.addEventListener('drop', function (e) {
      var isBeforeHalf = card.classList.contains('drag-over-before');
      card.classList.remove('drag-over-before', 'drag-over-after');
      if (!draggedId || draggedId === item.id) return;
      e.preventDefault();
      reorderItems(byId(draggedId), item, isBeforeHalf);
    });
  }

  /* ===== Data actions ===== */

  async function loadItems() {
    var query = window.cmsSupabase.from(TABLE).select('*').eq('section', currentSection).eq('page_url', currentPage);
    var { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดข้อมูลแบนเนอร์ไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    items = data || [];
    await healDuplicateSortOrders();
    render();
  }

  async function healDuplicateSortOrders() {
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
    var seen = new Set();
    var hasDuplicate = sorted.some(function (it) {
      if (seen.has(it.sort_order)) return true;
      seen.add(it.sort_order);
      return false;
    });
    if (!hasDuplicate) return;

    var updates = [];
    sorted.forEach(function (it, i) {
      if (it.sort_order !== i) {
        it.sort_order = i;
        updates.push(it);
      }
    });
    if (updates.length === 0) return;

    await Promise.all(
      updates.map(function (it) {
        return window.cmsSupabase.from(TABLE).update({ sort_order: it.sort_order }).eq('id', it.id);
      })
    );
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

  async function reorderItems(dragged, target, insertBeforeTarget) {
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
    var withoutDragged = sorted.filter(function (s) { return s.id !== dragged.id; });
    var targetIdx = withoutDragged.findIndex(function (s) { return s.id === target.id; });
    var insertAt = insertBeforeTarget ? targetIdx : targetIdx + 1;
    withoutDragged.splice(insertAt, 0, dragged);
    withoutDragged.forEach(function (s, i) { s.sort_order = i; });
    render();

    var results = await Promise.all(
      withoutDragged.map(function (s) {
        return window.cmsSupabase.from(TABLE).update({ sort_order: s.sort_order }).eq('id', s.id);
      })
    );
    var failed = results.find(function (r) { return r.error; });
    if (failed) {
      window.cmsToast('เรียงลำดับไม่สำเร็จ: ' + failed.error.message, 'error');
      await loadItems();
    }
  }

  async function deleteItem(item) {
    var msg = 'ลบแบนเนอร์ "' + (item.title_th || item.title_en || item.id) + '"? การกระทำนี้ย้อนกลับไม่ได้';
    if (!window.confirm(msg)) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    if (currentSection === 'kv') {
      await removeKvProxySection(item.id); // เอา section card ของ banner นี้ออกจาก page-editor.html ด้วย
    }
    window.cmsToast('ลบแบนเนอร์เรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function setAlign(align) {
    fieldTextAlign.value = align;
    alignPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.align === align);
    });
  }

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldBannerActive').checked = true;
    setAlign('left');

    fieldPageWrap.hidden = false;
    fieldPageUrl.required = true;
    fieldPageUrl.value = currentPage;

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขแบนเนอร์';
      document.getElementById('fieldImageTh').value = item.image_th || '';
      document.getElementById('fieldImageEn').value = item.image_en || '';
      document.getElementById('fieldTitleTh').value = item.title_th || '';
      document.getElementById('fieldTitleEn').value = item.title_en || '';
      document.getElementById('fieldDescTh').value = item.description_th || '';
      document.getElementById('fieldDescEn').value = item.description_en || '';
      document.getElementById('fieldButtonText').value = item.button_text || '';
      document.getElementById('fieldLinkUrl').value = item.link_url || '';
      document.getElementById('fieldBannerActive').checked = !!item.is_active;
      setAlign(item.text_align || 'left');
      fieldPageUrl.value = item.page_url || currentPage;
    } else {
      modalTitle.textContent = 'เพิ่มแบนเนอร์ใหม่ (' + SECTION_LABELS[currentSection].label + ')';
    }

    if (imageThUploadWidget) imageThUploadWidget.updatePreview();
    if (imageEnUploadWidget) imageEnUploadWidget.updatePreview();

    modalOverlay.hidden = false;
    document.getElementById('fieldImageTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  /* ให้ KV Banner แต่ละอันจัดลำดับเทียบกับ section อื่นได้อิสระต่อกันผ่าน cms/page-editor.html — สร้าง
     (ถ้ายังไม่มี) "static proxy" page_sections row ของตัวเอง ต่อ banner 1 อัน (anchor_id=`kv-banner-<id>`
     ผูกกับ banner นั้นตรงๆ ผ่าน id — ⚠️ เปลี่ยนจากเดิม 2026-08-01: แต่ก่อน anchor_id เป็นค่าคงที่ 'kv-banner'
     ตัวเดียวใช้ร่วมกันทั้งเพจ (banner หลายอันในเพจเดียวกันจะถูกจัดกลุ่มมาแสดงต่อกันที่ตำแหน่งเดียว ย้ายทีละอัน
     แยกกันไม่ได้) ตอนนี้แยกเป็นคนละ row คนละตำแหน่งแล้ว ดูหัวข้อ "ระบบ Banner" ใน CLAUDE.md) วางไว้ท้ายสุดของ
     ลำดับปัจจุบันเสมอ (page-render.js เป็นคนหา banner จริงตาม id ที่ฝังใน anchor_id มา render ตอนเจอ proxy
     row นี้ — ดูหมายเหตุใน page-render.js) ล้มเหลวแบบเงียบๆ ได้ถ้าหาเพจไม่เจอ (เช่น page_url เป็นหน้าที่ยังไม่มี
     แถวใน pages ตาราง) เพราะไม่ควรทำให้การบันทึก KV banner พังตามส่วนเสริมนี้ */
  async function ensureKvProxySection(pageUrl, bannerId) {
    var keyGuess = decodeURIComponent(pageUrl || '').replace(/\.html$/, '');
    if (!keyGuess || !bannerId) return;
    var anchorId = 'kv-banner-' + bannerId;

    var pageResult = await window.cmsSupabase
      .from('pages')
      .select('id')
      .or('page_key.eq.' + keyGuess + ',slug.eq.' + keyGuess)
      .limit(1)
      .maybeSingle();
    var pageId = pageResult.data && pageResult.data.id;
    if (!pageId) return;

    var existingResult = await window.cmsSupabase
      .from('page_sections')
      .select('id')
      .eq('page_id', pageId)
      .eq('anchor_id', anchorId)
      .maybeSingle();
    if (existingResult.data) return;

    var maxOrderResult = await window.cmsSupabase
      .from('page_sections')
      .select('sort_order')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    var nextOrder = maxOrderResult.data ? maxOrderResult.data.sort_order + 1 : 0;

    await window.cmsSupabase.from('page_sections').insert({
      page_id: pageId,
      anchor_id: anchorId,
      layout: 'custom-html',
      body_th: '<!-- static-proxy -->',
      is_active: true,
      sort_order: nextOrder,
    });
  }

  // ลบ proxy section ของ banner นี้ทิ้งเมื่อ banner ถูกลบ (กันการ์ด "KV Banner" ค้างเปล่าใน page-editor.html
  // ที่ไม่มี banner จริงให้ render อีกต่อไป) — ล้มเหลวแบบเงียบๆ ได้เหมือนกัน ไม่ควรทำให้การลบ banner พัง
  async function removeKvProxySection(bannerId) {
    if (!bannerId) return;
    await window.cmsSupabase.from('page_sections').delete().eq('anchor_id', 'kv-banner-' + bannerId);
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var pageForQuota = fieldPageUrl.value.trim();
    var isSamePageAsCurrentList = pageForQuota === currentPage;
    var quotaCount = isSamePageAsCurrentList ? items.length : 0; // แก้ไข/เพิ่มเพจอื่นนอกรายการที่กำลังดู ให้เช็คแยกตอน insert ผ่าน DB trigger

    if (!editingId && isSamePageAsCurrentList && quotaCount >= MAX_PER_SECTION) {
      formError.textContent = 'ครบโควตาสูงสุด ' + MAX_PER_SECTION + ' แบนเนอร์แล้ว';
      return;
    }

    var imageTh = document.getElementById('fieldImageTh').value.trim();
    var imageEn = document.getElementById('fieldImageEn').value.trim();
    if (!imageTh || !imageEn) {
      formError.textContent = 'กรุณาใส่ URL รูปภาพทั้งภาษาไทยและอังกฤษ';
      return;
    }

    if (!pageForQuota) {
      formError.textContent = 'กรุณาระบุหน้าเพจที่แบนเนอร์นี้จะแสดง';
      return;
    }

    var payload = {
      section: currentSection,
      page_url: pageForQuota,
      image_th: imageTh,
      image_en: imageEn,
      title_th: document.getElementById('fieldTitleTh').value.trim(),
      title_en: document.getElementById('fieldTitleEn').value.trim(),
      description_th: document.getElementById('fieldDescTh').value.trim(),
      description_en: document.getElementById('fieldDescEn').value.trim(),
      button_text: document.getElementById('fieldButtonText').value.trim(),
      link_url: document.getElementById('fieldLinkUrl').value.trim(),
      text_align: fieldTextAlign.value || 'left',
      is_active: document.getElementById('fieldBannerActive').checked,
    };

    var submitBtn = document.getElementById('bannerFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', editingId);
    } else {
      var siblingOrders = isSamePageAsCurrentList
        ? items.map(function (i) { return i.sort_order; })
        : [];
      payload.sort_order = siblingOrders.length === 0 ? 0 : Math.max.apply(null, siblingOrders) + 1;
      // .select('id') เพื่อเอา id ของแถวใหม่กลับมาผูก proxy section (kv-banner-<id>) ต่อได้ทันที
      result = await window.cmsSupabase.from(TABLE).insert(payload).select('id').single();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    window.cmsToast(editingId ? 'แก้ไขแบนเนอร์เรียบร้อยแล้ว' : 'เพิ่มแบนเนอร์เรียบร้อยแล้ว', 'success');
    closeModal();
    await populatePageOptions(); // เพจอาจเป็นเพจใหม่ที่ยังไม่เคยอยู่ใน datalist มาก่อน
    if (currentSection === 'kv') {
      // banner นี้จัดลำดับเทียบกับ section อื่นแยกจาก KV banner อื่นๆ ได้ — id เอาจาก editingId (แก้ไข)
      // หรือจากแถวที่เพิ่ง insert (เพิ่มใหม่)
      var bannerId = editingId || (result.data && result.data.id);
      await ensureKvProxySection(pageForQuota, bannerId);
    }
    await loadItems();
  }

  /* ===== Preview ===== */

  function openPreview(item) {
    previewItem = item;
    previewLang = 'th';
    document.querySelectorAll('#previewLangToggle button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.lang === 'th');
    });
    renderPreview();
    previewOverlay.hidden = false;
  }

  function closePreview() {
    previewOverlay.hidden = true;
    previewItem = null;
  }

  function alignToFlex(align) {
    if (align === 'right') return 'flex-end';
    if (align === 'center') return 'center';
    return 'flex-start';
  }

  function renderPreview() {
    if (!previewItem) return;
    var lang = previewLang;
    var align = previewItem.text_align || 'left';
    var image = lang === 'en' ? (previewItem.image_en || previewItem.image_th) : (previewItem.image_th || previewItem.image_en);
    var title = lang === 'en' ? (previewItem.title_en || previewItem.title_th) : (previewItem.title_th || previewItem.title_en);
    var desc = lang === 'en' ? (previewItem.description_en || previewItem.description_th) : (previewItem.description_th || previewItem.description_en);
    var button = previewItem.button_text || '';

    previewStage.innerHTML = '';

    if (currentSection === 'hero') {
      var showcase = document.createElement('div');
      showcase.style.cssText = 'position:relative; width:100%; max-width:800px; aspect-ratio:1440/600; border-radius:12px; overflow:hidden; background:#1a1a2e;';
      if (image) {
        showcase.style.backgroundImage = 'url(\'' + image.replace(/'/g, "\\'") + '\')';
        showcase.style.backgroundSize = 'cover';
        showcase.style.backgroundPosition = 'center';
      }
      var scrimDir = align === 'right' ? '270deg' : align === 'center' ? '180deg' : '90deg';
      var scrim = document.createElement('div');
      scrim.style.cssText = 'position:absolute; inset:0; background:linear-gradient(' + scrimDir + ', rgb(0 0 0 / 55%) 0%, rgb(0 0 0 / 10%) 60%);';
      showcase.appendChild(scrim);

      var overlay = document.createElement('div');
      var justify = alignToFlex(align);
      overlay.style.cssText = 'position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:' + justify + '; padding:0 6%; text-align:' + align + '; color:#fff; font-family:var(--cms-font);';
      overlay.innerHTML =
        '<div style="max-width:60%; font-size:clamp(18px,3vw,30px); font-weight:800; line-height:1.2; margin-bottom:14px;">' + escapeHtml(title || '') + '</div>' +
        (desc ? '<div style="max-width:60%; font-size:13px; opacity:.9; margin-bottom:14px;">' + escapeHtml(desc) + '</div>' : '') +
        (button ? '<div style="display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:13px; border-bottom:2px solid #fff; padding-bottom:3px;">' + escapeHtml(button) + ' &#8594;</div>' : '');
      showcase.appendChild(overlay);
      previewStage.appendChild(showcase);
    } else {
      var kv = document.createElement('div');
      kv.style.cssText = 'position:relative; width:100%; max-width:800px; aspect-ratio:1440/500; border-radius:12px; overflow:hidden; background:#1a1a2e; display:flex; align-items:center; justify-content:' + alignToFlex(align) + '; text-align:' + align + '; padding:0 60px;';
      if (image) {
        kv.style.backgroundImage = 'url(\'' + image.replace(/'/g, "\\'") + '\')';
        kv.style.backgroundSize = 'cover';
        kv.style.backgroundPosition = 'center';
      }
      var kvScrim = document.createElement('div');
      kvScrim.style.cssText = 'position:absolute; inset:0; background:rgb(0 0 0 / 45%);';
      kv.appendChild(kvScrim);
      var kvContent = document.createElement('div');
      kvContent.style.cssText = 'position:relative; color:#fff; font-family:var(--cms-font);';
      kvContent.innerHTML =
        '<div style="font-size:clamp(20px,4vw,34px); font-weight:800; letter-spacing:.04em; margin-bottom:16px;">' + escapeHtml(title || '') + '</div>' +
        (desc ? '<div style="font-size:13px; opacity:.9; margin-bottom:16px;">' + escapeHtml(desc) + '</div>' : '') +
        (button ? '<div style="display:inline-block; padding:10px 22px; border-radius:999px; background:#fff; color:#111; font-weight:700; font-size:13px;">' + escapeHtml(button) + '</div>' : '');
      kv.appendChild(kvContent);
      previewStage.appendChild(kv);
    }
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }

  /* ===== Tabs ===== */

  async function switchSection(section) {
    currentSection = section;
    document.getElementById('tabHero').classList.toggle('is-active', section === 'hero');
    document.getElementById('tabHero').setAttribute('aria-selected', String(section === 'hero'));
    document.getElementById('tabKv').classList.toggle('is-active', section === 'kv');
    document.getElementById('tabKv').setAttribute('aria-selected', String(section === 'kv'));
    sectionHint.textContent = SECTION_LABELS[section].hint;
    pagePicker.hidden = false;

    await populatePageOptions();
    listLabel.textContent = SECTION_LABELS[section].label + ' — ' + selectedPageLabel(pageInput);
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    imageThUploadWidget = window.cmsBindImageUpload({
      fileInput: document.getElementById('fieldImageThFile'),
      urlInput: document.getElementById('fieldImageTh'),
      preview: document.getElementById('fieldImageThPreview'),
      statusEl: document.getElementById('fieldImageThStatus'),
      dropzone: document.getElementById('fieldImageThDropzone'),
    });
    imageEnUploadWidget = window.cmsBindImageUpload({
      fileInput: document.getElementById('fieldImageEnFile'),
      urlInput: document.getElementById('fieldImageEn'),
      preview: document.getElementById('fieldImageEnPreview'),
      statusEl: document.getElementById('fieldImageEnStatus'),
      dropzone: document.getElementById('fieldImageEnDropzone'),
    });

    document.getElementById('tabHero').addEventListener('click', function () { switchSection('hero'); });
    document.getElementById('tabKv').addEventListener('click', function () { switchSection('kv'); });

    pageInput.addEventListener('change', function () {
      currentPage = pageInput.value || 'index.html';
      listLabel.textContent = SECTION_LABELS[currentSection].label + ' — ' + selectedPageLabel(pageInput);
      loadItems();
    });

    alignPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setAlign(btn.dataset.align); });
    });

    document.getElementById('addBannerBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('bannerModalClose').addEventListener('click', closeModal);
    document.getElementById('bannerModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    form.addEventListener('submit', submitForm);

    document.getElementById('previewModalClose').addEventListener('click', closePreview);
    previewOverlay.addEventListener('click', function (e) { if (e.target === previewOverlay) closePreview(); });
    document.querySelectorAll('#previewLangToggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        previewLang = btn.dataset.lang;
        document.querySelectorAll('#previewLangToggle button').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        renderPreview();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!modalOverlay.hidden) closeModal();
      if (!previewOverlay.hidden) closePreview();
    });

    switchSection('hero');
  });
})();
