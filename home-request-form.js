/* home-request-form.js — ฟอร์ม "แจ้งงานผ่าน LINE" ใน section Contact CPSS ของหน้าแรก
   (เนื้อหา section เป็น custom-html จาก CMS > จัดการเพจ — สคริปต์นี้แยกไว้ต่างหาก ไม่ฝังใน body_th
   เพราะ DOMPurify.sanitize() ที่ page-render.js ใช้ตัดแท็ก <script> ทิ้งเสมอตามค่าเริ่มต้นเพื่อความปลอดภัย)

   ไม่มี backend รองรับ — ตามข้อความ privacy ในฟอร์ม ("ระบบจะไม่ส่งข้อมูลจนกว่าคุณจะยืนยันในแชต LINE")
   พฤติกรรมคือ: คัดลอกข้อความสรุปงานไปที่ clipboard แล้วเปิดแชท LINE OA ให้ผู้ใช้วางเองแล้วกดส่ง */
(function () {
  var LINE_URL = 'https://line.me/R/ti/p/@033tlaat';

  function showStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = 'ch-form-status is-visible is-' + type;
  }

  function bind() {
    var form = document.getElementById('cpssServiceRequestForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    var statusEl = document.getElementById('cpssReqStatus');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('cpssReqName').value.trim();
      var phone = document.getElementById('cpssReqPhone').value.trim();
      var company = document.getElementById('cpssReqCompany').value.trim();
      var equipment = document.getElementById('cpssReqEquipment').value;
      var location = document.getElementById('cpssReqLocation').value.trim();
      var detail = document.getElementById('cpssReqDetail').value.trim();

      if (!name || !phone || !equipment || !location || !detail) {
        showStatus(statusEl, 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน', 'error');
        return;
      }

      var lines = [
        'แจ้งงานบริการ CPSS',
        '',
        'ชื่อผู้ติดต่อ: ' + name,
        'เบอร์โทรศัพท์: ' + phone,
      ];
      if (company) lines.push('บริษัท/ร้านค้า: ' + company);
      lines.push('ประเภทเครื่อง: ' + equipment);
      lines.push('สถานที่หน้างาน: ' + location);
      lines.push('');
      lines.push('รายละเอียด: ' + detail);
      var message = lines.join('\n');

      function openLine() {
        window.open(LINE_URL, '_blank', 'noopener');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(
          function () {
            showStatus(statusEl, 'คัดลอกข้อความแจ้งงานแล้ว วางในแชท LINE ที่เปิดขึ้นแล้วกดส่งได้เลย', 'success');
            openLine();
            form.reset();
          },
          function () {
            showStatus(statusEl, 'คัดลอกข้อความอัตโนมัติไม่สำเร็จ กรุณาพิมพ์รายละเอียดงานในแชท LINE ที่เปิดขึ้นแทน', 'error');
            openLine();
          }
        );
      } else {
        showStatus(statusEl, 'กรุณาพิมพ์รายละเอียดงานในแชท LINE ที่เปิดขึ้น', 'error');
        openLine();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bind);
  document.addEventListener('navRendered', bind);
})();
