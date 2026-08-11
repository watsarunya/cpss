/* cms/page-editor.js — จัดการ section ของเพจเดียว (page-editor.html?id=<uuid>)
   หัวข้อ/เนื้อหา/ปุ่ม/anchor แก้ไขตรงหน้ารายการได้เลย (TH/EN) — พิมพ์แล้ว preview อัปเดตทันทีแต่ยังไม่ save
   จนกว่าจะกดปุ่ม "บันทึกการเปลี่ยนแปลงทั้งหมด" ที่ sticky bottom bar (บันทึกทั้งตั้งค่าเพจ + ทุก section
   ในคราวเดียว ไม่มีปุ่มบันทึกแยกต่อ section) — ส่วนรูปภาพ+ตำแหน่งยังจัดการผ่าน modal แยก (save ทันทีเหมือนเดิม) */
(function () {
  var TABLE = 'page_sections';
  var MAX_IMAGES = 4;

  // Section "proxy" ที่จับคู่กับ <section> เดิมที่มี JS ผูกอยู่จริงในหน้าเว็บ (เช่น Online Shop/Newsroom/
  // Our Partners/Contact Us ของหน้าแรก, ฟอร์มสมัครงานของหน้า career) — เนื้อหาจริงไม่ได้อยู่ใน body_th เลย
  // (ดูหมายเหตุใน page-render.js's renderSections/isProxySection) ต้องกันไม่ให้แอดมินแก้/ลบ marker ใน
  // "โค้ด HTML" โดยไม่ตั้งใจ ไม่งั้น section นั้นจะกลายเป็น custom-html จริงแล้วไปทับของเดิม — เช็คแค่ marker
  // + มี anchor_id เท่านั้น (ไม่ผูกกับหน้าไหนโดยเฉพาะ ใช้ซ้ำได้ทุกเพจที่มี static section แบบนี้)
  var STATIC_PROXY_MARKER = '<!-- static-proxy -->';

  function isStaticProxySection(item) {
    return !!item.anchor_id && (item.body_th || '').trim() === STATIC_PROXY_MARKER;
  }

  // KV Banner: 1 proxy row ต่อ banner 1 อัน (anchor_id = 'kv-banner-' + banner id — ดูหมายเหตุเดียวกันใน
  // page-render.js/cms/banners.js) เช็คด้วย prefix เพราะ id ต่างกันทุกแถว ไม่ใช่ค่าคงที่แบบ proxy อื่น
  var KV_BANNER_PREFIX = 'kv-banner-';

  function isKvBannerSection(item) {
    return !!item.anchor_id && item.anchor_id.indexOf(KV_BANNER_PREFIX) === 0;
  }

  var pageId = new URLSearchParams(window.location.search).get('id');
  var page = null;
  var items = [];
  var kvBannerTitles = {}; // banner id -> title_th (โหลดแยกจาก banners table ให้การ์ด "KV Banner" หลายใบ
                            // ในเพจเดียวกันแยกแยะกันได้ — page_sections เองไม่มีข้อมูล title ของ banner อยู่แล้ว)
  var draftsById = {}; // item.id -> {heading_th/en, body_th/en, button_text_th/en, button_link, button_link_en, anchor_id} ที่ยังไม่ได้ save
  var editingId = null;
  var draggedImageIndex = null;
  var sectionImages = []; // ภาพของ section ที่กำลังเปิด modal อยู่ — ลำดับกำหนดตำแหน่งในกริด collage
  var sectionImageLinks = []; // ลิงก์ต่อรูป (ตำแหน่งตรงกับ sectionImages เสมอ — ต้อง splice/push คู่กันทุกจุด)

  var grid = document.getElementById('sectionGrid');
  var emptyState = document.getElementById('sectionEmptyState');

  var modalOverlay = document.getElementById('sectionModalOverlay');
  var modalTitle = document.getElementById('sectionModalTitle');
  var form = document.getElementById('sectionForm');
  var formError = document.getElementById('sectionFormError');
  var fieldLayout = document.getElementById('fieldSectionLayout');
  var layoutPicker = document.getElementById('layoutPicker');
  var imagesGrid = document.getElementById('sectionImagesGrid');
  var imageFileInput = document.getElementById('fieldSectionImageFile');
  var imageStatusEl = document.getElementById('fieldSectionImageStatus');
  var fieldImagesGrayscale = document.getElementById('fieldImagesGrayscale');
  var layoutPickerField = document.getElementById('layoutPickerField');
  var fieldUseCustomHtml = document.getElementById('fieldUseCustomHtml');
  var lastPositionLayout = 'image-left'; // จำ layout ตำแหน่งล่าสุดไว้ใช้ตอนปิด Custom HTML
  var fieldBgType = document.getElementById('fieldBgType');
  var bgTypePicker = document.getElementById('bgTypePicker');
  var bgImageFields = document.getElementById('bgImageFields');
  var bgColorFields = document.getElementById('bgColorFields');
  var bgGradientFields = document.getElementById('bgGradientFields');
  var fieldBgImage = document.getElementById('fieldBgImage');
  var fieldBgColor = document.getElementById('fieldBgColor');
  var fieldBgColorText = document.getElementById('fieldBgColorText');
  var fieldBgGradientFrom = document.getElementById('fieldBgGradientFrom');
  var fieldBgGradientFromText = document.getElementById('fieldBgGradientFromText');
  var fieldBgGradientTo = document.getElementById('fieldBgGradientTo');
  var fieldBgGradientToText = document.getElementById('fieldBgGradientToText');
  var fieldBgGradientDirection = document.getElementById('fieldBgGradientDirection');
  var bgGradientDirectionPicker = document.getElementById('bgGradientDirectionPicker');
  var fieldBgOpacity = document.getElementById('fieldBgOpacity');
  var fieldBgGrayscale = document.getElementById('fieldBgGrayscale');
  var bgImageUploadWidget = null;

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  /* ===== Draft (ค่าที่แก้ไขตรงหน้ารายการ แต่ยังไม่ save จนกว่าจะกดปุ่มบันทึกของ section นั้น) ===== */

  function getDraft(item) {
    if (!draftsById[item.id]) {
      draftsById[item.id] = {
        heading_th: item.heading_th || '',
        heading_en: item.heading_en || '',
        body_th: item.body_th || '',
        body_en: item.body_en || '',
        button_text_th: item.button_text_th || '',
        button_text_en: item.button_text_en || '',
        button_link: item.button_link || '',
        button_link_en: item.button_link_en || '',
        button_style: item.button_style || 'text-link',
        button_color: item.button_color || '',
        anchor_id: item.anchor_id || '',
        heading_align: item.heading_align || 'left',
      };
    }
    return draftsById[item.id];
  }

  /* ===== Section images gallery (สูงสุด 4 ภาพ, ลำดับกำหนดตำแหน่งในกริด collage) — ใช้ใน modal จัดการรูปภาพ ===== */

  function renderImagesGrid() {
    imagesGrid.innerHTML = '';

    sectionImages.forEach(function (url, i) {
      var wrap = document.createElement('div');
      wrap.className = 'cms-product-image-slot-wrap';

      var slot = document.createElement('div');
      slot.className = 'cms-product-image-slot';
      slot.draggable = true;
      slot.dataset.index = String(i);

      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      slot.appendChild(img);

      var badge = document.createElement('span');
      badge.className = 'cms-product-image-slot__cover-badge';
      badge.textContent = String(i + 1);
      slot.appendChild(badge);

      var actions = document.createElement('div');
      actions.className = 'cms-product-image-slot__actions';

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cms-product-image-slot__btn';
      removeBtn.title = 'ลบภาพนี้';
      removeBtn.textContent = '🗑';
      removeBtn.addEventListener('click', function () { removeImage(i); });
      actions.appendChild(removeBtn);

      slot.appendChild(actions);
      attachImageDragEvents(slot, i);
      wrap.appendChild(slot);

      // ลิงก์แยกต่อรูป (ไม่บังคับ) — คลิกรูปนี้ในหน้าเว็บจริงแล้วพาไปที่ลิงก์นี้แทนที่จะไม่ทำอะไรเลย
      var linkInput = document.createElement('input');
      linkInput.type = 'text';
      linkInput.className = 'cms-product-image-slot__link';
      linkInput.placeholder = 'ลิงก์ (ถ้ามี)';
      linkInput.value = sectionImageLinks[i] || '';
      linkInput.addEventListener('input', function () {
        sectionImageLinks[i] = linkInput.value.trim();
      });
      wrap.appendChild(linkInput);

      imagesGrid.appendChild(wrap);
    });

    if (sectionImages.length < MAX_IMAGES) {
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

  /* ลากไฟล์รูปจาก desktop มาวางบนช่อง "+" อัปโหลดได้จริง (ไม่ใช่แค่คลิกอย่างเดียว) — คนละกลไกกับ
     attachImageDragEvents ด้านบนที่เป็นการลากรูปที่อัปโหลดแล้วเพื่อสลับลำดับ (ผูกกับ slot คนละอันกัน) */
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

  function removeImage(index) {
    sectionImages.splice(index, 1);
    sectionImageLinks.splice(index, 1);
    renderImagesGrid();
  }

  function attachImageDragEvents(slot, index) {
    slot.addEventListener('dragstart', function (e) {
      draggedImageIndex = index;
      slot.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    });
    slot.addEventListener('dragend', function () {
      draggedImageIndex = null;
      imagesGrid.querySelectorAll('.cms-product-image-slot').forEach(function (s) {
        s.classList.remove('is-dragging', 'drag-over-before', 'drag-over-after');
      });
    });
    slot.addEventListener('dragover', function (e) {
      if (draggedImageIndex == null || draggedImageIndex === index) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var rect = slot.getBoundingClientRect();
      var isBeforeHalf = e.clientX - rect.left < rect.width / 2;
      slot.classList.toggle('drag-over-before', isBeforeHalf);
      slot.classList.toggle('drag-over-after', !isBeforeHalf);
    });
    slot.addEventListener('dragleave', function () {
      slot.classList.remove('drag-over-before', 'drag-over-after');
    });
    slot.addEventListener('drop', function (e) {
      var isBeforeHalf = slot.classList.contains('drag-over-before');
      slot.classList.remove('drag-over-before', 'drag-over-after');
      if (draggedImageIndex == null || draggedImageIndex === index) return;
      e.preventDefault();
      var moved = sectionImages.splice(draggedImageIndex, 1)[0];
      var movedLink = sectionImageLinks.splice(draggedImageIndex, 1)[0];
      var insertAt = isBeforeHalf ? index : index + 1;
      if (draggedImageIndex < insertAt) insertAt -= 1;
      sectionImages.splice(insertAt, 0, moved);
      sectionImageLinks.splice(insertAt, 0, movedLink);
      renderImagesGrid();
    });
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

    sectionImages.push(result.url);
    sectionImageLinks.push('');
    renderImagesGrid();
    imageStatusEl.textContent = 'อัปโหลดสำเร็จ';
    setTimeout(function () { imageStatusEl.textContent = ''; }, 2500);
  }

  /* ===== Page settings ===== */

  async function loadPage() {
    if (!pageId) {
      window.cmsToast('ไม่พบเพจที่ต้องการจัดการ', 'error');
      return;
    }
    var { data, error } = await window.cmsSupabase.from('pages').select('*').eq('id', pageId).maybeSingle();
    if (error || !data) {
      window.cmsToast('โหลดข้อมูลเพจไม่สำเร็จ', 'error');
      return;
    }
    page = data;
    document.getElementById('pageEditorBreadcrumb').textContent = page.title_th;
    document.title = 'จัดการ Section: ' + page.title_th + ' — CP B&F CMS';
    document.getElementById('fieldPageTitleTh').value = page.title_th || '';
    document.getElementById('fieldPageTitleEn').value = page.title_en || '';
    document.getElementById('fieldPageSlug').value = page.slug || '';
    document.getElementById('fieldPageSlug').disabled = !page.is_standalone;
    document.getElementById('fieldPageActive').checked = !!page.is_active;

    await setupViewLink(page);
  }

  // ลิงก์ "🔗 เปิดดูหน้านี้" — เพจ standalone เปิดผ่าน URL สะอาด "<slug>.html" เสมอ (ไม่มีไฟล์ .html ของตัวเอง
  // จริงๆ แต่ Netlify rewrite ไปที่ promo.html?slug=<slug> ให้อัตโนมัติ ดูไฟล์ _redirects ที่ root) เพจที่
  // ผูกเมนูให้หา url จริงของเมนูนั้น (menu_items.url — autoCreatePageForMenuItem ใน menu.js จะสลับเป็น
  // promo.html?slug=... ให้เองถ้าไฟล์ .html ที่ตั้งใจไว้ไม่มีอยู่จริงตอนสร้างเมนู)
  async function setupViewLink(pageData) {
    var viewLink = document.getElementById('pageEditorViewLink');
    var viewUrl = encodeURIComponent(pageData.slug || pageData.page_key || '') + '.html';

    if (!pageData.is_standalone && pageData.menu_item_id) {
      var { data: menuItem } = await window.cmsSupabase.from('menu_items').select('url').eq('id', pageData.menu_item_id).maybeSingle();
      if (menuItem && menuItem.url) viewUrl = menuItem.url;
    }

    viewLink.href = '../' + viewUrl;
    viewLink.hidden = false;
  }

  /* บันทึกทุกอย่างในคราวเดียว (ตั้งค่าเพจ + draft ของทุก section ที่ยังไม่ได้บันทึก) — ปุ่มเดียวที่ sticky
     bottom bar ด้านล่างจอ ไม่ต้องมีปุ่มบันทึกแยกต่อ section */
  async function saveAll() {
    var errorEl = document.getElementById('pageSettingsError');
    errorEl.textContent = '';

    var btn = document.getElementById('saveAllBtn');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';

    var errors = [];

    var titleThInput = document.getElementById('fieldPageTitleTh');
    var titleTh = titleThInput.value.trim();
    if (!titleTh) {
      errors.push('กรุณากรอกชื่อเพจภาษาไทย');
    } else {
      var pagePayload = {
        title_th: titleTh,
        title_en: document.getElementById('fieldPageTitleEn').value.trim(),
        is_active: document.getElementById('fieldPageActive').checked,
      };
      if (page.is_standalone) {
        pagePayload.slug = document.getElementById('fieldPageSlug').value.trim();
        pagePayload.page_key = pagePayload.slug;
      }
      var pageResult = await window.cmsSupabase.from('pages').update(pagePayload).eq('id', pageId);
      if (pageResult.error) {
        errors.push('บันทึกตั้งค่าเพจไม่สำเร็จ: ' + pageResult.error.message);
      } else {
        Object.assign(page, pagePayload);
        document.getElementById('pageEditorBreadcrumb').textContent = page.title_th;
      }
    }

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var draft = draftsById[item.id];
      if (!draft) continue;

      var isCustomHtml = item.layout === 'custom-html';
      var label = draft.heading_th.trim() || item.heading_th || (isCustomHtml ? '(Custom HTML)' : '(ไม่มีหัวข้อ)');

      // หัวข้อ/เนื้อหาไม่บังคับกรอกแล้ว (ผู้ใช้ขอ) — ยกเว้น custom-html ที่ยังบังคับกรอกโค้ด HTML เพราะ
      // ถ้าไม่มีโค้ดเลย section นั้นจะไม่มีอะไรให้ render เลย
      if (isCustomHtml && !draft.body_th.trim()) {
        errors.push('Section "' + label + '": กรุณากรอกโค้ด HTML');
        continue;
      }

      var payload = {
        heading_th: draft.heading_th.trim(),
        heading_en: draft.heading_en.trim(),
        heading_align: draft.heading_align || 'left',
        body_th: draft.body_th,
        body_en: draft.body_en,
        button_text_th: draft.button_text_th.trim(),
        button_text_en: draft.button_text_en.trim(),
        button_link: draft.button_link.trim(),
        button_link_en: draft.button_link_en.trim(),
        button_style: draft.button_style || 'text-link',
        button_color: (draft.button_color || '').trim(),
        anchor_id: draft.anchor_id.trim(),
      };
      var result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', item.id);
      if (result.error) {
        errors.push('Section "' + label + '": ' + result.error.message);
      } else {
        Object.assign(item, payload);
      }
    }

    btn.disabled = false;
    btn.textContent = 'บันทึกการเปลี่ยนแปลงทั้งหมด';

    if (errors.length) {
      errorEl.textContent = errors.join(' / ');
      window.cmsToast('บันทึกไม่สำเร็จบางส่วน: ' + errors.join(' / '), 'error');
      return;
    }
    window.cmsToast('บันทึกการเปลี่ยนแปลงทั้งหมดเรียบร้อยแล้ว', 'success');
  }

  /* ===== Preview: render section จริงด้วย window.cpbfPages.buildSection (page-render.js)
     ผ่าน iframe ที่โหลด style.css ของเว็บหลักจริง เพื่อให้เห็นผลลัพธ์ตรงกับที่จะแสดงบนเว็บไซต์
     ⚠️ buildSection()/sanitize() รันใน context ของหน้า CMS นี้เอง (ไม่ใช่ใน iframe) ดังนั้น
     window.DOMPurify ต้องถูกโหลดใน cms/page-editor.html เอง (ดู <script> ใน head) — ถ้าใส่ DOMPurify
     ไว้แค่ใน iframe srcdoc เหมือนที่เคยทำผิดมาก่อน sanitize() จะ fallback เป็น escapeHtml() ไปแล้ว
     ตั้งแต่ก่อนที่ HTML string จะถูกใส่เข้า iframe ด้วยซ้ำ ทำให้เห็นแท็กดิบๆ ในพรีวิว */

  function buildPreviewDoc(sectionLike) {
    if (!window.cpbfPages) return '';
    var sectionEl = window.cpbfPages.buildSection(sectionLike);
    var siteRoot = new URL('../', window.location.href).href;
    return (
      '<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8" />' +
      '<base href="' + siteRoot + '" />' +
      '<link rel="stylesheet" href="style.css" />' +
      '<style>body{margin:0;}</style>' +
      '</head><body>' + sectionEl.outerHTML + '</body></html>'
    );
  }

  function mergedSection(item, draft) {
    return Object.assign({}, item, draft);
  }

  /* ===== Render section list ===== */

  function render() {
    grid.innerHTML = '';
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

    emptyState.hidden = sorted.length > 0;
    sorted.forEach(function (item, i) {
      grid.appendChild(buildCard(item, i === 0, i === sorted.length - 1));
    });
  }

  function buildQuickEditFields(item, draft, frame) {
    var wrap = document.createElement('div');
    wrap.className = 'cms-section-card__quick-edit';

    var refresh = debounce(function () { frame.srcdoc = buildPreviewDoc(mergedSection(item, draft)); }, 400);

    // Section ที่ผูกกับ JS จริงในหน้าเว็บ (เช่น Online Shop/Newsroom/Our Partners/Contact Us ของหน้าแรก,
    // ฟอร์มสมัครงานของหน้า career) — ไม่มีเนื้อหาให้แก้ตรงนี้เลย จัดการได้แค่พื้นหลัง+ลำดับผ่านปุ่ม "✏️ แก้ไข"/▲▼ เท่านั้น
    if (isStaticProxySection(item)) {
      var noticeField = document.createElement('div');
      noticeField.className = 'cms-field';
      var notice = document.createElement('p');
      notice.className = 'cms-section-hint';
      notice.textContent = 'Section นี้ดึงข้อมูล/ทำงานจริงจากระบบอื่นอยู่แล้ว (เช่น สินค้า/ข่าวสาร/ฟอร์ม) จึงแก้ไข' +
        'เนื้อหาผ่านหน้านี้ไม่ได้ — ปรับได้แค่พื้นหลัง (ปุ่ม "✏️ แก้ไข") และลำดับก่อน-หลัง (ปุ่ม ▲▼) เท่านั้น';
      noticeField.appendChild(notice);
      wrap.appendChild(noticeField);
      return wrap;
    }

    // Custom HTML: แอดมินเขียนโค้ดเองทั้งหมด ไม่มีหัวข้อ/เนื้อหา/ปุ่มแบบฟอร์มปกติ (เก็บโค้ดไว้ใน body_th)
    if (item.layout === 'custom-html') {
      var codeField = document.createElement('div');
      codeField.className = 'cms-field';
      var codeLabel = document.createElement('label');
      codeLabel.textContent = 'โค้ด HTML';
      var codeTextarea = document.createElement('textarea');
      codeTextarea.className = 'cms-code-editor';
      codeTextarea.rows = 10;
      codeTextarea.spellcheck = false;
      codeTextarea.placeholder = '<section>...</section>';
      codeTextarea.value = draft.body_th || '';
      codeTextarea.addEventListener('input', function () {
        draft.body_th = codeTextarea.value;
        refresh();
      });
      codeField.appendChild(codeLabel);
      codeField.appendChild(codeTextarea);
      wrap.appendChild(codeField);

      var anchorFieldHtml = document.createElement('div');
      anchorFieldHtml.className = 'cms-field';
      var anchorLabelHtml = document.createElement('label');
      anchorLabelHtml.textContent = 'Anchor ID (ตัวเลือกเพิ่มเติม)';
      var anchorInputHtml = document.createElement('input');
      anchorInputHtml.type = 'text';
      anchorInputHtml.placeholder = 'เช่น history';
      anchorInputHtml.value = draft.anchor_id || '';
      anchorInputHtml.addEventListener('input', function () {
        draft.anchor_id = anchorInputHtml.value.trim();
        refresh();
      });
      anchorFieldHtml.appendChild(anchorLabelHtml);
      anchorFieldHtml.appendChild(anchorInputHtml);
      wrap.appendChild(anchorFieldHtml);

      return wrap;
    }

    function textPairField(labelBase, keyTh, keyEn) {
      var row = document.createElement('div');
      row.className = 'cms-field-row';

      [{ key: keyTh, suffix: '(TH)' }, { key: keyEn, suffix: '(EN)' }].forEach(function (cfg) {
        var field = document.createElement('div');
        field.className = 'cms-field';
        var label = document.createElement('label');
        label.textContent = labelBase + ' ' + cfg.suffix;
        var input = document.createElement('input');
        input.type = 'text';
        input.value = draft[cfg.key] || '';
        input.addEventListener('input', function () {
          draft[cfg.key] = input.value;
          refresh();
        });
        field.appendChild(label);
        field.appendChild(input);
        row.appendChild(field);
      });

      return row;
    }

    // หัวข้อ TH/EN
    wrap.appendChild(textPairField('หัวข้อ', 'heading_th', 'heading_en'));

    // ตำแหน่งหัวข้อ (ซ้าย/กลาง/ขวา) — เฉพาะ section ปกติที่ไม่ใช่ custom-html (custom-html ไม่มีฟิลด์หัวข้อ)
    var alignField = document.createElement('div');
    alignField.className = 'cms-field';
    var alignLabel = document.createElement('label');
    alignLabel.textContent = 'ตำแหน่งหัวข้อ';
    var alignPicker = document.createElement('div');
    alignPicker.className = 'cms-align-picker';
    [
      { value: 'left', text: 'ซ้าย' },
      { value: 'center', text: 'กลาง' },
      { value: 'right', text: 'ขวา' },
    ].forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cms-align-picker__btn' + (draft.heading_align === opt.value ? ' is-active' : '');
      btn.textContent = opt.text;
      btn.addEventListener('click', function () {
        draft.heading_align = opt.value;
        alignPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        refresh();
      });
      alignPicker.appendChild(btn);
    });
    alignField.appendChild(alignLabel);
    alignField.appendChild(alignPicker);
    wrap.appendChild(alignField);

    // เนื้อหา TH/EN (rich text)
    var bodyRow = document.createElement('div');
    bodyRow.className = 'cms-field-row';
    [{ key: 'body_th', suffix: '(TH)' }, { key: 'body_en', suffix: '(EN)' }].forEach(function (cfg) {
      var field = document.createElement('div');
      field.className = 'cms-field';
      var label = document.createElement('label');
      label.textContent = 'เนื้อหา ' + cfg.suffix;
      var editorHost = document.createElement('div');
      editorHost.className = 'cms-rich-editor';
      var editorInner = document.createElement('div');
      editorHost.appendChild(editorInner);
      field.appendChild(label);
      field.appendChild(editorHost);
      bodyRow.appendChild(field);

      var quill = new Quill(editorInner, { theme: 'snow', formats: window.CMS_QUILL_FORMATS, modules: { toolbar: window.CMS_QUILL_TOOLBAR } });
      window.cmsBindQuillImageUpload(quill);
      quill.root.innerHTML = draft[cfg.key] || '';
      quill.on('text-change', function () {
        var len = quill.getLength() - 1;
        draft[cfg.key] = len <= 0 ? '' : quill.root.innerHTML;
        refresh();
      });
    });
    wrap.appendChild(bodyRow);

    // ปุ่ม (ข้อความ) TH/EN
    wrap.appendChild(textPairField('ปุ่ม (ข้อความ)', 'button_text_th', 'button_text_en'));

    // ปุ่ม (ลิงก์) TH/EN
    wrap.appendChild(textPairField('ปุ่ม (ลิงก์)', 'button_link', 'button_link_en'));

    // ปุ่ม (รูปแบบ + สี) — 3 แบบ: Text Link (ขีดเส้นใต้ เดิม) / Primary (ปุ่มทึบ) / Primary Outline (ปุ่มขอบ)
    // สีปรับแยกจากรูปแบบได้อิสระ (ใช้ได้กับ Primary/Primary Outline เท่านั้น — Text Link ไม่มีพื้น/ขอบให้ปรับสี)
    var buttonStyleField = document.createElement('div');
    buttonStyleField.className = 'cms-field';
    var buttonStyleLabel = document.createElement('label');
    buttonStyleLabel.textContent = 'ปุ่ม (รูปแบบ)';
    var buttonStylePicker = document.createElement('div');
    buttonStylePicker.className = 'cms-align-picker';

    var buttonColorField = document.createElement('div');
    buttonColorField.className = 'cms-field';
    buttonColorField.style.marginTop = '10px';
    var buttonColorLabel = document.createElement('label');
    buttonColorLabel.textContent = 'ปุ่ม (สี) — ว่างไว้ = ใช้สี Primary ของเว็บ';
    var buttonColorWrap = document.createElement('div');
    buttonColorWrap.className = 'cms-color-field';
    var buttonColorSwatch = document.createElement('input');
    buttonColorSwatch.type = 'color';
    buttonColorSwatch.value = draft.button_color || '#1b5ef9';
    var buttonColorText = document.createElement('input');
    buttonColorText.type = 'text';
    buttonColorText.placeholder = '#1b5ef9 หรือ rgb(27,94,249)';
    buttonColorText.value = draft.button_color || '';
    buttonColorSwatch.addEventListener('input', function () {
      buttonColorText.value = buttonColorSwatch.value;
      draft.button_color = buttonColorSwatch.value;
      refresh();
    });
    buttonColorText.addEventListener('input', function () {
      draft.button_color = buttonColorText.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(buttonColorText.value)) buttonColorSwatch.value = buttonColorText.value;
      refresh();
    });
    buttonColorWrap.appendChild(buttonColorSwatch);
    buttonColorWrap.appendChild(buttonColorText);
    buttonColorField.appendChild(buttonColorLabel);
    buttonColorField.appendChild(buttonColorWrap);
    buttonColorField.classList.toggle('is-disabled', draft.button_style === 'text-link');

    [
      { value: 'text-link', text: 'Text Link' },
      { value: 'primary', text: 'Primary' },
      { value: 'primary-outline', text: 'Primary Outline' },
    ].forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cms-align-picker__btn' + (draft.button_style === opt.value ? ' is-active' : '');
      btn.textContent = opt.text;
      btn.addEventListener('click', function () {
        draft.button_style = opt.value;
        buttonStylePicker.querySelectorAll('.cms-align-picker__btn').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        buttonColorField.classList.toggle('is-disabled', opt.value === 'text-link');
        refresh();
      });
      buttonStylePicker.appendChild(btn);
    });
    buttonStyleField.appendChild(buttonStyleLabel);
    buttonStyleField.appendChild(buttonStylePicker);
    wrap.appendChild(buttonStyleField);
    wrap.appendChild(buttonColorField);

    // Anchor ID
    var anchorField = document.createElement('div');
    anchorField.className = 'cms-field';
    var anchorLabel = document.createElement('label');
    anchorLabel.textContent = 'Anchor ID (ตัวเลือกเพิ่มเติม)';
    var anchorInput = document.createElement('input');
    anchorInput.type = 'text';
    anchorInput.placeholder = 'เช่น history — ใส่ถ้าต้องการให้เมนูย่อยลิงก์มาที่ section นี้โดยตรง เช่น #history';
    anchorInput.value = draft.anchor_id || '';
    anchorInput.addEventListener('input', function () {
      draft.anchor_id = anchorInput.value.trim();
      refresh();
    });
    anchorField.appendChild(anchorLabel);
    anchorField.appendChild(anchorInput);
    wrap.appendChild(anchorField);

    return wrap;
  }

  function buildCard(item, isFirst, isLast) {
    var draft = getDraft(item);
    var card = document.createElement('div');
    card.className = 'cms-section-card' + (item.is_active ? '' : ' is-inactive');
    card.dataset.id = item.id;

    var header = document.createElement('div');
    header.className = 'cms-section-card__header';

    var STATIC_PROXY_LABELS = {
      'products': 'Online Shop',
      'news-events': 'Newsroom',
      'our-partners': 'Our Partners',
      'contact-us': 'Contact Us',
      'apply-now': 'ฟอร์มสมัครงาน',
    };

    var titleEl = document.createElement('span');
    titleEl.className = 'cms-section-card__title';
    if (isKvBannerSection(item)) {
      var bannerTitle = kvBannerTitles[item.anchor_id.slice(KV_BANNER_PREFIX.length)];
      titleEl.textContent = 'KV Banner' + (bannerTitle ? ' — ' + bannerTitle : '') + ' (จัดการเนื้อหาที่ Banner Management)';
    } else {
      titleEl.textContent = isStaticProxySection(item)
        ? (STATIC_PROXY_LABELS[item.anchor_id] || item.anchor_id) + ' (เนื้อหาจริงจากหน้าเว็บ)'
        : (item.heading_th || (item.layout === 'custom-html' ? 'Custom HTML' : '(ไม่มีหัวข้อ)'));
    }
    header.appendChild(titleEl);

    var collapseBtn = document.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'cms-section-card__collapse-btn';
    collapseBtn.setAttribute('aria-expanded', 'true');
    collapseBtn.innerHTML = '▾ ย่อ';
    header.appendChild(collapseBtn);

    card.appendChild(header);

    var body = document.createElement('div');
    body.className = 'cms-section-card__body';

    var frame;
    if (isStaticProxySection(item)) {
      // ไม่มี HTML ให้ preview จริง (แค่ marker) — โชว์ placeholder แทน iframe ว่างเปล่า
      var placeholder = document.createElement('div');
      placeholder.className = 'cms-section-card__frame';
      placeholder.style.cssText = 'display:flex; align-items:center; justify-content:center; height:120px; color:var(--cms-text-faint); font-size:13px; background:var(--cms-bg);';
      placeholder.textContent = '(ดูตัวอย่างจริงได้ที่หน้าเว็บจริงของเพจนี้)';
      body.appendChild(placeholder);
    } else {
      frame = document.createElement('iframe');
      frame.className = 'cms-section-card__frame';
      frame.title = item.heading_th || 'section preview';
      frame.scrolling = 'no';
      frame.addEventListener('load', function () {
        try {
          var h = frame.contentDocument.documentElement.scrollHeight;
          frame.style.height = h + 'px';
        } catch (err) { /* เผื่อ srcdoc ยังโหลดไม่เสร็จ ไม่ต้องทำอะไร */ }
      });
      frame.srcdoc = buildPreviewDoc(mergedSection(item, draft));
      body.appendChild(frame);
    }

    body.appendChild(buildQuickEditFields(item, draft, frame));
    card.appendChild(body);

    collapseBtn.addEventListener('click', function () {
      var expanded = collapseBtn.getAttribute('aria-expanded') === 'true';
      var next = !expanded;
      body.hidden = !next;
      collapseBtn.setAttribute('aria-expanded', String(next));
      collapseBtn.innerHTML = next ? '▾ ย่อ' : '▸ ขยาย';
    });

    var row = document.createElement('div');
    row.className = 'cms-section-card__row';

    var reorderWrap = document.createElement('div');
    reorderWrap.className = 'cms-section-card__reorder';

    var upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'cms-btn cms-btn--ghost';
    upBtn.title = 'เลื่อนขึ้น';
    upBtn.textContent = '▲';
    upBtn.disabled = isFirst;
    upBtn.addEventListener('click', function () { moveItem(item, -1); });
    reorderWrap.appendChild(upBtn);

    var downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'cms-btn cms-btn--ghost';
    downBtn.title = 'เลื่อนลง';
    downBtn.textContent = '▼';
    downBtn.disabled = isLast;
    downBtn.addEventListener('click', function () { moveItem(item, 1); });
    reorderWrap.appendChild(downBtn);

    row.appendChild(reorderWrap);

    var actions = document.createElement('div');
    actions.className = 'cms-banner-card__actions';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cms-toggle' + (item.is_active ? ' is-on' : '');
    toggle.setAttribute('aria-label', item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน');
    toggle.innerHTML = '<span class="cms-toggle__knob"></span>';
    toggle.addEventListener('click', function () { toggleActive(item); });
    actions.appendChild(toggle);

    var imageBtn = document.createElement('button');
    imageBtn.type = 'button';
    imageBtn.className = 'cms-btn cms-btn--ghost';
    imageBtn.title = 'แก้ไข';
    imageBtn.innerHTML = '✏️ แก้ไข';
    imageBtn.addEventListener('click', function () { openModal(item.id); });
    actions.appendChild(imageBtn);

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cms-btn cms-btn--ghost';
    deleteBtn.title = 'ลบ';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', function () { deleteItem(item); });
    actions.appendChild(deleteBtn);

    row.appendChild(actions);
    card.appendChild(row);

    return card;
  }

  /* ===== Data actions ===== */

  async function loadItems() {
    var { data, error } = await window.cmsSupabase
      .from(TABLE)
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (error) {
      window.cmsToast('โหลด section ไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    items = data || [];
    await loadKvBannerTitles();
    render();
  }

  // ดึงชื่อ (title_th) ของ banner ที่ผูกกับการ์ด "KV Banner" แต่ละใบมาแสดงแยกแยะกัน — ล้มเหลวแบบเงียบๆ ได้
  // (แค่โชว์ "KV Banner" เฉยๆ ไม่มีชื่อต่อท้าย) เพราะไม่ควรทำให้หน้ารายการ section พังตามส่วนเสริมนี้
  async function loadKvBannerTitles() {
    var bannerIds = items
      .filter(isKvBannerSection)
      .map(function (it) { return it.anchor_id.slice(KV_BANNER_PREFIX.length); });
    kvBannerTitles = {};
    if (!bannerIds.length) return;

    var { data } = await window.cmsSupabase.from('banners').select('id, title_th').in('id', bannerIds);
    (data || []).forEach(function (b) { kvBannerTitles[b.id] = b.title_th; });
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

  async function moveItem(item, direction) {
    var sorted = items.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
    var idx = sorted.findIndex(function (s) { return s.id === item.id; });
    var swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    var other = sorted[swapIdx];
    var tmp = item.sort_order;
    item.sort_order = other.sort_order;
    other.sort_order = tmp;
    render();

    var results = await Promise.all([
      window.cmsSupabase.from(TABLE).update({ sort_order: item.sort_order }).eq('id', item.id),
      window.cmsSupabase.from(TABLE).update({ sort_order: other.sort_order }).eq('id', other.id),
    ]);
    var failed = results.find(function (r) { return r.error; });
    if (failed) {
      window.cmsToast('เรียงลำดับไม่สำเร็จ: ' + failed.error.message, 'error');
      await loadItems();
    }
  }

  async function deleteItem(item) {
    if (!window.confirm('ลบ section "' + (item.heading_th || item.id) + '"? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    delete draftsById[item.id];
    window.cmsToast('ลบ section เรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal: จัดการรูปภาพ (รูปภาพ + ตำแหน่งเท่านั้น — สร้าง section ใหม่ก็เริ่มจาก modal นี้) ===== */

  function setLayout(layout) {
    lastPositionLayout = layout;
    fieldLayout.value = layout;
    layoutPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.layout === layout);
    });
  }

  // Custom HTML: ปิดใช้งานการอัปโหลดรูป + การกำหนดรูปแบบพร้อมกัน เพื่อให้ระบบใช้งานจาก HTML ที่ระบุอย่างเดียว
  function setCustomHtmlMode(enabled) {
    fieldUseCustomHtml.checked = enabled;
    fieldLayout.value = enabled ? 'custom-html' : lastPositionLayout;
    layoutPickerField.classList.toggle('is-disabled', enabled);
    document.getElementById('sectionImagesField').classList.toggle('is-disabled', enabled);
    layoutPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) { btn.disabled = enabled; });
  }

  // เลือกรูปแบบพื้นหลัง: รูปภาพ (เดิม) / สีพื้น / gradient เส้นตรง — สลับ field ที่เกี่ยวข้องให้เห็นตามที่เลือก
  function setBgType(type) {
    fieldBgType.value = type;
    bgTypePicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.bgType === type);
    });
    bgImageFields.hidden = type !== 'image';
    bgColorFields.hidden = type !== 'color';
    bgGradientFields.hidden = type !== 'gradient';
  }

  function setBgGradientDirection(direction) {
    fieldBgGradientDirection.value = direction;
    bgGradientDirectionPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.direction === direction);
    });
  }

  function setBgFields(bg) {
    setBgType(bg.bg_type || 'image');
    fieldBgImage.value = bg.bg_image || '';
    fieldBgColor.value = bg.bg_color || '#ffffff';
    fieldBgColorText.value = bg.bg_color || '';
    fieldBgGradientFrom.value = bg.bg_gradient_from || '#ffffff';
    fieldBgGradientFromText.value = bg.bg_gradient_from || '';
    fieldBgGradientTo.value = bg.bg_gradient_to || '#000000';
    fieldBgGradientToText.value = bg.bg_gradient_to || '';
    setBgGradientDirection(bg.bg_gradient_direction || 'to bottom');
    fieldBgOpacity.value = bg.bg_opacity == null ? 100 : bg.bg_opacity;
    fieldBgGrayscale.value = bg.bg_grayscale == null ? 0 : bg.bg_grayscale;
    document.getElementById('fieldBgOpacityValue').textContent = fieldBgOpacity.value;
    document.getElementById('fieldBgGrayscaleValue').textContent = fieldBgGrayscale.value;
    if (bgImageUploadWidget) bgImageUploadWidget.updatePreview();
  }

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    setLayout('image-left');
    setCustomHtmlMode(false);

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'จัดการรูปภาพ';
      sectionImages = (item.images && item.images.length) ? item.images.slice() : [];
      // image_links อาจสั้นกว่า/ไม่มีเลย (section เก่าก่อน schema-pages-v9) — pad เป็น '' ให้ครบตามจำนวนรูป
      sectionImageLinks = sectionImages.map(function (_, i) {
        return (item.image_links && item.image_links[i]) || '';
      });
      var isCustomHtml = item.layout === 'custom-html';
      if (!isCustomHtml) setLayout(item.layout || 'image-left');
      setCustomHtmlMode(isCustomHtml);
      setBgFields(item);
      fieldImagesGrayscale.checked = item.images_grayscale !== false;
    } else {
      modalTitle.textContent = 'เพิ่ม Section ใหม่ (รูปภาพ + ตำแหน่ง)';
      sectionImages = [];
      sectionImageLinks = [];
      setBgFields({});
      fieldImagesGrayscale.checked = true;
    }

    renderImagesGrid();
    modalOverlay.hidden = false;
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

    var layout = fieldLayout.value || 'image-left';
    var isCustomHtml = layout === 'custom-html';

    if (!isCustomHtml && !sectionImages.length) {
      formError.textContent = 'กรุณาอัปโหลดรูปภาพของ section อย่างน้อย 1 ภาพ';
      focusField(imagesGrid.querySelector('.cms-product-image-add') || imagesGrid);
      return;
    }

    var payload = {
      images: isCustomHtml ? [] : sectionImages,
      image_links: isCustomHtml ? [] : sectionImages.map(function (_, i) { return sectionImageLinks[i] || ''; }),
      layout: layout,
      images_grayscale: fieldImagesGrayscale.checked,
      bg_type: fieldBgType.value || 'image',
      bg_image: fieldBgImage.value.trim(),
      bg_color: fieldBgColorText.value.trim(),
      bg_gradient_from: fieldBgGradientFromText.value.trim(),
      bg_gradient_to: fieldBgGradientToText.value.trim(),
      bg_gradient_direction: fieldBgGradientDirection.value || 'to bottom',
      bg_opacity: parseInt(fieldBgOpacity.value, 10),
      bg_grayscale: parseInt(fieldBgGrayscale.value, 10),
    };

    var submitBtn = document.getElementById('sectionFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await window.cmsSupabase.from(TABLE).update(payload).eq('id', editingId);
    } else {
      payload.page_id = pageId;
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

    window.cmsToast(editingId ? 'แก้ไขรูปภาพเรียบร้อยแล้ว' : 'เพิ่ม Section เรียบร้อยแล้ว', 'success');
    closeModal();
    await loadItems();
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    await loadPage();
    if (!page) return;

    imageFileInput.addEventListener('change', function () { handleImageFileSelected(); });

    bgImageUploadWidget = window.cmsBindImageUpload({
      fileInput: document.getElementById('fieldBgImageFile'),
      urlInput: fieldBgImage,
      preview: document.getElementById('fieldBgImagePreview'),
      statusEl: document.getElementById('fieldBgImageStatus'),
      dropzone: document.getElementById('fieldBgImageDropzone'),
    });

    bgTypePicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setBgType(btn.dataset.bgType); });
    });
    bgGradientDirectionPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setBgGradientDirection(btn.dataset.direction); });
    });

    // sync <input type="color"> (swatch) กับช่องข้อความ (hex/rgb) ให้แก้จากฝั่งไหนก็ได้
    function syncColorPair(colorInput, textInput) {
      colorInput.addEventListener('input', function () { textInput.value = colorInput.value; });
      textInput.addEventListener('input', function () {
        if (/^#[0-9a-fA-F]{6}$/.test(textInput.value)) colorInput.value = textInput.value;
      });
    }
    syncColorPair(fieldBgColor, fieldBgColorText);
    syncColorPair(fieldBgGradientFrom, fieldBgGradientFromText);
    syncColorPair(fieldBgGradientTo, fieldBgGradientToText);

    // ⚠️ แก้บั๊ก: เดิมถ้าเลือกรูปแบบพื้นหลังเป็นอย่างหนึ่ง (เช่น "สีพื้น") แล้วแอดมินไปอัปโหลดรูป/พิมพ์สี
    // ในช่องของรูปแบบอื่นที่ไม่ได้เลือกไว้ (ซึ่งซ่อนอยู่ แต่ยังกรอกได้ถ้าเคยเปิดมาก่อน) ค่าที่กรอกจะถูก
    // บันทึกลง DB จริงแต่ไม่มีผลอะไรเลยตอนแสดงผล เพราะ page-render.js ใช้ค่าตาม bg_type ที่เลือกไว้เท่านั้น
    // (เช่น อัปโหลดรูปขณะเลือก "สีพื้น" ไว้ รูปจะถูกบันทึกแต่หน้าเว็บจะยังโชว์สีเดิม ไม่เปลี่ยนตามรูปที่อัปโหลด)
    // แก้โดยสลับ bg_type ให้อัตโนมัติทันทีที่แอดมันเริ่มโต้ตอบกับฟิลด์ของรูปแบบไหน ให้ตรงกับสิ่งที่กำลังทำอยู่เสมอ
    fieldBgImage.addEventListener('input', function () { setBgType('image'); });
    document.getElementById('fieldBgImageFile').addEventListener('change', function () { setBgType('image'); });
    fieldBgColor.addEventListener('input', function () { setBgType('color'); });
    fieldBgColorText.addEventListener('input', function () { setBgType('color'); });
    [fieldBgGradientFrom, fieldBgGradientFromText, fieldBgGradientTo, fieldBgGradientToText].forEach(function (el) {
      el.addEventListener('input', function () { setBgType('gradient'); });
    });

    fieldBgOpacity.addEventListener('input', function () {
      document.getElementById('fieldBgOpacityValue').textContent = fieldBgOpacity.value;
    });
    fieldBgGrayscale.addEventListener('input', function () {
      document.getElementById('fieldBgGrayscaleValue').textContent = fieldBgGrayscale.value;
    });
    document.getElementById('removeBgImageBtn').addEventListener('click', function () {
      fieldBgImage.value = '';
      if (bgImageUploadWidget) bgImageUploadWidget.updatePreview();
    });

    document.getElementById('saveAllBtn').addEventListener('click', saveAll);

    layoutPicker.querySelectorAll('.cms-align-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setLayout(btn.dataset.layout); });
    });
    fieldUseCustomHtml.addEventListener('change', function () { setCustomHtmlMode(fieldUseCustomHtml.checked); });

    document.getElementById('addSectionBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('sectionModalClose').addEventListener('click', closeModal);
    document.getElementById('sectionModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!modalOverlay.hidden) closeModal();
    });
    form.addEventListener('submit', submitForm);

    await loadItems();
  });
})();
