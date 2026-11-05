const fs = require('fs');

function updateFrontendActivation() {
  const htmlPath = 'C:/Users/Admin/Desktop/proj/smart-gate/public/index.html';
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Update Sign Up buttons to "Activate Account"
  // Welcome view
  html = html.replace(
    '<span>Sign Up สมัครสมาชิก</span>',
    '<span>เปิดใช้งานบัญชี (Activate)</span>'
  );

  // Replace auth-view-register with activation UI
  const oldRegStart = '<div id="auth-view-register"';
  const oldRegEnd = '<!-- ================= MAIN APP SHELL';
  const sIdx = html.indexOf(oldRegStart);
  const eIdx = html.indexOf(oldRegEnd);

  if (sIdx !== -1 && eIdx !== -1) {
    const newActivationHtml = `<div id="auth-view-register" class="w-full flex-1 flex flex-col justify-between hidden">
      <!-- ส่วนบน: โลโก้ขนาดกะทัดรัด -->
      <div class="pt-6 pb-4 px-6 flex flex-col items-center justify-center text-center text-white flex-1">
        <div class="relative mb-2">
          <div class="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md shadow-lg flex items-center justify-center text-white text-xl">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold shadow">
            สอศ.
          </div>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">เปิดใช้งานบัญชีนักเรียน</h2>
        <p class="text-xs text-white/90">OnePass IoT Smart Gate • วิทยาลัยการอาชีพองครักษ์</p>
      </div>

      <!-- ส่วนล่าง: การ์ดเปิดใช้งานบัญชีแบบ 2 ขั้นตอน (Wizard UI) -->
      <div class="bg-[#181d31] text-white rounded-t-[32px] sm:rounded-t-[40px] px-5 sm:px-8 pt-6 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] max-w-md w-full mx-auto space-y-4">
        
        <div class="flex items-center justify-between">
          <button type="button" onclick="setAuthView('welcome')" title="กลับหน้าต้อนรับ" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs transition">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="text-center flex-1 pr-8">
            <div id="activation-step-badge" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
              <span>ขั้นตอนที่ 1 จาก 2 : ยืนยันตัวตน</span>
            </div>
          </div>
        </div>

        <!-- กล่องแจ้งเตือน -->
        <div id="activation-alert" class="hidden p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation text-rose-400 text-base shrink-0"></i>
          <p id="activation-alert-text" class="text-[11px] leading-tight">เกิดข้อผิดพลาด</p>
        </div>

        <!-- ================= STEP 1: กรอกรหัส + วันเกิด ================= -->
        <form id="form-activation-step1" onsubmit="handleActivationStep1(event)" class="space-y-3.5">
          <p class="text-xs text-slate-300">กรุณากรอกรหัสนักศึกษาและวันเกิดที่ตรงกับระเบียนวิทยาลัย เพื่อเปิดใช้งานบัญชีครั้งแรก</p>
          
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">รหัสนักศึกษา (11 หลัก)</label>
            <div class="relative">
              <input type="text" id="act-student-code" required placeholder="เช่น 66209010012" maxlength="15" autocomplete="off"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition">
              <i class="fa-solid fa-id-card absolute right-4 top-3.5 text-slate-500 text-sm"></i>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">วันเกิด (พ.ศ.)</label>
            <div class="relative">
              <input type="text" id="act-birth-date" required placeholder="วว/ดด/ปปปป (เช่น 15/08/2549)" maxlength="10" autocomplete="off"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition">
              <i class="fa-solid fa-calendar-day absolute right-4 top-3.5 text-slate-500 text-sm"></i>
            </div>
            <p class="text-[10px] text-slate-400">ตัวอย่าง: วันที่ 15 สิงหาคม 2549 ให้พิมพ์ 15/08/2549</p>
          </div>

          <button type="submit" id="btn-submit-step1" class="w-full py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] active:bg-[#3730a3] text-white font-bold rounded-2xl text-base shadow-lg shadow-indigo-950/50 transition flex items-center justify-center gap-2 mt-2">
            <span>ตรวจสอบข้อมูล</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </form>

        <!-- ================= STEP 2: ยืนยันชื่อ + ตั้งรหัสผ่าน ================= -->
        <form id="form-activation-step2" onsubmit="handleActivationStep2(event)" class="space-y-3 hidden">
          <!-- การ์ดข้อมูลนักเรียนที่ดึงมาจากฐานข้อมูล (Read-only ห้ามแก้เด็ดขาด) -->
          <div class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-700/60">
              <span class="text-slate-400">ชื่อ-นามสกุล:</span>
              <span id="act-preview-name" class="font-bold text-white text-sm">นาย ธ*** รั***</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">แผนกวิชา:</span>
              <span id="act-preview-dept" class="font-semibold text-blue-300">แผนกวิชาช่างยนต์</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">ระดับชั้นปี:</span>
              <span id="act-preview-class" class="font-semibold text-emerald-300">ปวช.3/1 (ช่างยนต์)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">ครูที่ปรึกษา:</span>
              <span id="act-preview-advisor" class="font-semibold text-slate-300">อ.อนุสรณ์ ช่างยนต์</span>
            </div>
            <p class="text-[10px] text-slate-400 text-center pt-1"><i class="fa-solid fa-lock text-amber-400"></i> แผนกและระดับชั้นถูกล็อกไว้ตามระเบียนวิทยาลัย</p>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ตั้งรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร) *</label>
            <div class="relative">
              <input type="password" id="act-new-password" required minlength="8" placeholder="กำหนดรหัสผ่านใหม่"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition">
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ยืนยันรหัสผ่านใหม่อีกครั้ง *</label>
            <div class="relative">
              <input type="password" id="act-confirm-password" required minlength="8" placeholder="พิมพ์รหัสผ่านเดิมซ้ำ"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 block">เบอร์โทรศัพท์</label>
              <input type="tel" id="act-phone" placeholder="08x-xxx-xxxx"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none">
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 block">เบอร์ผู้ปกครอง</label>
              <input type="tel" id="act-parent-phone" placeholder="08x-xxx-xxxx"
                     class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none">
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-400 block">ป้ายทะเบียนรถ (ถ้ามี)</label>
            <input type="text" id="act-plate" placeholder="เช่น 1กข 1234 นครนายก"
                   class="w-full bg-[#272d45] border border-slate-700/80 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none">
          </div>

          <button type="submit" id="btn-submit-step2" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-base shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 mt-2">
            <i class="fa-solid fa-circle-check"></i>
            <span>ยืนยันและเปิดใช้งานบัญชี</span>
          </button>
        </form>

        <!-- ลิงก์กรณีไม่อยู่ในรายชื่อ -->
        <div class="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          <span>มีบัญชีอยู่แล้ว?</span>
          <button type="button" onclick="setAuthView('login')" class="text-blue-400 hover:text-blue-300 font-bold ml-1 underline">Login เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>\n\n    `;

    html = html.substring(0, sIdx) + newActivationHtml + html.substring(eIdx);
    console.log('Replaced auth-view-register with new Activation UI in:', htmlPath);
  }

  // 2. Add Tab in Admin Panel (Student Roster Import)
  const adminTabMarker = '<button type="button" onclick="switchAdminTab(\'timetables\')"';
  if (html.includes(adminTabMarker)) {
    const importTabBtn = `<button type="button" onclick="switchAdminTab('import_students')" id="admin-tab-btn-import_students" class="flex-1 py-2 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-file-excel text-xs"></i> <span>นำเข้ารายชื่อ</span>
          </button>\n          `;
    html = html.replace(adminTabMarker, importTabBtn + adminTabMarker);
    console.log('Added admin-tab-btn-import_students in:', htmlPath);
  }

  // 3. Add Tab Content Panel in Admin
  const adminPanelMarker = '<!-- 3. TAB CONTENT: จัดการแผนกวิชา';
  if (html.includes(adminPanelMarker)) {
    const importPanelContent = `<!-- 2.5 TAB CONTENT: นำเข้ารายชื่อนักศึกษาจาก Excel/CSV -->
      <div id="admin-tab-import_students" class="space-y-4 hidden">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h4 class="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <i class="fa-solid fa-file-import text-cyan-600 dark:text-cyan-400"></i> นำเข้ารายชื่อนักศึกษา (Student Roster Import)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">นำเข้าไฟล์ Excel/CSV สร้างบัญชีสถานะรอเปิดใช้งานโดยอัตโนมัติ</p>
            </div>
            <a href="/api/admin/student-template" download class="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs">
              <i class="fa-solid fa-download"></i> ดาวน์โหลดแม่แบบ Excel/CSV
            </a>
          </div>

          <!-- กล่องอัปโหลด Drag & Drop -->
          <div id="import-dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer transition">
            <input type="file" id="input-roster-file" accept=".xlsx, .xls, .csv" class="hidden" onchange="handleRosterFileSelect(event)">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mx-auto shadow-xs">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ Excel/CSV มาวางที่นี่</p>
              <p class="text-xs text-slate-400 mt-0.5">รองรับไฟล์ .xlsx, .xls และ .csv (ระบบจะตรวจสอบและแปลง พ.ศ. ➔ ค.ศ. อัตโนมัติ)</p>
            </div>
          </div>

          <!-- ตารางพรีวิวและตรวจสอบ (Preview & Validation Table) -->
          <div id="import-preview-container" class="space-y-3 hidden">
            <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <div class="flex items-center gap-3">
                <span class="text-slate-600 dark:text-slate-300">ทั้งหมด: <strong id="preview-total-count" class="text-slate-900 dark:text-white">0</strong></span>
                <span class="text-emerald-600 dark:text-emerald-400">ผ่าน: <strong id="preview-valid-count">0</strong></span>
                <span class="text-amber-600 dark:text-amber-400">ข้อมูลเดิม: <strong id="preview-conflict-count">0</strong></span>
                <span class="text-rose-600 dark:text-rose-400">ผิดพลาด: <strong id="preview-error-count">0</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-medium">
                  <input type="checkbox" id="chk-update-pending" checked class="rounded text-blue-600">
                  <span>อัปเดตข้อมูลบัญชีที่ยังไม่เปิดใช้งาน</span>
                </label>
                <button type="button" onclick="commitRosterImport()" id="btn-commit-import" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5">
                  <i class="fa-solid fa-check"></i> บันทึกลงระบบจริง
                </button>
              </div>
            </div>

            <div class="overflow-x-auto max-h-[380px] rounded-2xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 dark:bg-slate-900 sticky top-0 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="p-2.5">แถว</th>
                    <th class="p-2.5">รหัสนักศึกษา</th>
                    <th class="p-2.5">ชื่อ-นามสกุล</th>
                    <th class="p-2.5">แผนกวิชา</th>
                    <th class="p-2.5">ห้องเรียน</th>
                    <th class="p-2.5">วันเกิด</th>
                    <th class="p-2.5">สถานะ</th>
                  </tr>
                </thead>
                <tbody id="import-preview-tbody" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <!-- Populated by JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- ตาราง Audit Logs ย้อนหลัง -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-700">
            <h5 class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-clock-rotate-left text-slate-400"></i> ประวัติการนำเข้ารายชื่อล่าสุด (Audit Logs)
            </h5>
            <div id="import-logs-list" class="space-y-1.5 text-xs text-slate-500">
              <!-- Populated by JS -->
            </div>
          </div>
        </div>
      </div>\n\n      `;
    html = html.replace(adminPanelMarker, importPanelContent + adminPanelMarker);
    console.log('Added admin-tab-import_students content panel in:', htmlPath);
  }

  // Bump version
  html = html.replace(/app\.js\?v=[a-zA-Z0-9_-]+/g, 'app.js?v=20261104_student_activation_ui_v4');

  fs.writeFileSync(htmlPath, html, 'utf8');

  // Sync to SSS
  const sssHtmlPath = 'C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html';
  fs.writeFileSync(sssHtmlPath, html, 'utf8');
  console.log('Synced to SSS index.html');
}

updateFrontendActivation();
