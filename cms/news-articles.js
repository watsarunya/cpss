/* cms/news-articles.js — รายการบทความ (Newsroom): CRUD, ค้นหาด้วยชื่อ, กรองด้วยหมวดหมู่, เรียงใหม่ไปเก่า */
(function () {
  var TABLE = 'news_articles';
  var items = [];
  var categories = [];
  var editingId = null;
  var searchTerm = '';
  var categoryFilter = '';
  var imageUploadWidget = null;
  var quillContentTh = null;
  var quillContentEn = null;

  var tableBody = document.getElementById('articleTableBody');
  var emptyState = document.getElementById('articleEmptyState');
  var categoryFilterSelect = document.getElementById('categoryFilterSelect');
  var modalOverlay = document.getElementById('articleModalOverlay');
  var modalTitle = document.getElementById('articleModalTitle');
  var form = document.getElementById('articleForm');
  var formError = document.getElementById('articleFormError');
  var categorySelect = document.getElementById('fieldArticleCategory');

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function categoryName(categoryId) {
    var cat = categories.find(function (c) { return c.id === categoryId; });
    return cat ? cat.name_th : '';
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function focusField(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') el.focus();
  }

  function itemMatchesFilters(item) {
    if (categoryFilter && item.category_id !== categoryFilter) return false;
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.title_th || '').toLowerCase().indexOf(q) !== -1 ||
      (item.title_en || '').toLowerCase().indexOf(q) !== -1
    );
  }

  /* ===== Render ===== */

  function render() {
    tableBody.innerHTML = '';
    var visible = items.filter(itemMatchesFilters);

    emptyState.hidden = items.length > 0;
    if (items.length > 0 && visible.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 5;
      td.style.textAlign = 'center';
      td.style.color = 'var(--cms-text-faint)';
      td.style.padding = '40px 0';
      td.textContent = 'ไม่พบบทความที่ตรงกับเงื่อนไข';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visible.forEach(function (item) { tableBody.appendChild(buildRow(item)); });
    }

    renderStats();
  }

  function renderStats() {
    var active = items.filter(function (it) { return it.is_active; });
    document.getElementById('statTotalArticles').textContent = items.length;
    document.getElementById('statActiveArticles').textContent = active.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');

    var tdArticle = document.createElement('td');
    var thumbWrap = document.createElement('div');
    thumbWrap.className = 'cms-product-thumb';
    if (item.image) {
      var img = document.createElement('img');
      img.className = 'cms-product-thumb__img';
      img.src = item.image;
      img.alt = '';
      thumbWrap.appendChild(img);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'cms-product-thumb__img-empty';
      thumbWrap.appendChild(placeholder);
    }
    var textWrap = document.createElement('span');
    textWrap.className = 'cms-menu-row__text';
    var strong = document.createElement('strong');
    strong.textContent = item.title_th || '(ไม่มีชื่อ)';
    var span = document.createElement('span');
    span.textContent = item.title_en || '';
    textWrap.appendChild(strong);
    textWrap.appendChild(span);
    thumbWrap.appendChild(textWrap);
    tdArticle.appendChild(thumbWrap);
    tr.appendChild(tdArticle);

    var tdCategory = document.createElement('td');
    var catName = categoryName(item.category_id);
    if (catName) {
      tdCategory.textContent = catName;
    } else {
      tdCategory.innerHTML = '<span style="color:var(--cms-text-faint)">— ไม่มีหมวดหมู่ —</span>';
    }
    tr.appendChild(tdCategory);

    var tdDate = document.createElement('td');
    tdDate.textContent = formatDate(item.created_at);
    tr.appendChild(tdDate);

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

  /* ===== Data actions ===== */

  async function loadCategories() {
    var { data, error } = await window.cmsSupabase
      .from('news_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดหมวดหมู่บทความไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    categories = data || [];

    categoryFilterSelect.innerHTML = '<option value="">ทุกหมวดหมู่</option>';
    categorySelect.innerHTML = '<option value="">— เลือกหมวดหมู่ —</option>';
    categories.forEach(function (cat) {
      var opt1 = document.createElement('option');
      opt1.value = cat.id;
      opt1.textContent = cat.name_th;
      categoryFilterSelect.appendChild(opt1);

      var opt2 = document.createElement('option');
      opt2.value = cat.id;
      opt2.textContent = cat.name_th;
      categorySelect.appendChild(opt2);
    });
  }

  async function loadItems() {
    var { data, error } = await window.cmsSupabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      window.cmsToast('โหลดข้อมูลบทความไม่สำเร็จ: ' + error.message, 'error');
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

  async function deleteItem(item) {
    if (!window.confirm('ลบบทความ "' + (item.title_th || item.id) + '"? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบบทความเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldArticleActive').checked = true;
    quillContentTh.setText('');
    quillContentEn.setText('');

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขบทความ';
      document.getElementById('fieldArticleTitleTh').value = item.title_th || '';
      document.getElementById('fieldArticleTitleEn').value = item.title_en || '';
      categorySelect.value = item.category_id || '';
      document.getElementById('fieldArticleImage').value = item.image || '';
      document.getElementById('fieldArticleExcerptTh').value = item.excerpt_th || '';
      document.getElementById('fieldArticleExcerptEn').value = item.excerpt_en || '';
      quillContentTh.root.innerHTML = item.content_th || '';
      quillContentEn.root.innerHTML = item.content_en || '';
      document.getElementById('fieldArticleActive').checked = !!item.is_active;
    } else {
      modalTitle.textContent = 'เพิ่มบทความใหม่';
      categorySelect.value = categoryFilter || '';
    }

    if (imageUploadWidget) imageUploadWidget.updatePreview();
    modalOverlay.hidden = false;
    document.getElementById('fieldArticleTitleTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var titleThInput = document.getElementById('fieldArticleTitleTh');
    var titleEnInput = document.getElementById('fieldArticleTitleEn');
    var titleTh = titleThInput.value.trim();
    var titleEn = titleEnInput.value.trim();
    if (!titleTh) {
      formError.textContent = 'กรุณากรอกชื่อบทความภาษาไทย';
      focusField(titleThInput);
      return;
    }
    if (!titleEn) {
      formError.textContent = 'กรุณากรอกชื่อบทความภาษาอังกฤษ';
      focusField(titleEnInput);
      return;
    }

    if (!categorySelect.value) {
      formError.textContent = 'กรุณาเลือกหมวดหมู่';
      focusField(categorySelect);
      return;
    }

    var imageInput = document.getElementById('fieldArticleImage');
    var image = imageInput.value.trim();
    if (!image) {
      formError.textContent = 'กรุณาใส่รูปภาพหลัก';
      focusField(imageInput);
      return;
    }

    var excerptThInput = document.getElementById('fieldArticleExcerptTh');
    var excerptTh = excerptThInput.value.trim();
    if (!excerptTh) {
      formError.textContent = 'กรุณากรอกคำโปรย/สรุปย่อภาษาไทย';
      focusField(excerptThInput);
      return;
    }

    var contentThLen = Math.max(0, quillContentTh.getLength() - 1);
    var contentEnLen = Math.max(0, quillContentEn.getLength() - 1);
    if (contentThLen === 0) {
      formError.textContent = 'กรุณากรอกเนื้อหาบทความภาษาไทย';
      focusField(document.getElementById('fieldArticleContentThEditor'));
      quillContentTh.focus();
      return;
    }

    var payload = {
      title_th: titleTh,
      title_en: titleEn,
      category_id: categorySelect.value,
      image: image,
      excerpt_th: excerptTh,
      excerpt_en: document.getElementById('fieldArticleExcerptEn').value.trim(),
      content_th: quillContentTh.root.innerHTML,
      content_en: contentEnLen === 0 ? '' : quillContentEn.root.innerHTML,
      is_active: document.getElementById('fieldArticleActive').checked,
    };

    var submitBtn = document.getElementById('articleFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', editingId);
    } else {
      var maxOrder = items.length ? Math.max.apply(null, items.map(function (i) { return i.sort_order || 0; })) : -1;
      payload.sort_order = maxOrder + 1;
      result = await window.cmsSupabase.from(TABLE).insert(payload);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = 'บันทึกไม่สำเร็จ: ' + result.error.message;
      return;
    }

    window.cmsToast(editingId ? 'แก้ไขบทความเรียบร้อยแล้ว' : 'เพิ่มบทความเรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    imageUploadWidget = window.cmsBindImageUpload({
      fileInput: document.getElementById('fieldArticleImageFile'),
      urlInput: document.getElementById('fieldArticleImage'),
      preview: document.getElementById('fieldArticleImagePreview'),
      statusEl: document.getElementById('fieldArticleImageStatus'),
      dropzone: document.getElementById('fieldArticleImageDropzone'),
    });

    quillContentTh = new Quill('#fieldArticleContentThEditor', { theme: 'snow', formats: window.CMS_QUILL_FORMATS, modules: { toolbar: window.CMS_QUILL_TOOLBAR } });
    quillContentEn = new Quill('#fieldArticleContentEnEditor', { theme: 'snow', formats: window.CMS_QUILL_FORMATS, modules: { toolbar: window.CMS_QUILL_TOOLBAR } });
    window.cmsBindQuillImageUpload(quillContentTh);
    window.cmsBindQuillImageUpload(quillContentEn);

    document.getElementById('addArticleBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('articleModalClose').addEventListener('click', closeModal);
    document.getElementById('articleModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    document.getElementById('articleSearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    categoryFilterSelect.addEventListener('change', function () {
      categoryFilter = categoryFilterSelect.value;
      render();
    });

    await loadCategories();
    await loadItems();
  });
})();
