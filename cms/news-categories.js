/* cms/news-categories.js — หมวดหมู่บทความ (Newsroom): CRUD, drag-and-drop reorder, search */
(function () {
  var TABLE = 'news_categories';
  var items = [];
  var editingId = null;
  var searchTerm = '';
  var draggedId = null;

  var tableBody = document.getElementById('categoryTableBody');
  var emptyState = document.getElementById('categoryEmptyState');
  var modalOverlay = document.getElementById('categoryModalOverlay');
  var modalTitle = document.getElementById('categoryModalTitle');
  var form = document.getElementById('categoryForm');
  var formError = document.getElementById('categoryFormError');

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function itemMatchesSearch(item) {
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.name_th || '').toLowerCase().indexOf(q) !== -1 ||
      (item.name_en || '').toLowerCase().indexOf(q) !== -1 ||
      (item.slug || '').toLowerCase().indexOf(q) !== -1
    );
  }

  /* ===== Render ===== */

  function render() {
    tableBody.innerHTML = '';
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
    var visible = sorted.filter(itemMatchesSearch);

    emptyState.hidden = items.length > 0;
    if (items.length > 0 && visible.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 5;
      td.style.textAlign = 'center';
      td.style.color = 'var(--cms-text-faint)';
      td.style.padding = '40px 0';
      td.textContent = 'ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา "' + searchTerm + '"';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visible.forEach(function (item) { tableBody.appendChild(buildRow(item)); });
    }

    renderStats();
  }

  function renderStats() {
    var active = items.filter(function (it) { return it.is_active; });
    document.getElementById('statTotalCategories').textContent = items.length;
    document.getElementById('statActiveCategories').textContent = active.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');
    tr.className = 'cms-menu-row';
    tr.dataset.id = item.id;
    attachRowDragEvents(tr, item);

    var tdName = document.createElement('td');
    var nameWrap = document.createElement('div');
    nameWrap.className = 'cms-menu-row__name';
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

    var tdSlug = document.createElement('td');
    var slugPill = document.createElement('span');
    slugPill.className = 'cms-url-pill';
    slugPill.textContent = item.slug || '';
    tdSlug.appendChild(slugPill);
    tr.appendChild(tdSlug);

    var tdOrder = document.createElement('td');
    var handle = document.createElement('span');
    handle.className = 'cms-drag-handle';
    handle.title = 'ลากเพื่อจัดลำดับ';
    handle.setAttribute('draggable', 'true');
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

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);
    tdActions.appendChild(actionsWrap);
    tr.appendChild(tdActions);

    return tr;
  }

  function attachRowDragEvents(tr, item) {
    tr.addEventListener('dragover', function (e) {
      if (!draggedId || draggedId === item.id) return;
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
      e.preventDefault();
      reorderItems(byId(draggedId), item, isTopHalf);
    });
  }

  /* ===== Data actions ===== */

  async function loadItems() {
    var { data, error } = await window.cmsSupabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดข้อมูลหมวดหมู่ไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    items = data || [];
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
    var { count } = await window.cmsSupabase
      .from('news_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', item.id);

    var msg = count
      ? 'ลบ "' + item.name_th + '"? มีบทความผูกอยู่กับหมวดหมู่นี้ ' + count + ' รายการ (บทความจะกลายเป็นไม่มีหมวดหมู่ ไม่ถูกลบ) การกระทำนี้ย้อนกลับไม่ได้'
      : 'ลบหมวดหมู่ "' + item.name_th + '"? การกระทำนี้ย้อนกลับไม่ได้';
    if (!window.confirm(msg)) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบหมวดหมู่เรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldCategoryActive').checked = true;

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขหมวดหมู่';
      document.getElementById('fieldCategoryNameTh').value = item.name_th || '';
      document.getElementById('fieldCategoryNameEn').value = item.name_en || '';
      document.getElementById('fieldCategorySlug').value = item.slug || '';
      document.getElementById('fieldCategoryActive').checked = !!item.is_active;
    } else {
      modalTitle.textContent = 'เพิ่มหมวดหมู่ใหม่';
    }

    modalOverlay.hidden = false;
    document.getElementById('fieldCategoryNameTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var nameThInput = document.getElementById('fieldCategoryNameTh');
    var nameEnInput = document.getElementById('fieldCategoryNameEn');
    var slugInput = document.getElementById('fieldCategorySlug');
    var nameTh = nameThInput.value.trim();
    var nameEn = nameEnInput.value.trim();
    var slug = slugInput.value.trim().toLowerCase();

    if (!nameTh) {
      formError.textContent = 'กรุณากรอกชื่อหมวดหมู่ภาษาไทย';
      nameThInput.focus();
      return;
    }
    if (!nameEn) {
      formError.textContent = 'กรุณากรอกชื่อหมวดหมู่ภาษาอังกฤษ';
      nameEnInput.focus();
      return;
    }
    if (!slug) {
      formError.textContent = 'กรุณากรอก slug';
      slugInput.focus();
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      formError.textContent = 'Slug ต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น';
      slugInput.focus();
      return;
    }

    var payload = {
      name_th: nameTh,
      name_en: nameEn,
      slug: slug,
      is_active: document.getElementById('fieldCategoryActive').checked,
    };

    var submitBtn = document.getElementById('categoryFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', editingId);
    } else {
      var maxOrder = items.length ? Math.max.apply(null, items.map(function (i) { return i.sort_order; })) : -1;
      payload.sort_order = maxOrder + 1;
      result = await window.cmsSupabase.from(TABLE).insert(payload);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = result.error.code === '23505'
        ? 'Slug นี้ถูกใช้ไปแล้ว กรุณาตั้งชื่ออื่น'
        : 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    window.cmsToast(editingId ? 'แก้ไขหมวดหมู่เรียบร้อยแล้ว' : 'เพิ่มหมวดหมู่เรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    document.getElementById('addCategoryBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('categoryModalClose').addEventListener('click', closeModal);
    document.getElementById('categoryModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    document.getElementById('categorySearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    await loadItems();
  });
})();
