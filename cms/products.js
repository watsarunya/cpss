/* cms/products.js — รายการสินค้า: CRUD, จัดการ stock แบบ inline ที่หน้า list, ค้นหาด้วยชื่อ, กรองด้วยหมวดหมู่ */
(function () {
  var TABLE = 'products';
  var MAX_IMAGES = 5;
  var MAX_DESC_LENGTH = 5000;
  var items = [];
  var categories = [];
  var editingId = null;
  var searchTerm = '';
  var categoryFilter = '';
  var productImages = []; // ภาพสินค้าของ item ที่กำลังเปิด modal อยู่ — index 0 คือภาพปกเสมอ
  var quillTh = null;
  var quillEn = null;

  var tableBody = document.getElementById('productTableBody');
  var emptyState = document.getElementById('productEmptyState');
  var categoryFilterSelect = document.getElementById('categoryFilterSelect');
  var modalOverlay = document.getElementById('productModalOverlay');
  var modalTitle = document.getElementById('productModalTitle');
  var form = document.getElementById('productForm');
  var formError = document.getElementById('productFormError');
  var categorySelect = document.getElementById('fieldProductCategory');
  var imagesGrid = document.getElementById('productImagesGrid');
  var imageFileInput = document.getElementById('fieldProductImageFile');
  var imageStatusEl = document.getElementById('fieldProductImageStatus');

  function updateCharCount(quill, counterEl) {
    var len = Math.max(0, quill.getLength() - 1);
    counterEl.textContent = len + ' / ' + MAX_DESC_LENGTH;
    counterEl.classList.toggle('is-limit', len >= MAX_DESC_LENGTH);
  }

  function bindQuillLimit(quill, counterEl) {
    quill.on('text-change', function () {
      var length = quill.getLength() - 1;
      if (length > MAX_DESC_LENGTH) {
        quill.deleteText(MAX_DESC_LENGTH, length - MAX_DESC_LENGTH);
      }
      updateCharCount(quill, counterEl);
    });
  }

  /* ===== Product images gallery (สูงสุด 5 ภาพ, index 0 = ภาพปก) ===== */

  function renderImagesGrid() {
    imagesGrid.innerHTML = '';

    productImages.forEach(function (url, i) {
      var slot = document.createElement('div');
      slot.className = 'cms-product-image-slot';

      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      slot.appendChild(img);

      if (i === 0) {
        var badge = document.createElement('span');
        badge.className = 'cms-product-image-slot__cover-badge';
        badge.textContent = 'ภาพปก';
        slot.appendChild(badge);
      }

      var actions = document.createElement('div');
      actions.className = 'cms-product-image-slot__actions';

      if (i !== 0) {
        var coverBtn = document.createElement('button');
        coverBtn.type = 'button';
        coverBtn.className = 'cms-product-image-slot__btn';
        coverBtn.title = 'ตั้งเป็นภาพปก';
        coverBtn.textContent = '★';
        coverBtn.addEventListener('click', function () { setCoverImage(i); });
        actions.appendChild(coverBtn);
      }

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cms-product-image-slot__btn';
      removeBtn.title = 'ลบภาพนี้';
      removeBtn.textContent = '🗑';
      removeBtn.addEventListener('click', function () { removeImage(i); });
      actions.appendChild(removeBtn);

      slot.appendChild(actions);
      imagesGrid.appendChild(slot);
    });

    if (productImages.length < MAX_IMAGES) {
      var addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'cms-product-image-add';
      addBtn.title = 'เพิ่มรูปภาพ';
      addBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4M12 4l-4 4M12 4l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>เพิ่มรูป</span>';
      addBtn.addEventListener('click', function () { imageFileInput.click(); });
      bindImageAddDropzone(addBtn);
      imagesGrid.appendChild(addBtn);
    }
  }

  /* ลากไฟล์รูปจาก desktop มาวางบนช่อง "+" อัปโหลดได้จริง (ไม่ใช่แค่คลิกอย่างเดียว) */
  function bindImageAddDropzone(addBtn) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      addBtn.addEventListener(evt, function (e) {
        e.preventDefault();
        addBtn.classList.add('is-dragover');
      });
    });
    ['dragleave', 'dragend'].forEach(function (evt) {
      addBtn.addEventListener(evt, function () {
        addBtn.classList.remove('is-dragover');
      });
    });
    addBtn.addEventListener('drop', function (e) {
      e.preventDefault();
      addBtn.classList.remove('is-dragover');
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleImageFileSelected(file);
    });
  }

  function setCoverImage(index) {
    var url = productImages.splice(index, 1)[0];
    productImages.unshift(url);
    renderImagesGrid();
  }

  function removeImage(index) {
    productImages.splice(index, 1);
    renderImagesGrid();
  }

  async function handleImageFileSelected(fileArg) {
    var file = fileArg || (imageFileInput.files && imageFileInput.files[0]);
    if (!file) return;

    imageStatusEl.textContent = 'กำลังอัปโหลด...';
    var result = await window.cmsUploadImage(file);
    imageFileInput.value = '';

    if (result.error) {
      imageStatusEl.textContent = '';
      window.cmsToast(result.error, 'error');
      return;
    }

    productImages.push(result.url);
    renderImagesGrid();
    imageStatusEl.textContent = 'อัปโหลดสำเร็จ';
    setTimeout(function () { imageStatusEl.textContent = ''; }, 2500);
  }

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function categoryName(categoryId) {
    var cat = categories.find(function (c) { return c.id === categoryId; });
    return cat ? cat.name_th : '';
  }

  function formatBaht(amount) {
    return '฿' + Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function itemMatchesFilters(item) {
    if (categoryFilter && item.category_id !== categoryFilter) return false;
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (
      (item.name_th || '').toLowerCase().indexOf(q) !== -1 ||
      (item.name_en || '').toLowerCase().indexOf(q) !== -1 ||
      (item.sku || '').toLowerCase().indexOf(q) !== -1
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
      td.textContent = 'ไม่พบสินค้าที่ตรงกับเงื่อนไข';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visible.forEach(function (item) { tableBody.appendChild(buildRow(item)); });
    }

    renderStats();
  }

  function renderStats() {
    var active = items.filter(function (it) { return it.is_active; });
    var outOfStock = items.filter(function (it) { return Number(it.stock) <= 0; });
    document.getElementById('statTotalProducts').textContent = items.length;
    document.getElementById('statActiveProducts').textContent = active.length;
    document.getElementById('statOutOfStock').textContent = outOfStock.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');

    var tdProduct = document.createElement('td');
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
    strong.textContent = item.name_th || '(ไม่มีชื่อ)';
    var span = document.createElement('span');
    span.textContent = item.name_en || '';
    textWrap.appendChild(strong);
    textWrap.appendChild(span);
    thumbWrap.appendChild(textWrap);
    tdProduct.appendChild(thumbWrap);
    tr.appendChild(tdProduct);

    var tdCategory = document.createElement('td');
    var catName = categoryName(item.category_id);
    if (catName) {
      tdCategory.textContent = catName;
    } else {
      tdCategory.innerHTML = '<span style="color:var(--cms-text-faint)">— ไม่มีหมวดหมู่ —</span>';
    }
    tr.appendChild(tdCategory);

    var tdPrice = document.createElement('td');
    tdPrice.textContent = formatBaht(item.price);
    tr.appendChild(tdPrice);

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
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดหมวดหมู่สินค้าไม่สำเร็จ: ' + error.message, 'error');
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
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลดข้อมูลสินค้าไม่สำเร็จ: ' + error.message, 'error');
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
    if (!window.confirm('ลบสินค้า "' + (item.name_th || item.id) + '"? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบสินค้าเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal (Add / Edit) ===== */

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();
    document.getElementById('fieldProductActive').checked = true;

    quillTh.setText('');
    quillEn.setText('');

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขสินค้า';
      document.getElementById('fieldProductNameTh').value = item.name_th || '';
      document.getElementById('fieldProductNameEn').value = item.name_en || '';
      categorySelect.value = item.category_id || '';
      document.getElementById('fieldProductSku').value = item.sku || '';
      document.getElementById('fieldProductPrice').value = item.price;
      document.getElementById('fieldProductStock').value = item.stock;
      productImages = (item.images && item.images.length) ? item.images.slice() : (item.image ? [item.image] : []);
      quillTh.root.innerHTML = item.description_th || '';
      quillEn.root.innerHTML = item.description_en || '';
      document.getElementById('fieldProductActive').checked = !!item.is_active;
    } else {
      modalTitle.textContent = 'เพิ่มสินค้าใหม่';
      document.getElementById('fieldProductPrice').value = '0';
      document.getElementById('fieldProductStock').value = '9999';
      categorySelect.value = categoryFilter || '';
      productImages = [];
    }

    renderImagesGrid();
    updateCharCount(quillTh, document.getElementById('fieldProductDescThCount'));
    updateCharCount(quillEn, document.getElementById('fieldProductDescEnCount'));

    modalOverlay.hidden = false;
    document.getElementById('fieldProductNameTh').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  function focusField(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') el.focus();
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var nameThInput = document.getElementById('fieldProductNameTh');
    var nameEnInput = document.getElementById('fieldProductNameEn');
    var nameTh = nameThInput.value.trim();
    var nameEn = nameEnInput.value.trim();
    if (!nameTh) {
      formError.textContent = 'กรุณากรอกชื่อสินค้าภาษาไทย';
      focusField(nameThInput);
      return;
    }
    if (!nameEn) {
      formError.textContent = 'กรุณากรอกชื่อสินค้าภาษาอังกฤษ';
      focusField(nameEnInput);
      return;
    }

    if (!categorySelect.value) {
      formError.textContent = 'กรุณาเลือกหมวดหมู่สินค้า';
      focusField(categorySelect);
      return;
    }

    if (!productImages.length) {
      formError.textContent = 'กรุณาอัปโหลดรูปภาพสินค้าอย่างน้อย 1 ภาพ';
      focusField(imagesGrid.querySelector('.cms-product-image-add') || imagesGrid);
      return;
    }

    var priceInput = document.getElementById('fieldProductPrice');
    if (priceInput.value === '' || isNaN(parseFloat(priceInput.value))) {
      formError.textContent = 'กรุณากรอกราคาสินค้า';
      focusField(priceInput);
      return;
    }
    // จำนวนสต็อก: ซ่อนจากฟอร์มแล้ว (ยังไม่ได้ใช้งานฟีเจอร์นี้จริง) ไม่ต้อง validate อีกต่อไป —
    // ค่าที่อ่านมาใช้ตอน build payload ด้านล่างมาจาก hidden input ค่าคงที่ (ดู products.html)

    var descThLen = Math.max(0, quillTh.getLength() - 1);
    var descEnLen = Math.max(0, quillEn.getLength() - 1);
    if (descThLen === 0) {
      formError.textContent = 'กรุณากรอกรายละเอียดสินค้าภาษาไทย';
      focusField(document.getElementById('fieldProductDescThEditor'));
      quillTh.focus();
      return;
    }
    if (descThLen > MAX_DESC_LENGTH) {
      formError.textContent = 'รายละเอียดสินค้า (TH) ต้องไม่เกิน ' + MAX_DESC_LENGTH + ' ตัวอักษร';
      focusField(document.getElementById('fieldProductDescThEditor'));
      quillTh.focus();
      return;
    }
    if (descEnLen > MAX_DESC_LENGTH) {
      formError.textContent = 'รายละเอียดสินค้า (EN) ต้องไม่เกิน ' + MAX_DESC_LENGTH + ' ตัวอักษร';
      focusField(document.getElementById('fieldProductDescEnEditor'));
      quillEn.focus();
      return;
    }

    var price = parseFloat(document.getElementById('fieldProductPrice').value);
    var stock = parseInt(document.getElementById('fieldProductStock').value, 10);

    var payload = {
      name_th: nameTh,
      name_en: nameEn,
      category_id: categorySelect.value,
      sku: document.getElementById('fieldProductSku').value.trim(),
      price: isNaN(price) ? 0 : price,
      stock: isNaN(stock) ? 0 : stock,
      image: productImages[0],
      images: productImages,
      description_th: descThLen === 0 ? '' : quillTh.root.innerHTML,
      description_en: descEnLen === 0 ? '' : quillEn.root.innerHTML,
      is_active: document.getElementById('fieldProductActive').checked,
    };

    var submitBtn = document.getElementById('productFormSubmit');
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

    window.cmsToast(editingId ? 'แก้ไขสินค้าเรียบร้อยแล้ว' : 'เพิ่มสินค้าเรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    imageFileInput.addEventListener('change', function () { handleImageFileSelected(); });

    quillTh = new Quill('#fieldProductDescThEditor', { theme: 'snow', formats: window.CMS_QUILL_FORMATS, modules: { toolbar: window.CMS_QUILL_TOOLBAR } });
    quillEn = new Quill('#fieldProductDescEnEditor', { theme: 'snow', formats: window.CMS_QUILL_FORMATS, modules: { toolbar: window.CMS_QUILL_TOOLBAR } });
    window.cmsBindQuillImageUpload(quillTh);
    window.cmsBindQuillImageUpload(quillEn);
    bindQuillLimit(quillTh, document.getElementById('fieldProductDescThCount'));
    bindQuillLimit(quillEn, document.getElementById('fieldProductDescEnCount'));

    document.getElementById('addProductBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('productModalClose').addEventListener('click', closeModal);
    document.getElementById('productModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    document.getElementById('productSearchInput').addEventListener('input', function (e) {
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
