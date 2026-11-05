const fs = require('fs');

function addActivationLogicToAppJs() {
  const appPath = 'C:/Users/Admin/Desktop/proj/smart-gate/public/app.js';
  let js = fs.readFileSync(appPath, 'utf8');

  const activationLogic = `
// ============================================================================
// STUDENT SELF-ACTIVATION & ROSTER IMPORT LOGIC (FRONTEND)
// ============================================================================

let currentActivationToken = '';
let currentPreviewRows = [];
let currentImportFileName = '';

// 1. จัดการขั้นตอนที่ 1: ตรวจสอบรหัส + วันเกิด
async function handleActivationStep1(e) {
  if (e) e.preventDefault();
  const codeInput = document.getElementById('act-student-code');
  const birthInput = document.getElementById('act-birth-date');
  const alertBox = document.getElementById('activation-alert');
  const alertText = document.getElementById('activation-alert-text');
  const btnSubmit = document.getElementById('btn-submit-step1');

  if (alertBox) alertBox.classList.add('hidden');

  const studentCode = codeInput ? codeInput.value.trim() : '';
  const birthDate = birthInput ? birthInput.value.trim() : '';

  if (!studentCode || !birthDate) {
    if (alertBox && alertText) {
      alertText.textContent = 'กรุณากรอกรหัสนักศึกษาและวันเดือนปีเกิด';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบ...';
  }

  try {
    const res = await fetch('/api/auth/verify-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCode, birthDate })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (alertBox && alertText) {
        alertText.textContent = data.message || 'รหัสนักศึกษาหรือวันเดือนปีเกิดไม่ถูกต้อง';
        alertBox.classList.remove('hidden');
      }
      return;
    }

    // ผ่านขั้นตอนที่ 1: บันทึก Token และนำข้อมูลนักเรียนมาแสดง
    currentActivationToken = data.activationToken;
    const std = data.student || {};

    const nameEl = document.getElementById('act-preview-name');
    const deptEl = document.getElementById('act-preview-dept');
    const classEl = document.getElementById('act-preview-class');
    const advisorEl = document.getElementById('act-preview-advisor');

    if (nameEl) nameEl.textContent = std.maskedName || '-';
    if (deptEl) deptEl.textContent = std.department || '-';
    if (classEl) classEl.textContent = std.classroom || '-';
    if (advisorEl) advisorEl.textContent = std.advisor || '-';

    // สลับไปยังขั้นตอนที่ 2
    const form1 = document.getElementById('form-activation-step1');
    const form2 = document.getElementById('form-activation-step2');
    const stepBadge = document.getElementById('activation-step-badge');

    if (form1) form1.classList.add('hidden');
    if (form2) form2.classList.remove('hidden');
    if (stepBadge) {
      stepBadge.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold';
      stepBadge.innerHTML = '<span>ขั้นตอนที่ 2 จาก 2 : ตั้งรหัสผ่านและข้อมูลติดต่อ</span>';
    }
  } catch (err) {
    if (alertBox && alertText) {
      alertText.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      alertBox.classList.remove('hidden');
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>ตรวจสอบข้อมูล</span> <i class="fa-solid fa-arrow-right text-xs"></i>';
    }
  }
}

// 2. จัดการขั้นตอนที่ 2: ตั้งรหัสผ่านและยืนยันเปิดบัญชีจริง
async function handleActivationStep2(e) {
  if (e) e.preventDefault();
  const passInput = document.getElementById('act-new-password');
  const confirmInput = document.getElementById('act-confirm-password');
  const phoneInput = document.getElementById('act-phone');
  const parentPhoneInput = document.getElementById('act-parent-phone');
  const plateInput = document.getElementById('act-plate');
  const alertBox = document.getElementById('activation-alert');
  const alertText = document.getElementById('activation-alert-text');
  const btnSubmit = document.getElementById('btn-submit-step2');

  if (alertBox) alertBox.classList.add('hidden');

  const newPassword = passInput ? passInput.value.trim() : '';
  const confirmPassword = confirmInput ? confirmInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const parentPhone = parentPhoneInput ? parentPhoneInput.value.trim() : '';
  const plateNo = plateInput ? plateInput.value.trim() : '';

  if (!newPassword || newPassword.length < 8) {
    if (alertBox && alertText) {
      alertText.textContent = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  if (newPassword !== confirmPassword) {
    if (alertBox && alertText) {
      alertText.textContent = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกและเปิดใช้งาน...';
  }

  try {
    const res = await fetch('/api/auth/activate-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activationToken: currentActivationToken,
        newPassword,
        phone,
        parentPhone,
        plateNo
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (alertBox && alertText) {
        alertText.textContent = data.message || 'เกิดข้อผิดพลาดในการเปิดใช้งาน';
        alertBox.classList.remove('hidden');
      }
      return;
    }

    // เปิดใช้งานสำเร็จ: บันทึกข้อมูลล็อกอินทันที
    alert('🎉 ' + data.message);
    if (data.token) {
      localStorage.setItem('onepass_auth_token', data.token);
      localStorage.setItem('onepass_logged_in', 'true');
      localStorage.setItem('onepass_user', JSON.stringify(data.user));
      applyCurrentUserUI(data.user);
      checkAuth();
    } else {
      setAuthView('login');
    }
  } catch (err) {
    if (alertBox && alertText) {
      alertText.textContent = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      alertBox.classList.remove('hidden');
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>ยืนยันและเปิดใช้งานบัญชี</span>';
    }
  }
}

// 3. ฝั่งแอดมิน: เลือกไฟล์ Excel/CSV และแสดงตารางพรีวิว
function handleRosterFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentImportFileName = file.name;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      if (typeof XLSX === 'undefined') {
        alert('ไลบรารีอ่านไฟล์ Excel ยังไม่พร้อมใช้งาน กรุณารีเฟรชหน้าเว็บ');
        return;
      }

      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonRows || jsonRows.length === 0) {
        alert('ไม่พบข้อมูลในไฟล์ที่เลือก');
        return;
      }

      // ส่งไปให้ Backend ตรวจสอบ (Server-side Validation)
      const token = getAuthToken();
      const res = await fetch('/api/admin/import-students-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ students: jsonRows })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        alert('ตรวจสอบไฟล์ไม่สำเร็จ: ' + (resData.message || 'เกิดข้อผิดพลาด'));
        return;
      }

      currentPreviewRows = resData.rows || [];
      renderImportPreviewTable(resData);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

// 4. แสดงผลตาราง Preview ในหน้า Admin
function renderImportPreviewTable(previewData) {
  const container = document.getElementById('import-preview-container');
  const tbody = document.getElementById('import-preview-tbody');
  const totalCountEl = document.getElementById('preview-total-count');
  const validCountEl = document.getElementById('preview-valid-count');
  const conflictCountEl = document.getElementById('preview-conflict-count');
  const errorCountEl = document.getElementById('preview-error-count');

  if (!container || !tbody) return;

  const s = previewData.summary || {};
  if (totalCountEl) totalCountEl.textContent = s.total || 0;
  if (validCountEl) validCountEl.textContent = s.validCount || 0;
  if (conflictCountEl) conflictCountEl.textContent = s.conflictCount || 0;
  if (errorCountEl) errorCountEl.textContent = s.errorCount || 0;

  tbody.innerHTML = '';
  const rows = previewData.rows || [];

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = r.isValid ? (r.statusType === 'update_pending' ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800') : 'bg-rose-50/60 dark:bg-rose-950/30';

    let statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">พร้อมนำเข้า</span>';
    if (!r.isValid) {
      statusBadge = \`<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold" title="\${r.errors?.join(', ')}">❌ \${r.errors?.[0] || 'ข้อมูลผิด'}</span>\`;
    } else if (r.statusType === 'update_pending') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">รออัปเดต</span>';
    }

    tr.innerHTML = \`
      <td class="p-2.5 font-bold">\${r.rowNumber}</td>
      <td class="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">\${r.studentCode || '-'}</td>
      <td class="p-2.5 font-semibold text-slate-800 dark:text-white">\${r.fullName || '-'}</td>
      <td class="p-2.5">\${r.deptName || '-'}</td>
      <td class="p-2.5"><span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold">\${r.classroomName || '-'}</span></td>
      <td class="p-2.5 font-mono">\${r.birthDate || r.rawBirthDate || '-'}</td>
      <td class="p-2.5">\${statusBadge}</td>
    \`;
    tbody.appendChild(tr);
  });

  container.classList.remove('hidden');
}

// 5. แอดมินกดยืนยันบันทึกรายชื่อลงระบบจริง
async function commitRosterImport() {
  if (!currentPreviewRows || currentPreviewRows.length === 0) {
    alert('ไม่มีข้อมูลที่พร้อมบันทึก');
    return;
  }

  const validRows = currentPreviewRows.filter(r => r.isValid);
  if (validRows.length === 0) {
    alert('ไม่มีรายการที่ผ่านการตรวจสอบ กรุณาแก้ไขไฟล์แล้วอัปโหลดใหม่');
    return;
  }

  const chkUpdate = document.getElementById('chk-update-pending');
  const updateExistingPending = chkUpdate ? chkUpdate.checked : true;

  if (!confirm(\`ยืนยันการนำเข้ารายชื่อนักศึกษาจำนวน \${validRows.length} รายการลงระบบจริง?\`)) {
    return;
  }

  const btnCommit = document.getElementById('btn-commit-import');
  if (btnCommit) {
    btnCommit.disabled = true;
    btnCommit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
  }

  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/import-students-commit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        rows: validRows,
        fileName: currentImportFileName,
        updateExistingPending
      })
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + (resData.message || 'เกิดข้อผิดพลาด'));
      return;
    }

    alert('✅ ' + resData.message);
    fetchAdminImportLogs();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
  } finally {
    if (btnCommit) {
      btnCommit.disabled = false;
      btnCommit.innerHTML = '<i class="fa-solid fa-check"></i> บันทึกลงระบบจริง';
    }
  }
}

// 6. ดึงรายการ Audit Logs การนำเข้าไฟล์ล่าสุด
async function fetchAdminImportLogs() {
  const container = document.getElementById('import-logs-list');
  if (!container) return;

  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/import-logs', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data && data.success && Array.isArray(data.logs)) {
      if (data.logs.length === 0) {
        container.innerHTML = '<p class="text-slate-400 italic">ยังไม่มีประวัติการนำเข้าไฟล์</p>';
        return;
      }
      container.innerHTML = data.logs.map(l => {
        const time = new Date(l.imported_at).toLocaleString('th-TH');
        return \`
          <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
              <span class="font-bold text-slate-700 dark:text-slate-200">\${l.file_name}</span>
              <span class="text-[10px] text-slate-400 ml-2">\${time} (โดย \${l.admin_username})</span>
            </div>
            <div class="flex items-center gap-2 text-[10px] font-bold">
              <span class="text-emerald-600">สำเร็จ: \${l.success_rows}</span>
              <span class="text-amber-600">อัปเดต: \${l.updated_rows}</span>
              <span class="text-rose-600">ข้าม: \${l.failed_rows}</span>
            </div>
          </div>
        \`;
      }).join('');
    }
  } catch (err) {
    console.warn('fetchAdminImportLogs err:', err);
  }
}

// Expose globally
window.handleActivationStep1 = handleActivationStep1;
window.handleActivationStep2 = handleActivationStep2;
window.handleRosterFileSelect = handleRosterFileSelect;
window.commitRosterImport = commitRosterImport;
window.fetchAdminImportLogs = fetchAdminImportLogs;
`;

  // Attach drag and drop click handler to dropzone
  if (!js.includes('handleActivationStep1')) {
    js += '\n' + activationLogic;
    fs.writeFileSync(appPath, js, 'utf8');
    console.log('Appended activation logic to:', appPath);

    // Sync to SSS app.js
    const sssAppPath = 'C:/Users/Admin/Desktop/SSS/smart-gate/public/app.js';
    fs.writeFileSync(sssAppPath, js, 'utf8');
    console.log('Synced to SSS app.js');
  } else {
    console.log('Activation logic already exists in app.js');
  }
}

addActivationLogicToAppJs();
