/* cms/admins.js — จัดการบัญชีแอดมิน CMS (CRUD) ผ่าน Supabase Edge Function `manage-admins`
   (ต้องผ่าน Edge Function เท่านั้น เพราะ supabase.auth.admin.* ต้องใช้ service_role key ซึ่งห้ามอยู่ฝั่ง
   client เด็ดขาด — ดูรายละเอียดใน supabase/functions/manage-admins/index.ts) */
(function () {
  var FUNCTION_ENDPOINT = window.CMS_CONFIG.SUPABASE_URL + '/functions/v1/manage-admins';

  var items = [];
  var currentUserId = null;
  var editingId = null;
  var searchTerm = '';

  var tableBody = document.getElementById('adminTableBody');
  var emptyState = document.getElementById('adminEmptyState');

  var modalOverlay = document.getElementById('adminModalOverlay');
  var modalTitle = document.getElementById('adminModalTitle');
  var form = document.getElementById('adminForm');
  var formError = document.getElementById('adminFormError');
  var formHint = document.getElementById('adminFormHint');
  var fieldEmail = document.getElementById('fieldAdminEmail');
  var fieldDisplayName = document.getElementById('fieldAdminDisplayName');

  var passwordModalOverlay = document.getElementById('passwordModalOverlay');
  var passwordModalEmailHint = document.getElementById('passwordModalEmailHint');
  var generatedPasswordText = document.getElementById('generatedPasswordText');

  function byId(id) {
    return items.find(function (it) { return it.id === id; });
  }

  async function callFunction(action, body) {
    var { data: { session } } = await window.cmsSupabase.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return { error: 'session หมดอายุ' };
    }

    var res;
    try {
      res = await fetch(FUNCTION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
          'apikey': window.CMS_CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(Object.assign({ action: action }, body || {})),
      });
    } catch (networkErr) {
      return { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: ' + networkErr.message };
    }

    var json;
    try {
      json = await res.json();
    } catch (parseErr) {
      return { error: 'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (' + res.status + ')' };
    }

    if (!res.ok) {
      return { error: json.error || ('เกิดข้อผิดพลาด (' + res.status + ')') };
    }
    return json;
  }

  /* ===== Render ===== */

  function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function itemMatchesSearch(item) {
    if (!searchTerm) return true;
    var q = searchTerm.toLowerCase();
    return (item.email || '').toLowerCase().indexOf(q) !== -1 || (item.display_name || '').toLowerCase().indexOf(q) !== -1;
  }

  function render() {
    tableBody.innerHTML = '';
    var visible = items.filter(itemMatchesSearch);

    emptyState.hidden = items.length > 0;
    if (items.length > 0 && visible.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 5;
      td.style.textAlign = 'center';
      td.style.color = 'var(--cms-text-faint)';
      td.style.padding = '40px 0';
      td.textContent = 'ไม่พบแอดมินที่ตรงกับคำค้นหา "' + searchTerm + '"';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      visible.forEach(function (item) { tableBody.appendChild(buildRow(item)); });
    }

    document.getElementById('statTotalAdmins').textContent = items.length;
  }

  function buildRow(item) {
    var tr = document.createElement('tr');

    var tdEmail = document.createElement('td');
    tdEmail.textContent = item.email;
    if (item.id === currentUserId) {
      var meBadge = document.createElement('span');
      meBadge.className = 'cms-badge';
      meBadge.style.marginLeft = '8px';
      meBadge.textContent = 'คุณ';
      tdEmail.appendChild(meBadge);
    }
    tr.appendChild(tdEmail);

    var tdName = document.createElement('td');
    tdName.textContent = item.display_name || '—';
    tr.appendChild(tdName);

    var tdCreated = document.createElement('td');
    tdCreated.textContent = formatDateTime(item.created_at);
    tr.appendChild(tdCreated);

    var tdLastSignIn = document.createElement('td');
    tdLastSignIn.textContent = formatDateTime(item.last_sign_in_at);
    tr.appendChild(tdLastSignIn);

    var tdActions = document.createElement('td');
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'cms-row-actions';

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'cms-btn cms-btn--ghost';
    editBtn.title = 'แก้ไข';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', function () { openModal(item.id); });
    actionsWrap.appendChild(editBtn);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'cms-btn cms-btn--ghost';
    resetBtn.title = 'รีเซ็ตรหัสผ่าน';
    resetBtn.innerHTML = '🔑';
    resetBtn.addEventListener('click', function () { resetPassword(item); });
    actionsWrap.appendChild(resetBtn);

    if (item.id !== currentUserId && items.length > 1) {
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'cms-btn cms-btn--ghost';
      deleteBtn.title = 'ลบ';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.addEventListener('click', function () { deleteItem(item); });
      actionsWrap.appendChild(deleteBtn);
    }

    tdActions.appendChild(actionsWrap);
    tr.appendChild(tdActions);

    return tr;
  }

  /* ===== Data actions ===== */

  async function loadItems() {
    var result = await callFunction('list', {});
    if (result.error) {
      window.cmsToast('โหลดรายชื่อแอดมินไม่สำเร็จ: ' + result.error, 'error');
      return;
    }
    items = result.users || [];
    currentUserId = result.currentUserId;
    render();
  }

  async function resetPassword(item) {
    if (!window.confirm('รีเซ็ตรหัสผ่านของ "' + item.email + '"? รหัสผ่านเดิมจะใช้ไม่ได้ทันที')) return;

    var result = await callFunction('reset_password', { id: item.id });
    if (result.error) {
      window.cmsToast('รีเซ็ตรหัสผ่านไม่สำเร็จ: ' + result.error, 'error');
      return;
    }
    openPasswordModal(item.email, result.password);
    await loadItems();
  }

  async function deleteItem(item) {
    if (!window.confirm('ลบแอดมิน "' + item.email + '"? การกระทำนี้ย้อนกลับไม่ได้')) return;

    var result = await callFunction('delete', { id: item.id });
    if (result.error) {
      window.cmsToast('ลบไม่สำเร็จ: ' + result.error, 'error');
      return;
    }
    window.cmsToast('ลบแอดมินเรียบร้อยแล้ว', 'success');
    await loadItems();
  }

  /* ===== Modal: Add / Edit ===== */

  function openModal(id) {
    editingId = id || null;
    formError.textContent = '';
    form.reset();

    if (editingId) {
      var item = byId(editingId);
      modalTitle.textContent = 'แก้ไขแอดมิน';
      fieldEmail.value = item.email || '';
      fieldEmail.disabled = true;
      fieldDisplayName.value = item.display_name || '';
      formHint.hidden = true;
    } else {
      modalTitle.textContent = 'เพิ่มแอดมินใหม่';
      fieldEmail.disabled = false;
      formHint.hidden = false;
    }

    modalOverlay.hidden = false;
    (editingId ? fieldDisplayName : fieldEmail).focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
  }

  async function submitForm(e) {
    e.preventDefault();
    formError.textContent = '';

    var displayName = fieldDisplayName.value.trim();
    var submitBtn = document.getElementById('adminFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    var result;
    if (editingId) {
      result = await callFunction('update', { id: editingId, display_name: displayName });
    } else {
      var email = fieldEmail.value.trim().toLowerCase();
      if (!email) {
        formError.textContent = 'กรุณากรอกอีเมล';
        submitBtn.disabled = false;
        submitBtn.textContent = 'บันทึก';
        return;
      }
      result = await callFunction('create', { email: email, display_name: displayName });
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึก';

    if (result.error) {
      formError.textContent = result.error;
      return;
    }

    closeModal();
    await loadItems();

    if (!editingId) {
      window.cmsToast('เพิ่มแอดมินเรียบร้อยแล้ว', 'success');
      openPasswordModal(result.user.email, result.password);
    } else {
      window.cmsToast('แก้ไขแอดมินเรียบร้อยแล้ว', 'success');
    }
  }

  /* ===== Modal: Password reveal ===== */

  function openPasswordModal(email, password) {
    passwordModalEmailHint.textContent = email;
    generatedPasswordText.value = password;
    passwordModalOverlay.hidden = false;
  }

  function closePasswordModal() {
    passwordModalOverlay.hidden = true;
    generatedPasswordText.value = '';
  }

  /* ===== Init ===== */

  document.addEventListener('DOMContentLoaded', async function () {
    var session = await window.cmsRequireAuth();
    if (!session) return;

    document.getElementById('addAdminBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('adminModalClose').addEventListener('click', closeModal);
    document.getElementById('adminModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
    form.addEventListener('submit', submitForm);

    document.getElementById('passwordModalClose').addEventListener('click', closePasswordModal);
    document.getElementById('passwordModalDone').addEventListener('click', closePasswordModal);
    passwordModalOverlay.addEventListener('click', function (e) { if (e.target === passwordModalOverlay) closePasswordModal(); });

    document.getElementById('copyPasswordBtn').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(generatedPasswordText.value);
        window.cmsToast('คัดลอกรหัสผ่านแล้ว', 'success');
      } catch (err) {
        generatedPasswordText.select();
        window.cmsToast('คัดลอกอัตโนมัติไม่สำเร็จ — เลือกข้อความไว้ให้แล้ว กด Ctrl/Cmd+C ได้เลย', 'info');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!modalOverlay.hidden) closeModal();
      if (!passwordModalOverlay.hidden) closePasswordModal();
    });

    document.getElementById('adminSearchInput').addEventListener('input', function (e) {
      searchTerm = e.target.value.trim();
      render();
    });

    await loadItems();
  });
})();
