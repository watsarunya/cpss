/* cms/menu.js — Menu Management: CRUD, tree render, drag-and-drop reorder, search */
(function () {
  var TABLE = 'menu_items';
  var allItems = [];
  var collapsedIds = new Set();
  var editingId = null; // null = กำลังสร้างใหม่, ไม่ null = กำลังแก้ไข id นี้
  var searchTerm = '';
  var draggedId = null;
  var imageUploadWidget = null;

  var tableBody = document.getElementById('menuTableBody');
  var emptyState = document.getElementById('menuEmptyState');
  var modalOverlay = document.getElementById('menuModalOverlay');
  var modalTitle = document.getElementById('menuModalTitle');
  var form = document.getElementById('menuForm');
  var formError = document.getElementById('menuFormError');
  var parentSelect = document.getElementById('fieldParent');

  /* เพิ่มเมนูใหม่แล้ว auto-สร้างเพจเปล่าให้ใน Page Management เลย (ผู้ใช้ขอ) — ยกเว้น url ที่ไม่ใช่เพจเดี่ยว
     จริงๆ เช่น ว่าง/"#" (dropdown parent อย่างเดียว), มี "#" (anchor ภายในหน้าเดิม), มี "?" (query filter
     เช่น products.html?category=...) ถ้าเคยมีเพจ orphan ที่ page_key ตรงกันอยู่แล้ว (ไม่ผูกเมนูไหนเลย)
     จะผูก menu_item_id ให้แทนการสร้างซ้ำ ล้มเหลวแบบเงียบๆ ได้ (เช่น ยังไม่ได้รัน schema-pages.sql) เพราะ
     การสร้างเมนูหลักไม่ควรพังตามการ auto-create เพจที่เป็นแค่ส่วนเสริม

     ⚠️ บั๊กที่แก้ในรอบนี้: เดิมถ้าแอดมินพิมพ์ url เป็นไฟล์ .html ที่ยังไม่มีอยู่จริงในโปรเจกต์ (เช่น หน้าใหม่
     ที่ยังไม่มีใครสร้างไฟล์ + ต่อสาย page-render.js ให้) เมนูใหม่จะชี้ไปหน้าที่เปิดไม่ได้ (404) ทันที เพราะ
     ระบบสร้างแค่ "แถวข้อมูลเพจ" ใน DB ให้ ไม่เคยสร้างไฟล์ .html จริงให้ (เป็นไปไม่ได้ฝั่ง client เพราะเว็บนี้
     เป็น static site ไม่มี server ให้เขียนไฟล์ใหม่ตอน runtime) — แก้โดยเช็คว่าไฟล์ที่พิมพ์มามีอยู่จริงไหมด้วย
     fetch HEAD request หลังสร้างเพจเสร็จ ถ้าไม่เจอไฟล์จริง จะสลับ url ของเมนูให้ชี้ไป promo.html?slug=...
     แทนโดยอัตโนมัติ (เหมือนเพจ standalone) ซึ่งเปิดได้ทันทีผ่าน page-render.js โดยไม่ต้องรอสร้างไฟล์ .html
     ใหม่เลย — ถ้าจะสร้างไฟล์หน้าเว็บจริงทีหลัง (มี Hero Banner ของตัวเอง ฯลฯ) ก็แก้ url กลับเป็นชื่อไฟล์จริง
     ได้เองในภายหลังที่นี่ (Menu Management) */
  async function autoCreatePageForMenuItem(menuItem) {
    try {
      var url = (menuItem.url || '').trim();
      if (!url || url === '#' || url.indexOf('#') !== -1 || url.indexOf('?') !== -1) return;
      if (!/\.html?$/i.test(url)) return;
      var pageKey = url.replace(/\.html?$/i, '');

      var existing = await window.cmsSupabase.from('pages').select('id, menu_item_id').eq('page_key', pageKey).maybeSingle();
      if (existing.error) return;

      if (existing.data) {
        if (!existing.data.menu_item_id) {
          await window.cmsSupabase.from('pages').update({ menu_item_id: menuItem.id }).eq('id', existing.data.id);
        }
      } else {
        await window.cmsSupabase.from('pages').insert({
          page_key: pageKey,
          slug: pageKey,
          menu_item_id: menuItem.id,
          title_th: menuItem.name_th || '',
          title_en: menuItem.name_en || '',
          is_standalone: false,
          is_active: true,
        });
      }

      var fileExists = await checkFileExists(url);
      if (!fileExists) {
        var fallbackUrl = 'promo.html?slug=' + encodeURIComponent(pageKey);
        await window.cmsSupabase.from(TABLE).update({ url: fallbackUrl }).eq('id', menuItem.id);
      }
    } catch (err) {
      console.warn('auto-สร้างเพจให้เมนูใหม่ไม่สำเร็จ (ไม่กระทบการสร้างเมนู):', err);
    }
  }

  // เช็คว่าไฟล์ .html ที่แอดมินพิมพ์เป็น url เมนูมีอยู่จริงในโปรเจกต์ไหม (fetch HEAD request จริงไปที่ root
  // ของเว็บ — cms/menu.js รันอยู่ใน cms/ ต้องขึ้น ../ ก่อนเสมอ) เน็ตหลุด/CORS ฯลฯ ให้ถือว่ามีอยู่จริงไว้ก่อน
  // ดีกว่าสลับ url ผิดๆ ทั้งที่ไฟล์มีอยู่จริง
  async function checkFileExists(url) {
    try {
      var res = await fetch('../' + url, { method: 'HEAD', cache: 'no-store' });
      return res.ok;
    } catch (err) {
      return true;
    }
  }

  function byId(id) {
    return allItems.find(function (it) { return it.id === id; });
  }

  function children(parentId) {
    return allItems
      .filter(function (it) { return it.parent_id === parentId; })
      .sort(function (a, b) { return a.sort_order - b.sort_order; });
  }

  function descendantIds(id) {
    var out = [];
    children(id).forEach(function (c) {
      out.push(c.id);
      out = out.concat(descendantIds(c.id));
    });
    return out;
  }

  function nextSortOrder(parentId) {
    var siblings = children(parentId);
    if (siblings.length === 0) return 0;
    var maxOrder = Math.max.apply(null, siblings.map(function (s) { return s.sort_order; }));
    return maxOrder + 1;
  }

  function attachRowDragEvents(tr, item) {
    tr.addEventListener('dragover', function (e) {
      if (!draggedId || draggedId === item.id) return;
      var dragged = byId(draggedId);
      if (!dragged || dragged.parent_id !== item.parent_id) return; // จำกัดให้ลากสลับได้เฉพาะพี่น้องกลุ่มเดียวกัน
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var rect = tr.getBoundingClientRect();
      var isTopHalf = e.clientY - rect.top < rect.height / 2;
      tr.classList.toggle('drag-over-top', isTopHalf);
      tr.classList.toggle('drag-over-bottom', !isTopHalf);
    });

    tr.addEventListener('dragleave', function () {
      tr.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    tr.addEventListener('drop', function (e) {
      var isTopHalf = tr.classList.contains('drag-over-top');
      tr.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggedId || draggedId === item.id) return;
      var dragged = byId(draggedId);
      if (!dragged || dragged.parent_id !== item.parent_id) return;
      e.preventDefault();
      reorderSiblings(dragged, item, isTopHalf);
    });
  }

  function itemMatchesSearch(item) {
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.name_th || '').toLowerCase().indexOf(q) !== -1 ||
      (item.name_en || '').toLowerCase().indexOf(q) !== -1 ||
      (item.url || '').toLowerCase().indexOf(q) !== -1
    );
  }

  function subtreeMatchesSearch(item) {
    if (itemMatchesSearch(item)) return true;
    return children(item.id).some(subtreeMatchesSearch);
  }

  /* ===== Render ===== */

  function render() {
    tableBody.innerHTML = '';
    var roots = children(null);

    if (allItems.length === 0) {
      emptyState.hidden = false;
      renderStats();
      renderParentOptions();
      return;
    }
    emptyState.hidden = true;

    var visibleRoots = roots.filter(subtreeMatchesSearch);
    if (visibleRoots.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 7;
      td.style.textAlign = 'center';
      td.style.color = 'var(--cms-text-faint)';
      td.style.padding = '40px 0';
      td.textContent = 'ไม่พบเมนูที่ตรงกับคำค้นหา "' + searchTerm + '"';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visibleRoots.forEach(function (item) {
        renderRow(item, 0);
      });
    }

    renderStats();
    renderParentOptions();
  }

  function renderRow(item, depth) {
    var kids = children(item.id).filter(subtreeMatchesSearch);
    var hasKids = kids.length > 0;
    var isCollapsed = collapsedIds.has(item.id) && !searchTerm;

    var tr = document.createElement('tr');
    tr.className = 'cms-menu-row';
    tr.dataset.id = item.id;
    tr.dataset.parentId = item.parent_id || '';
    tr.dataset.depth = String(Math.min(depth, 3));
    attachRowDragEvents(tr, item);

    // Menu Name cell
    var tdName = document.createElement('td');
    var nameWrap = document.createElement('div');
    nameWrap.className = 'cms-menu-row__name';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'cms-menu-row__toggle' + (hasKids ? '' : ' is-spacer') + (isCollapsed ? ' is-collapsed' : '');
    toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (hasKids) {
      toggleBtn.addEventListener('click', function () {
        if (collapsedIds.has(item.id)) collapsedIds.delete(item.id);
        else collapsedIds.add(item.id);
        render();
      });
    }
    nameWrap.appendChild(toggleBtn);

    var iconWrap = document.createElement('span');
    iconWrap.className = 'cms-menu-row__icon';
    iconWrap.textContent = item.icon || '📄';
    nameWrap.appendChild(iconWrap);

    var textWrap = document.createElement('span');
    textWrap.className = 'cms-menu-row__text';
    var strong = document.createElement('strong');
    strong.textContent = item.name_th || '(ไม่มีชื่อ)';
    var span = document.createElement('span');
    span.textContent = item.name_en || '';
    textWrap.appendChild(strong);
    textWrap.appendChild(span);
    nameWrap.appendChild(textWrap);

    tdName.appendChild(nameWrap);
    tr.appendChild(tdName);

    // URL cell
    var tdUrl = document.createElement('td');
    if (item.url) {
      var urlPill = document.createElement('span');
      urlPill.className = 'cms-url-pill';
      urlPill.title = item.url;
      urlPill.textContent = item.url;
      tdUrl.appendChild(urlPill);
    } else {
      tdUrl.innerHTML = '<span style="color:var(--cms-text-faint)">—</span>';
    }
    tr.appendChild(tdUrl);

    // Parent cell
    var tdParent = document.createElement('td');
    var parentItem = item.parent_id ? byId(item.parent_id) : null;
    tdParent.textContent = parentItem ? parentItem.name_th : '— Top Level —';
    tdParent.style.color = parentItem ? 'var(--cms-text)' : 'var(--cms-text-faint)';
    tr.appendChild(tdParent);

    // New tab cell
    var tdNewTab = document.createElement('td');
    tdNewTab.textContent = item.open_new_tab ? '✅' : '—';
    tr.appendChild(tdNewTab);

    // Order cell (ลาก drag handle เพื่อจัดลำดับใหม่ในกลุ่มพี่น้องเดียวกัน)
    var tdOrder = document.createElement('td');
    var handle = document.createElement('span');
    handle.className = 'cms-drag-handle';
    handle.title = 'ลากเพื่อจัดลำดับ';
    handle.setAttribute('draggable', 'true');
    handle.setAttribute('aria-hidden', 'true');
    handle.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/><circle cx="15" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="18" r="1.5" fill="currentColor"/></svg>';
    handle.addEventListener('dragstart', function (e) {
      draggedId = item.id;
      tr.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
    });
    handle.addEventListener('dragend', function () {
      draggedId = null;
      tr.classList.remove('is-dragging');
      document.querySelectorAll('.cms-menu-row').forEach(function (row) {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
      });
    });
    tdOrder.appendChild(handle);
    tr.appendChild(tdOrder);

    // Status cell
    var tdStatus = document.createElement('td');
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cms-toggle' + (item.is_active ? ' is-on' : '');
    toggle.setAttribute('aria-label', item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน');
    toggle.innerHTML = '<span class="cms-toggle__knob"></span>';
    toggle.addEventListener('click', function () { toggleActive(item); });
    tdStatus.appendChild(toggle);
    tr.appendChild(tdStatus);

    // Actions cell
    var tdActions = document.createElement('td');
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'cms-row-actions';

    // เมนูย่อยสร้างได้แค่ 1 ชั้น (รวมเมนูหลัก = 2 ระดับ) — ปุ่ม "+ ย่อย" จึงแสดงเฉพาะแถวเมนูหลัก (depth 0)
    // เท่านั้น แถวเมนูย่อย (depth 1) จะไม่มีปุ่มนี้ให้กดสร้างเมนูย่อยซ้อนอีกชั้น
    var addChildBtn = null;
    if (depth === 0) {
      addChildBtn = document.createElement('button');
      addChildBtn.type = 'button';
      addChildBtn.className = 'cms-btn cms-btn--ghost';
      addChildBtn.title = 'เพิ่มเมนูย่อยในนี้';
      addChildBtn.textContent = '+ ย่อย';
      addChildBtn.addEventListener('click', function () { openModal(null, item.id); });
    }

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'cms-btn cms-btn--ghost';
    editBtn.title = 'แก้ไข';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', function () { openModal(item.id); });

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cms-btn cms-btn--ghost';
    deleteBtn.title = 'ลบ';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', function () { deleteItem(item); });

    if (addChildBtn) actionsWrap.appendChild(addChildBtn);
    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);
    tdActions.appendChild(actionsWrap);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);

    if (hasKids && !isCollapsed) {
      kids.forEach(function (child) {
        renderRow(child, depth + 1);
      });
    }
  }

  function renderStats() {
    var topLevel = allItems.filter(function (it) { return it.parent_id === null; });
    var subMenus = allItems.filter(function (it) { return it.parent_id !== null; });
    var active = allItems.filter(function (it) { return it.is_active; });
    document.getElementById('statTotalMenus').textContent = topLevel.length;
    document.getElementById('statTotalSubmenus').textContent = subMenus.length;
    document.getElementById('statActive').textContent = active.length + ' / ' + allItems.length;
  }

  // เมนูย่อยสร้างได้แค่ 1 ชั้น (รวมเมนูหลัก = 2 ระดับ) — dropdown "Parent" จึงเสนอได้แค่เมนูระดับบนสุด
  // (depth 0) เท่านั้น ไม่ไล่ลงไปแสดงเมนูย่อยเป็นตัวเลือกต่อ ป้องกันการสร้างเมนูย่อยซ้อนเมนูย่อย (depth 2+)
  // ที่เคยสร้างได้แต่ render ผิดเพี้ยน/ไม่แสดงผลตามที่ตั้งใจ
  function renderParentOptions() {
    var excluded = editingId ? [editingId].concat(descendantIds(editingId)) : [];
    parentSelect.innerHTML = '<option value="">— ไม่มี (เมนูระดับบนสุด) —</option>';

    children(null).forEach(function (item) {
      if (excluded.indexOf(item.id) !== -1) return;
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name_th;
      parentSelect.appendChild(opt);
    });
  }

  /* ===== Data actions ===== */

  async function loadItems() {
    var { data, error } = await window.cmsSupabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดข้อมูลเมนูไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    allItems = data || [];
    render();
    await healDuplicateSortOrders();
  }

  // แก้ไขข้อมูลเก่าที่อาจมี sort_order ซ้ำกันในกลุ่มพี่น้องเดียวกัน (บั๊กเดิมตอนเพิ่มเมนูใหม่)
  // ซึ่งทำให้ลากจัดลำดับแล้วไม่มีผล เพราะสลับเลขที่เท่ากันคือ no-op — รันครั้งเดียวตอนโหลด ถ้าไม่พบปัญหาจะไม่ยิง request ใดๆ
  async function healDuplicateSortOrders() {
    var parentGroups = {};
    allItems.forEach(function (it) {
      var key = it.parent_id || 'root';
      if (!parentGroups[key]) parentGroups[key] = [];
      parentGroups[key].push(it);
    });

    var updates = [];
    Object.keys(parentGroups).forEach(function (key) {
      var group = parentGroups[key].slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
      var seen = new Set();
      var hasDuplicate = group.some(function (it) {
        if (seen.has(it.sort_order)) return true;
        seen.add(it.sort_order);
        return false;
      });
      if (!hasDuplicate) return;
      group.forEach(function (it, i) {
        if (it.sort_order !== i) {
          it.sort_order = i;
          updates.push(it);
        }
      });
    });

    if (updates.length === 0) return;

    await Promise.all(
      updates.map(function (it) {
        return window.cmsSupabase.from(TABLE).update({ sort_order: it.sort_order }).eq('id', it.id);
      })
    );
    render();
  }

  async function toggleActive(item) {
    var next = !item.is_active;
    item.is_active = next; // optimistic update
    render();
    var { error } = await window.cmsSupabase
      .from(TABLE)
      .update({ is_active: next })
      .eq('id', item.id);
    if (error) {
      item.is_active = !next;
      render();
      window.cmsToast('อัปเดตสถานะไม่สำเร็จ: ' + error.message, 'error');
    }
  }

  async function reorderSiblings(dragged, target, insertBeforeTarget) {
    var siblings = children(dragged.parent_id); // เรียงตาม sort_order เดิมอยู่แล้ว
    var withoutDragged = siblings.filter(function (s) { return s.id !== dragged.id; });
    var targetIdx = withoutDragged.findIndex(function (s) { return s.id === target.id; });
    var insertAt = insertBeforeTarget ? targetIdx : targetIdx + 1;
    withoutDragged.splice(insertAt, 0, dragged);

    // เรียงลำดับใหม่ทั้งกลุ่มเป็นเลขต่อเนื่อง กันปัญหา sort_order ซ้ำ/มีช่องว่างสะสม
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
    var kidCount = descendantIds(item.id).length;
    var msg = kidCount > 0
      ? 'ลบ "' + item.name_th + '" พร้อมเมนูย่อยทั้งหมด ' + kidCount + ' รายการ? การกระทำนี้ย้อนกลับไม่ได้'
      : 'ลบเมนู "' + item.name_th + '"? การกระทำนี้ย้อนกลับไม่ได้';
    if (!window.confirm(msg)) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบเมนูเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function openModal(id, presetParentId) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldActive').checked = true;

    renderParentOptions();

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขเมนู';
      document.getElementById('fieldNameTh').value = item.name_th || '';
      document.getElementById('fieldNameEn').value = item.name_en || '';
      document.getElementById('fieldUrl').value = item.url || '';
      document.getElementById('fieldIcon').value = item.icon || '';
      document.getElementById('fieldImage').value = item.image_url || '';
      document.getElementById('fieldNewTab').checked = !!item.open_new_tab;
      document.getElementById('fieldActive').checked = !!item.is_active;
      parentSelect.value = item.parent_id || '';
    } else {
      modalTitle.textContent = 'เพิ่มเมนูใหม่';
      parentSelect.value = presetParentId || '';
    }

    if (imageUploadWidget) imageUploadWidget.updatePreview();
    modalOverlay.hidden = false;
    document.getElementById('fieldNameTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var nameTh = document.getElementById('fieldNameTh').value.trim();
    var nameEn = document.getElementById('fieldNameEn').value.trim();
    if (!nameTh || !nameEn) {
      formError.textContent = 'กรุณากรอกชื่อเมนูทั้งภาษาไทยและอังกฤษ';
      return;
    }

    var parentId = parentSelect.value || null;
    // เมนูย่อยสร้างได้แค่ 1 ชั้น (รวมเมนูหลัก = 2 ระดับ) — กันไว้อีกชั้นตรงนี้เผื่อ dropdown มีตัวเลือกที่ไม่ใช่
    // เมนูระดับบนสุดหลุดมาได้ (ปกติ renderParentOptions() กรองให้แล้ว แต่กันเหนียวไว้ก่อนบันทึกจริงอีกที)
    if (parentId) {
      var parentItem = byId(parentId);
      if (parentItem && parentItem.parent_id) {
        formError.textContent = 'สร้างเมนูย่อยซ้อนเมนูย่อยไม่ได้ (รองรับสูงสุด 2 ระดับ) กรุณาเลือกเมนูหลักเป็น Parent แทน';
        return;
      }
    }

    var payload = {
      name_th: nameTh,
      name_en: nameEn,
      url: document.getElementById('fieldUrl').value.trim(),
      parent_id: parentId,
      icon: document.getElementById('fieldIcon').value.trim(),
      image_url: document.getElementById('fieldImage').value.trim(),
      open_new_tab: document.getElementById('fieldNewTab').checked,
      is_active: document.getElementById('fieldActive').checked,
    };

    var submitBtn = document.getElementById('menuFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', editingId);
    } else {
      payload.sort_order = nextSortOrder(payload.parent_id);
      result = await window.cmsSupabase.from(TABLE).insert(payload).select().maybeSingle();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    if (!editingId && result.data) {
      await autoCreatePageForMenuItem(result.data);
    }

    window.cmsToast(editingId ? 'แก้ไขเมนูเรียบร้อยแล้ว' : 'เพิ่มเมนูเรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    imageUploadWidget = window.cmsBindImageUpload({
      fileInput: document.getElementById('fieldImageFile'),
      urlInput: document.getElementById('fieldImage'),
      preview: document.getElementById('fieldImagePreview'),
      statusEl: document.getElementById('fieldImageStatus'),
      dropzone: document.getElementById('fieldImageDropzone'),
    });

    document.getElementById('addMenuBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('menuModalClose').addEventListener('click', closeModal);
    document.getElementById('menuModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    document.getElementById('menuSearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    await loadItems();
  });
})();
