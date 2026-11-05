const fs = require('fs');

function applySettingsOption1Exact(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `<!-- ================= VIEW (ง): หน้าโปรไฟล์ (Profile View) ================= -->
    <div id="screen-profile" class="space-y-4 hidden">
      
      <!-- Profile Header Card (โชว์ข้อมูลด้านบนเฉยๆ ตามคำขอ) -->
      <div class="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">`;

  const newTarget = `<!-- ================= VIEW (ง): หน้าโปรไฟล์ (Profile View) ================= -->
    <div id="screen-profile" class="space-y-3 sm:space-y-4 hidden">
      
      <!-- แถบปุ่มตั้งค่า (วางเหนือการ์ดโปรไฟล์ ชิดขวา ตรงจุดวงแดงตามแนวทางที่ 1) -->
      <div class="flex items-center justify-end -mb-1">
        <button type="button" onclick="openSettingsModal()" id="btn-open-profile-settings" title="ตั้งค่าระบบ / Settings" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer touch-manipulation group">
          <i class="fa-solid fa-gear text-slate-400 group-hover:text-blue-600 group-hover:rotate-90 transition-transform duration-300"></i>
          <span data-i18n="settings_btn">ตั้งค่า</span>
        </button>
      </div>

      <!-- Profile Header Card (โชว์ข้อมูลด้านบนเฉยๆ ตามคำขอ) -->
      <div class="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">`;

  if (content.includes(oldTarget)) {
    content = content.replace(oldTarget, newTarget);
    console.log('Successfully inserted settings button above profile card in:', filePath);
  } else {
    console.log('Could not find oldTarget in:', filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

applySettingsOption1Exact('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html');
applySettingsOption1Exact('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html');
