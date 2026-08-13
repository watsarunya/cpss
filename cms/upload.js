/* cms/upload.js — อัปโหลดรูปภาพขึ้น Supabase Storage (bucket "cms-uploads") ใช้ร่วมกันทุกหน้าใน cms/
   ใช้ได้กับทั้ง Menu Management (icon/image) และ Banner Management (image TH/EN) */
(function () {
  var BUCKET = 'cms-uploads';
  var MAX_SIZE_MB = 5;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

  function safeExt(filename) {
    var m = /\.([a-zA-Z0-9]+)$/.exec(filename || '');
    return m ? m[1].toLowerCase() : 'jpg';
  }

  function randomId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  /* คืนค่า { url, error } — ใช้ผ่าน await window.cmsUploadImage(file) */
  window.cmsUploadImage = async function (file) {
    if (!file) return { error: 'ไม่พบไฟล์' };
    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      return { error: 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF, SVG)' };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { error: 'ไฟล์ใหญ่เกินไป (สูงสุด ' + MAX_SIZE_MB + 'MB)' };
    }

    var path = randomId() + '.' + safeExt(file.name);
    var { error } = await window.cmsSupabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      return { error: 'อัปโหลดไม่สำเร็จ: ' + error.message };
    }

    var { data } = window.cmsSupabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  };

  /* อัปโหลดไฟล์ชนิดอื่น (ไม่ใช่รูปภาพ) ขึ้น bucket เดียวกัน — ใช้ครั้งแรกกับ PDF ในหน้า "Spare Parts"
     (คลังเอกสารอะไหล่) รับ opts.allowedTypes/opts.typeErrorMessage/opts.maxSizeMb เพื่อ validate ตามชนิดไฟล์
     ที่ต้องการ (cmsUploadImage เดิมไม่แก้ เพราะ path/logic อัปโหลดจริงเหมือนกันเป๊ะ แค่ validation ต่างกัน) */
  window.cmsUploadFile = async function (file, opts) {
    opts = opts || {};
    var allowedTypes = opts.allowedTypes || null;
    var maxSizeMb = opts.maxSizeMb || 20;

    if (!file) return { error: 'ไม่พบไฟล์' };
    if (allowedTypes && allowedTypes.indexOf(file.type) === -1) {
      return { error: opts.typeErrorMessage || 'ชนิดไฟล์นี้ไม่รองรับ' };
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return { error: 'ไฟล์ใหญ่เกินไป (สูงสุด ' + maxSizeMb + 'MB)' };
    }

    var path = randomId() + '.' + safeExt(file.name);
    var { error } = await window.cmsSupabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      return { error: 'อัปโหลดไม่สำเร็จ: ' + error.message };
    }

    var { data } = window.cmsSupabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, filename: file.name };
  };

  /* ผูก UI สำหรับอัปโหลดไฟล์ที่ไม่ใช่รูปภาพ (เช่น PDF) — ไม่มี <img> preview แต่โชว์ชื่อไฟล์ปัจจุบันแทน
     (ดึงชื่อไฟล์จาก URL ที่เก็บไว้ เพราะไม่ได้เก็บชื่อไฟล์เดิมแยกในฟิลด์ url เอง) โครงเดียวกับ
     cmsBindImageUpload แต่แยกฟังก์ชันเพราะ preview เป็น text ไม่ใช่รูป */
  window.cmsBindFileUpload = function (opts) {
    var fileInput = opts.fileInput;
    var urlInput = opts.urlInput;
    var fileNameEl = opts.fileNameEl;
    var statusEl = opts.statusEl;
    var dropzone = opts.dropzone;
    var uploadOpts = opts.uploadOpts || {};

    function updatePreview() {
      if (!fileNameEl) return;
      var val = urlInput.value.trim();
      if (val) {
        var decoded = decodeURIComponent(val.split('/').pop() || '');
        fileNameEl.textContent = decoded;
        fileNameEl.hidden = false;
      } else {
        fileNameEl.textContent = '';
        fileNameEl.hidden = true;
      }
    }

    if (urlInput) {
      urlInput.addEventListener('input', updatePreview);
      updatePreview();
    }

    async function handleFile(file) {
      if (!file) return;

      if (statusEl) statusEl.textContent = 'กำลังอัปโหลด...';
      var result = await window.cmsUploadFile(file, uploadOpts);
      if (fileInput) fileInput.value = '';

      if (result.error) {
        if (statusEl) statusEl.textContent = result.error;
        if (window.cmsToast) window.cmsToast(result.error, 'error');
        return;
      }

      urlInput.value = result.url;
      updatePreview();
      if (statusEl) statusEl.textContent = 'อัปโหลดสำเร็จ';
      setTimeout(function () {
        if (statusEl) statusEl.textContent = '';
      }, 2500);

      // hook เสริม (opts.onFile) — เรียกหลังอัปโหลดไฟล์หลักสำเร็จ ส่ง raw File กลับไปให้ผู้เรียกใช้ทำ
      // อย่างอื่นต่อได้เอง (เช่น cms/spare-parts.js ใช้สร้างรูปปกจากหน้าแรกของ PDF อัตโนมัติ) ไม่รอ/ไม่บล็อก
      // การอัปโหลดไฟล์หลัก เพราะเป็นงานเสริมที่ล้มเหลวได้โดยไม่ควรทำให้อัปโหลดไฟล์หลักดูเหมือนพัง
      if (typeof opts.onFile === 'function') {
        opts.onFile(file);
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        handleFile(file);
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', function () { fileInput.click(); });

      ['dragenter', 'dragover'].forEach(function (evt) {
        dropzone.addEventListener(evt, function (e) {
          e.preventDefault();
          dropzone.classList.add('is-dragover');
        });
      });
      ['dragleave', 'dragend'].forEach(function (evt) {
        dropzone.addEventListener(evt, function () {
          dropzone.classList.remove('is-dragover');
        });
      });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
      });
    }

    return { updatePreview: updatePreview };
  };

  /* สร้างรูปปกจากหน้าแรกของไฟล์ PDF อัตโนมัติ (ใช้ครั้งแรกกับหน้า "Spare Parts" กันแอดมินต้องหารูปหน้าปก
     มาอัปโหลดเองทุกครั้ง) render หน้า 1 ของ PDF ลง <canvas> ด้วย PDF.js (โหลดผ่าน CDN ใน spare-parts.html
     ก่อนไฟล์นี้) แล้วแปลง canvas เป็นไฟล์รูป JPEG อัปโหลดขึ้น bucket เดียวกับรูปอื่นๆ ผ่าน cmsUploadImage เดิม
     คืนค่า { url, error } แบบเดียวกับฟังก์ชันอัปโหลดอื่นในไฟล์นี้ — ทำงานฝั่ง client ล้วนๆ ไม่ต้องมี server
     แปลง PDF เป็นรูปแยกต่างหาก (เว็บนี้เป็น static site ไม่มี server ให้ประมวลผลไฟล์อยู่แล้ว) */
  window.cmsGeneratePdfCoverImage = async function (file) {
    if (!file) return { error: 'ไม่พบไฟล์ PDF' };
    if (!window.pdfjsLib) return { error: 'PDF.js ยังไม่พร้อมใช้งาน (โหลดสคริปต์ไม่สำเร็จ)' };

    var pdf;
    try {
      var arrayBuffer = await file.arrayBuffer();
      pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      return { error: 'อ่านไฟล์ PDF ไม่สำเร็จ (สร้างรูปปกอัตโนมัติไม่ได้): ' + err.message };
    }

    var page = await pdf.getPage(1);
    var viewport = page.getViewport({ scale: 1.4 });
    var canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    var ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    var blob = await new Promise(function (resolve) {
      canvas.toBlob(function (b) { resolve(b); }, 'image/jpeg', 0.85);
    });
    if (!blob) return { error: 'สร้างรูปปกจาก PDF ไม่สำเร็จ' };

    var coverFile = new File([blob], 'pdf-cover-' + randomId() + '.jpg', { type: 'image/jpeg' });
    return window.cmsUploadImage(coverFile);
  };

  /* ผูก UI แบบสำเร็จรูป: file input + preview <img> + text input (URL) ที่มีอยู่แล้ว + dropzone (คลิก/
     ลากไฟล์จาก desktop มาวางได้จริง — ไม่ใช่แค่ดีไซน์) เรียกใช้ครั้งเดียวตอน DOMContentLoaded โดยส่ง
     element ที่เกี่ยวข้องเข้ามา (opts.dropzone เป็น optional — ถ้าไม่ส่งมาก็ยังใช้ fileInput ตรงๆ ได้เหมือนเดิม) */
  window.cmsBindImageUpload = function (opts) {
    var fileInput = opts.fileInput;
    var urlInput = opts.urlInput;
    var preview = opts.preview;
    var statusEl = opts.statusEl;
    var dropzone = opts.dropzone;

    function updatePreview() {
      if (!preview) return;
      var val = urlInput.value.trim();
      if (val) {
        preview.src = val;
        preview.hidden = false;
      } else {
        preview.hidden = true;
      }
    }

    if (urlInput) {
      urlInput.addEventListener('input', updatePreview);
      updatePreview();
    }

    async function handleFile(file) {
      if (!file) return;

      if (statusEl) statusEl.textContent = 'กำลังอัปโหลด...';
      var result = await window.cmsUploadImage(file);
      if (fileInput) fileInput.value = '';

      if (result.error) {
        if (statusEl) statusEl.textContent = result.error;
        if (window.cmsToast) window.cmsToast(result.error, 'error');
        return;
      }

      urlInput.value = result.url;
      updatePreview();
      if (statusEl) statusEl.textContent = 'อัปโหลดสำเร็จ';
      setTimeout(function () {
        if (statusEl) statusEl.textContent = '';
      }, 2500);
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        handleFile(file);
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', function () { fileInput.click(); });

      ['dragenter', 'dragover'].forEach(function (evt) {
        dropzone.addEventListener(evt, function (e) {
          e.preventDefault();
          dropzone.classList.add('is-dragover');
        });
      });
      ['dragleave', 'dragend'].forEach(function (evt) {
        dropzone.addEventListener(evt, function () {
          dropzone.classList.remove('is-dragover');
        });
      });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
      });
    }

    return { updatePreview: updatePreview };
  };

  /* Toolbar กลางสำหรับ Quill rich text editor ทุกจุดในระบบ (สินค้า/บทความ/section ของเพจ) — ให้ครบ:
     ขนาดตัวอักษรตามระบบ H1/H2/H3/ปกติ, สีตัวอักษร, จัดตำแหน่ง (ซ้าย/กลาง/ขวา), แทรกรูป, ลิงก์
     ใช้ร่วมกับ window.cmsBindQuillImageUpload() ด้านล่างเสมอ ไม่งั้นปุ่มแทรกรูปจะ prompt() ให้พิมพ์ URL เอง
     ตามพฤติกรรม default ของ Quill แทนที่จะอัปโหลดไฟล์จริงขึ้น Supabase Storage เหมือนรูปอื่นๆ ในระบบ */
  window.CMS_QUILL_TOOLBAR = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ];

  // จำกัด format ที่ editor ยอมรับไว้แค่เท่าที่มีปุ่มใน toolbar ด้านบน — กันปัญหาคัดลอกข้อความจากที่อื่น
  // (Word/Google Docs/เว็บอื่น) แล้วมี format ติดมาด้วยที่ไม่ได้ตั้งใจ โดยเฉพาะ "background" (สีพื้นหลังของ
  // ตัวอักษร) ซึ่ง Quill รองรับ format นี้อยู่แล้วในตัวแม้ไม่มีปุ่มในหน้า toolbar ก็ตาม พอวางข้อความที่มี
  // background-color ติดมา (พบบ่อยเวลาก็อปจากเอกสารอื่น) จะโดนแปลงเป็น format นี้อัตโนมัติ แล้วโผล่ทับ
  // พื้นหลัง (bg_image) ของ section เอง — ใส่ `formats` ที่นี่ให้ Quill กรอง format ที่ไม่ได้อยู่ในลิสต์นี้
  // ออกทั้งหมด ทั้งตอนพิมพ์เองและตอนวาง (paste) จากที่อื่น
  // ⚠️ 'width' (ใช้ปรับขนาดรูปภาพ — ดู bindQuillImageResize() ด้านล่าง) **ห้ามใส่ในลิสต์นี้** แม้จะดูเข้าท่า
  // ก็ตาม — ทดสอบแล้วว่า Quill 2.x จะ throw "Cannot register 'width' specified in formats config" ทันทีตอน
  // new Quill() เพราะ `formats:` option ต้องเป็นชื่อ format/blot ที่ "ลงทะเบียน" อยู่ใน registry จริงๆ เท่านั้น
  // (เช่น attributor หรือ blot แยกต่างหาก) แต่ 'width' เป็นแค่ attribute ภายในของ Image blot เอง (ไม่ใช่
  // format ที่ลงทะเบียนแยก) — ไม่ต้องใส่ก็ใช้งานได้ปกติอยู่แล้ว เพราะ quill.formatText(idx, 1, 'width', v)
  // เรียกลงไปที่ Image blot's format() ตรงๆ ไม่ผ่านการเช็ค registry ที่ถูกจำกัดโดย option นี้เลย
  window.CMS_QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'color', 'align', 'list', 'link', 'image'];

  // ปุ่ม "แทรกรูป" ใน toolbar อัปโหลดไฟล์จริงขึ้น Supabase Storage แล้วแทรกที่ตำแหน่ง cursor แทนการ
  // prompt() ให้พิมพ์ URL เอง — เรียกครั้งเดียวหลังสร้าง Quill instance เสร็จ (new Quill(...))
  window.cmsBindQuillImageUpload = function (quill) {
    quill.getModule('toolbar').addHandler('image', function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', async function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var range = quill.getSelection(true);
        var result = await window.cmsUploadImage(file);
        if (result.error) {
          if (window.cmsToast) window.cmsToast(result.error, 'error');
          return;
        }
        quill.insertEmbed(range.index, 'image', result.url, 'user');
        quill.setSelection(range.index + 1);
      });
      input.click();
    });
    bindQuillImageResize(quill);
  };

  /* คลิกรูปในเนื้อหา editor แล้วโชว์ toolbar ลอย (ซ้าย/กลาง/ขวา/เต็มความกว้าง/รีเซ็ต) + จุดลากมุมขวาล่าง
     สำหรับปรับขนาดอิสระ — ใช้ format 'width' ของ Image blot เดิมของ Quill (setAttribute จริงบน <img>) สำหรับ
     ขนาด และ format 'align' เดิม (ปุ่มเดียวกับ toolbar หลัก ใช้กับ heading/paragraph อยู่แล้ว) กับบรรทัดที่มี
     รูปอยู่สำหรับตำแหน่ง — ไม่ต้องเขียน Parchment format ใหม่เอง ผูกอัตโนมัติทุกจุดที่เรียก
     cmsBindQuillImageUpload() อยู่แล้ว (สินค้า/บทความ/section เพจ) ไม่ต้องแก้ไฟล์อื่นเพิ่ม */
  function bindQuillImageResize(quill) {
    var activeImg = null;

    var toolbar = document.createElement('div');
    toolbar.className = 'cms-img-toolbar';
    toolbar.hidden = true;
    toolbar.innerHTML =
      '<button type="button" data-align="left" title="ชิดซ้าย">⬅</button>' +
      '<button type="button" data-align="center" title="กึ่งกลาง">⬌</button>' +
      '<button type="button" data-align="right" title="ชิดขวา">➡</button>' +
      '<button type="button" data-align="full" title="เต็มความกว้าง">⛶</button>' +
      '<button type="button" data-action="reset" title="รีเซ็ตขนาด">↺</button>';
    document.body.appendChild(toolbar);

    var handle = document.createElement('div');
    handle.className = 'cms-img-resize-handle';
    handle.hidden = true;
    handle.title = 'ลากเพื่อปรับขนาด';
    document.body.appendChild(handle);

    function imageIndex(img) {
      var blot = window.Quill.find(img);
      return blot ? quill.getIndex(blot) : null;
    }

    function positionControls() {
      if (!activeImg || !activeImg.isConnected) {
        hideControls();
        return;
      }
      var rect = activeImg.getBoundingClientRect();
      toolbar.style.top = Math.max(4, rect.top - 40) + 'px';
      toolbar.style.left = rect.left + 'px';
      handle.style.top = rect.bottom - 9 + 'px';
      handle.style.left = rect.right - 9 + 'px';
    }

    function showControls(img) {
      activeImg = img;
      toolbar.hidden = false;
      handle.hidden = false;
      positionControls();
    }

    function hideControls() {
      activeImg = null;
      toolbar.hidden = true;
      handle.hidden = true;
    }

    quill.root.addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') {
        showControls(e.target);
      } else {
        hideControls();
      }
    });

    document.addEventListener('click', function (e) {
      if (!activeImg) return;
      if (e.target === activeImg || toolbar.contains(e.target) || handle.contains(e.target)) return;
      hideControls();
    }, true);

    window.addEventListener('scroll', function () { positionControls(); }, true);
    window.addEventListener('resize', positionControls);

    toolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !activeImg) return;
      var idx = imageIndex(activeImg);
      if (idx == null) return;

      if (btn.dataset.action === 'reset') {
        quill.formatText(idx, 1, 'width', false, 'user');
      } else if (btn.dataset.align === 'full') {
        quill.formatText(idx, 1, 'width', '100%', 'user');
        quill.formatLine(idx, 1, 'align', false, 'user');
      } else {
        quill.formatLine(idx, 1, 'align', btn.dataset.align === 'left' ? false : btn.dataset.align, 'user');
      }
      setTimeout(positionControls, 0);
    });

    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (!activeImg) return;
      var img = activeImg;
      var startX = e.clientX;
      var startWidth = img.getBoundingClientRect().width;

      function onMove(ev) {
        var newWidth = Math.max(40, Math.round(startWidth + (ev.clientX - startX)));
        img.setAttribute('width', String(newWidth));
        positionControls();
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        var idx = imageIndex(img);
        if (idx != null) quill.formatText(idx, 1, 'width', img.getAttribute('width'), 'user');
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
})();
