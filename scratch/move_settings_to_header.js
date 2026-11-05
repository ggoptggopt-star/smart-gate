const fs = require('fs');

function moveSettingsButton(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove the old button inside the profile card
  const oldProfileButtonRegex = /<!-- Settings Button \(ตรงรอยวงสีแดง: เข้ากับธีมเว็บ\) -->\s*<button type="button" onclick="openSettingsModal\(\)" id="btn-open-profile-settings"[\s\S]*?<\/button>/;
  
  if (oldProfileButtonRegex.test(content)) {
    content = content.replace(oldProfileButtonRegex, '');
    console.log('Removed settings button from profile card in:', filePath);
  } else {
    console.log('Could not match old profile button regex in:', filePath);
  }

  // 2. Add Settings Button to Header (Right next to สอศ. seal)
  const targetHeaderStr = `<!-- Official Seal -->
          <div class="flex flex-col items-center pl-1">`;

  const newHeaderStr = `<!-- Settings Button (ย้ายมาไว้บน Header ตามตำแหน่งลูกศรชี้ ไม่บังการ์ดโปรไฟล์) -->
          <button type="button" onclick="openSettingsModal()" id="header-settings-btn" title="ตั้งค่าระบบ / Settings" class="px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 backdrop-blur flex items-center gap-1.5 text-white text-xs font-bold transition shadow-xs group cursor-pointer touch-manipulation">
            <i class="fa-solid fa-gear text-xs group-hover:rotate-90 transition-transform duration-300"></i>
            <span class="text-[11px]" data-i18n="settings_btn">ตั้งค่า</span>
          </button>

          <!-- Official Seal -->
          <div class="flex flex-col items-center pl-0.5">`;

  if (content.includes(targetHeaderStr)) {
    content = content.replace(targetHeaderStr, newHeaderStr);
    console.log('Added settings button to header in:', filePath);
  } else {
    console.log('Could not find targetHeaderStr in:', filePath);
  }

  // 3. Bump version
  content = content.replace(/app\.js\?v=[a-zA-Z0-9_-]+/g, 'app.js?v=20261104_move_settings_header_v1');

  fs.writeFileSync(filePath, content, 'utf8');
}

moveSettingsButton('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html');
moveSettingsButton('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html');
