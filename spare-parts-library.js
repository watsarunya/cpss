/* spare-parts-library.js — หน้า Spare Parts Library (spare-part.html)
   ดึงรายการเอกสารจริงจาก Supabase (spare_parts_documents, จัดการผ่าน cms/spare-parts.html) มาสร้างการ์ด
   ในกริด #sparePartsDocGrid แทนการ์ด static เดิม แล้วผูกคลิก "สลับพรีวิว PDF ทางขวา" ให้เหมือนเดิมทุกประการ
   แยกไฟล์ต่างหาก ไม่ฝังใน body_th ของ custom-html section เพราะ DOMPurify.sanitize() ที่ page-render.js
   ใช้ตัดแท็ก <script> ทิ้งเสมอตามค่าเริ่มต้น */
(function () {
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function buildCard(doc, isFirst) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ch-document-card' + (isFirst ? ' is-selected' : '');
    btn.dataset.pdf = doc.pdf_url;
    btn.dataset.brand = doc.brand || '';
    btn.dataset.name = doc.title || '';
    if (doc.description) btn.dataset.description = doc.description;

    var brand = escapeHtml(doc.brand || '');
    var title = escapeHtml(doc.title || '');
    var coverAlt = 'หน้าปก ' + title;

    btn.innerHTML =
      (doc.cover_image ? '<img src="' + escapeHtml(doc.cover_image) + '" alt="' + escapeHtml(coverAlt) + '" />' : '<span></span>') +
      '<span><small>' + brand + '</small><strong>' + title + '</strong><em>พรีวิวเอกสาร →</em></span>';

    return btn;
  }

  function selectCard(card, grid) {
    grid.querySelectorAll('.ch-document-card').forEach(function (c) {
      c.classList.remove('is-selected');
    });
    card.classList.add('is-selected');

    var previewBrand = document.getElementById('sparePartsPreviewBrand');
    var previewName = document.getElementById('sparePartsPreviewName');
    var previewLink = document.getElementById('sparePartsPreviewLink');
    var previewFrame = document.getElementById('sparePartsPreviewFrame');
    if (!previewBrand || !previewName || !previewLink || !previewFrame) return;

    var pdfUrl = card.dataset.pdf;
    previewBrand.textContent = card.dataset.brand || '';
    previewName.textContent = card.dataset.name || '';
    previewLink.href = pdfUrl;
    previewFrame.src = pdfUrl + '#view=FitH';
    previewFrame.title = 'พรีวิวเอกสาร ' + (card.dataset.name || '');
  }

  async function init() {
    var grid = document.getElementById('sparePartsDocGrid');
    if (!grid || grid.dataset.bound || !window.cmsSupabase) return;
    grid.dataset.bound = 'true';

    var { data, error } = await window.cmsSupabase
      .from('spare_parts_documents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('โหลดรายการเอกสารอะไหล่ไม่สำเร็จ:', error.message);
      return;
    }

    var docs = data || [];
    grid.innerHTML = '';
    docs.forEach(function (doc, i) {
      var card = buildCard(doc, i === 0);
      card.addEventListener('click', function () { selectCard(card, grid); });
      grid.appendChild(card);
    });

    if (docs.length > 0) {
      selectCard(grid.querySelector('.ch-document-card'), grid);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('navRendered', init);
})();
