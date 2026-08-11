/* cms/subscribers.js — Subscribe: แสดงรายชื่ออีเมลที่สมัครรับข่าวสารจากฟอร์ม footer เป็น table list */
(function () {
  var TABLE = 'subscribers';
  var items = [];
  var searchQuery = '';

  var tableBody = document.getElementById('subscriberTableBody');
  var emptyState = document.getElementById('subscriberEmptyState');
  var searchInput = document.getElementById('subscriberSearchInput');

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  function render() {
    var filtered = items.filter(function (it) {
      return !searchQuery || it.email.toLowerCase().indexOf(searchQuery) !== -1;
    });

    tableBody.innerHTML = '';
    emptyState.hidden = filtered.length > 0;
    emptyState.textContent = items.length === 0
      ? 'ยังไม่มีผู้สมัครรับข่าวสาร'
      : 'ไม่พบอีเมลที่ตรงกับคำค้นหา';

    filtered.forEach(function (item) {
      tableBody.appendChild(buildRow(item));
    });

    document.getElementById('statTotalSubscribers').textContent = items.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');

    var tdEmail = document.createElement('td');
    tdEmail.textContent = item.email;
    tr.appendChild(tdEmail);

    var tdDate = document.createElement('td');
    tdDate.textContent = formatDate(item.created_at);
    tr.appendChild(tdDate);

    var tdTime = document.createElement('td');
    tdTime.textContent = formatTime(item.created_at);
    tr.appendChild(tdTime);

    var tdAction = document.createElement('td');
    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cms-btn cms-btn--ghost';
    deleteBtn.title = 'ลบ';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', function () { deleteItem(item); });
    tdAction.appendChild(deleteBtn);
    tr.appendChild(tdAction);

    return tr;
  }

  async function loadItems() {
    var { data, error } = await window.cmsSupabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      window.cmsToast('โหลดรายชื่อผู้สมัครไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    items = data || [];
    render();
  }

  /* ชื่อไฟล์ export: subscribe_ddmmyyyy_hhmm.xlsx (เช่น subscribe_31072026_1430.xlsx) */
  function buildExportFilename() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var dd = pad(now.getDate());
    var mm = pad(now.getMonth() + 1);
    var yyyy = now.getFullYear();
    var hh = pad(now.getHours());
    var min = pad(now.getMinutes());
    return 'subscribe_' + dd + mm + yyyy + '_' + hh + min + '.xlsx';
  }

  /* Export รายชื่อผู้สมัครทั้งหมด (ไม่ขึ้นกับคำค้นหาที่กรองอยู่ในหน้าจอ) เป็นไฟล์ .xlsx จริง
     ผ่านไลบรารี SheetJS (window.XLSX จาก CDN) — สร้างไฟล์ฝั่ง client ล้วนๆ ไม่ต้องผ่าน server */
  function exportSubscribersToExcel() {
    if (!items.length) {
      window.cmsToast('ไม่มีข้อมูลผู้สมัครให้ export', 'error');
      return;
    }
    if (!window.XLSX) {
      window.cmsToast('โหลดไลบรารี export ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
      return;
    }

    var rows = items.map(function (item) {
      return {
        Email: item.email,
        'วันที่': formatDate(item.created_at),
        'เวลา': formatTime(item.created_at),
      };
    });

    var worksheet = window.XLSX.utils.json_to_sheet(rows);
    var workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
    window.XLSX.writeFile(workbook, buildExportFilename());

    window.cmsToast('Export ไฟล์สำเร็จ', 'success');
  }

  async function deleteItem(item) {
    if (!window.confirm('ลบอีเมล "' + item.email + '" ออกจากรายชื่อผู้สมัคร? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var { error } = await window.cmsSupabase.from(TABLE).delete().eq('id', item.id);
    if (error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    window.cmsToast('ลบรายชื่อเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    searchInput.addEventListener('input', function () {
      searchQuery = searchInput.value.trim().toLowerCase();
      render();
    });

    document.getElementById('exportSubscribersBtn').addEventListener('click', exportSubscribersToExcel);

    await loadItems();
  });
})();
