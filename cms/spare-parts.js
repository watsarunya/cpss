/* cms/spare-parts.js — Spare Parts Library: CRUD, drag-and-drop reorder, อัปโหลดรูปหน้าปก + ไฟล์ PDF, search
   โครงเดียวกับ cms/product-categories.js (flat list, ไม่มี hierarchy) เพิ่มฟิลด์ brand/description/
   cover_image/pdf_url — แสดงผลจริงที่หน้า spare-part.html ผ่าน spare-parts-render.js */
(function () {
  var TABLE = 'spare_parts_documents';
  var items = [];
  var editingId = null;
  var searchTerm = '';
  var draggedId = null;
  var pdfUploadWidget = null;

  var tableBody = document.getElementById('sparePartTableBody');
  var emptyState = document.getElementById('sparePartEmptyState');
  var modalOverlay = document.getElementById('sparePartModalOverlay');
  var modalTitle = document.getElementById('sparePartModalTitle');
  var form = document.getElementById('sparePartForm');
  var formError = document.getElementById('sparePartFormError');

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function itemMatchesSearch(item) {
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.brand || '').toLowerCase().indexOf(q) !== -1 ||
      (item.title || '').toLowerCase().indexOf(q) !== -1 ||
      (item.description || '').toLowerCase().indexOf(q) !== -1
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
      td.colSpan = 6;
      td.style.textAlign = 'center';
      td.style.color = 'var(--cms-text-faint)';
      td.style.padding = '40px 0';
      td.textContent = 'ไม่พบเอกสารที่ตรงกับคำค้นหา "' + searchTerm + '"';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visible.forEach(function (item) { tableBody.appendChild(buildRow(item)); });
    }

    renderStats();
  }

  function renderStats() {
    var active = items.filter(function (it) { return it.is_active; });
    document.getElementById('statTotalDocs').textContent = items.length;
    document.getElementById('statActiveDocs').textContent = active.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');
    tr.className = 'cms-menu-row';
    tr.dataset.id = item.id;
    attachRowDragEvents(tr, item);

    var tdCover = document.createElement('td');
    if (item.cover_image) {
      var img = document.createElement('img');
      img.src = item.cover_image;
      img.alt = '';
      img.style.cssText = 'width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--cms-border);';
      tdCover.appendChild(img);
    } else {
      tdCover.innerHTML = '<span style="color:var(--cms-text-faint)">—</span>';
    }
    tr.appendChild(tdCover);

    var tdName = document.createElement('td');
    var nameWrap = document.createElement('div');
    nameWrap.className = 'cms-menu-row__name';
    var textWrap = document.createElement('span');
    textWrap.className = 'cms-menu-row__text';
    var strong = document.createElement('strong');
    strong.textContent = item.title || '(ไม่มีชื่อ)';
    var span = document.createElement('span');
    span.textContent = item.brand || '';
    textWrap.appendChild(strong);
    textWrap.appendChild(span);
    nameWrap.appendChild(textWrap);
    tdName.appendChild(nameWrap);
    tr.appendChild(tdName);

    var tdPdf = document.createElement('td');
    if (item.pdf_url) {
      var link = document.createElement('a');
      link.href = item.pdf_url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.className = 'cms-url-pill';
      link.title = item.pdf_url;
      link.textContent = 'เปิด PDF ↗';
      tdPdf.appendChild(link);
    } else {
      tdPdf.innerHTML = '<span style="color:var(--cms-text-faint)">— ยังไม่มีไฟล์ —</span>';
    }
    tr.appendChild(tdPdf);

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
      window.cmsToast('โหลดข้อมูลเอกสารไม่สำเร็จ: ' + error.message, 'error');
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
    if (!window.confirm('ลบเอกสาร "' + item.title + '"? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบเอกสารเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldSparePartActive').checked = true;
    document.getElementById('fieldSparePartCover').value = '';
    document.getElementById('fieldSparePartPdf').value = '';

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขเอกสาร';
      document.getElementById('fieldSparePartBrand').value = item.brand || '';
      document.getElementById('fieldSparePartTitle').value = item.title || '';
      document.getElementById('fieldSparePartDescription').value = item.description || '';
      document.getElementById('fieldSparePartCover').value = item.cover_image || '';
      document.getElementById('fieldSparePartPdf').value = item.pdf_url || '';
      document.getElementById('fieldSparePartActive').checked = !!item.is_active;
    } else {
      modalTitle.textContent = 'เพิ่มเอกสารใหม่';
    }

    if (pdfUploadWidget) pdfUploadWidget.updatePreview();
    modalOverlay.hidden = false;
    document.getElementById('fieldSparePartTitle').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var title = document.getElementById('fieldSparePartTitle').value.trim();
    var pdfUrl = document.getElementById('fieldSparePartPdf').value.trim();

    if (!title) {
      formError.textContent = 'กรุณากรอกชื่อเอกสาร (Title)';
      focusField(document.getElementById('fieldSparePartTitle'));
      return;
    }
    if (!pdfUrl) {
      formError.textContent = 'กรุณาอัปโหลดไฟล์ PDF';
      focusField(document.getElementById('fieldSparePartPdfDropzone'));
      return;
    }

    var payload = {
      brand: document.getElementById('fieldSparePartBrand').value.trim(),
      title: title,
      description: document.getElementById('fieldSparePartDescription').value.trim(),
      cover_image: document.getElementById('fieldSparePartCover').value.trim(),
      pdf_url: pdfUrl,
      is_active: document.getElementById('fieldSparePartActive').checked,
    };

    var submitBtn = document.getElementById('sparePartFormSubmit');
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
      formError.textContent = 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    window.cmsToast(editingId ? 'แก้ไขเอกสารเรียบร้อยแล้ว' : 'เพิ่มเอกสารเรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  function focusField(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') el.focus();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    pdfUploadWidget = window.cmsBindFileUpload({
      fileInput: document.getElementById('fieldSparePartPdfFile'),
      urlInput: document.getElementById('fieldSparePartPdf'),
      fileNameEl: document.getElementById('fieldSparePartPdfName'),
      statusEl: document.getElementById('fieldSparePartPdfStatus'),
      dropzone: document.getElementById('fieldSparePartPdfDropzone'),
      uploadOpts: {
        allowedTypes: ['application/pdf'],
        typeErrorMessage: 'รองรับเฉพาะไฟล์ PDF เท่านั้น',
        maxSizeMb: 30,
      },
      // อัปโหลด PDF สำเร็จแล้ว → สร้างรูปปกจากหน้าแรกของไฟล์นั้นให้อัตโนมัติทันที ไม่มี UI ให้แก้ในโมดัลนี้แล้ว
      // (ตามที่ผู้ใช้ขอ — ดูรูปปกที่สร้างได้จริงที่คอลัมน์ "ปก" ในหน้ารายการแทน) เก็บผลลงใน hidden input
      // #fieldSparePartCover ให้ submitForm() อ่านไปบันทึกตามปกติ
      onFile: async function (pdfFile) {
        var coverResult = await window.cmsGeneratePdfCoverImage(pdfFile);
        if (coverResult.error) {
          if (window.cmsToast) window.cmsToast('สร้างรูปปกอัตโนมัติไม่สำเร็จ: ' + coverResult.error, 'error');
          return;
        }
        document.getElementById('fieldSparePartCover').value = coverResult.url;
      },
    });

    document.getElementById('addSparePartBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('sparePartModalClose').addEventListener('click', closeModal);
    document.getElementById('sparePartModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    document.getElementById('sparePartSearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    await loadItems();
  });
})();
