const fs = require('fs');

function applySettingsOption1(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove settings button from header
  const headerBtnRegex = /<!-- Settings Button \(ย้ายมาไว้บน Header[\s\S]*?<\/button>\s*/;
  if (headerBtnRegex.test(content)) {
    content = content.replace(headerBtnRegex, '');
    console.log('Removed settings button from header in:', filePath);
  } else {
    console.log('Could not match headerBtnRegex in:', filePath);
  }

  // 2. Place Settings button right above the profile card in screen-profile (Option 1)
  const profileCardTarget = `<!-- ================= VIEW: โปรไฟล์ผู้ใช้งาน ================= -->
    <div id="screen-profile" class="space-y-4 sm:space-y-6 hidden">

      <!-- ข้อมูลผู้ใช้งานส่วนบน (Hero Card) -->
      <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl sm:rounded-3xl p-6 shadow-md relative overflow-hidden">`;

  const newProfileCardReplacement = `<!-- ================= VIEW: โปรไฟล์ผู้ใช้งาน ================= -->
    <div id="screen-profile" class="space-y-3 sm:space-y-4 hidden">

      <!-- แถบปุ่มตั้งค่า (วางเหนือการ์ดโปรไฟล์ ชิดขวา ตรงจุดที่วงไว้ตามแนวทางที่ 1) -->
      <div class="flex items-center justify-end">
        <button type="button" onclick="openSettingsModal()" id="btn-open-profile-settings" title="ตั้งค่าระบบ / Settings" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-700 hover:text-blue-700 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer touch-manipulation group">
          <i class="fa-solid fa-gear text-slate-500 group-hover:text-blue-600 group-hover:rotate-90 transition-transform duration-300"></i>
          <span data-i18n="settings_btn">ตั้งค่า</span>
        </button>
      </div>

      <!-- ข้อมูลผู้ใช้งานส่วนบน (Hero Card) -->
      <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl sm:rounded-3xl p-6 shadow-md relative overflow-hidden">`;

  if (content.includes(profileCardTarget)) {
    content = content.replace(profileCardTarget, newProfileCardReplacement);
    console.log('Added settings button above profile card in:', filePath);
  } else {
    console.log('Could not find profileCardTarget in:', filePath);
  }

  // 3. Bump version
  content = content.replace(/app\.js\?v=[a-zA-Z0-9_-]+/g, 'app.js?v=20261104_settings_above_card_v2');

  fs.writeFileSync(filePath, content, 'utf8');
}

applySettingsOption1('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html');
applySettingsOption1('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html');
