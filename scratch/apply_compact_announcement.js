const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update viewport meta with viewport-fit=cover
  content = content.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
  );

  // 2. Update <main> padding-bottom for safe area
  content = content.replace(
    '<main class="max-w-3xl w-full mx-auto px-3.5 sm:px-4 py-4 sm:py-6 pb-24 flex-1 space-y-4 sm:space-y-6">',
    '<main class="max-w-3xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] flex-1 space-y-3 sm:space-y-5">'
  );

  // 3. Compact Announcement Card in home-student-view
  const oldCard = `<!-- 1. กล่องเวลาเข้า-ออก (ประกาศสถานศึกษา) -->
        <div class="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-2.5 sm:space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-sm sm:text-lg shrink-0 shadow-sm">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <h3 class="font-bold text-slate-800 text-sm sm:text-base leading-tight">เวลาเข้า - ออก</h3>
                <p class="text-[10px] sm:text-[11px] text-slate-400">ระเบียบฝ่ายพัฒนากิจการนักเรียน นักศึกษา</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap justify-end">
              <!-- Gate Hardware Status Badge (มุมมองนักเรียน - ย้ายมาไว้ในการ์ดประกาศตามที่วงไว้) -->
              <div id="header-gate-badge" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold shadow-2xs" title="สถานะการเชื่อมต่อบอร์ด ESP32 ควบคุมไม้กั้น">
                <span id="header-gate-dot" class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span id="header-gate-text" class="text-rose-700 text-[10px] sm:text-[11px] font-bold">ไม้กั้นออฟไลน์</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[9px] sm:text-[10px] font-bold">
                <i class="fa-solid fa-bell mr-0.5 text-blue-500"></i> ระเบียบวิทยาลัย
              </span>
            </div>
          </div>

          <!-- กล่องตารางเวลา -->
          <div class="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 font-medium text-slate-700">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i class="fa-regular fa-sun text-amber-500 text-xs sm:text-sm"></i> <strong>เวลาเข้าสถานศึกษา:</strong></span>
              <span class="font-bold text-slate-800">ก่อน 08:00 น.</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200/70 pt-1.5">
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-utensils text-emerald-500 text-xs sm:text-sm"></i> <strong>เวลาพักกลางวัน:</strong></span>
              <span class="font-bold text-slate-800">12:00 น. - 13:00 น.</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200/70 pt-1.5">
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-door-open text-blue-500 text-xs sm:text-sm"></i> <strong>เวลาเลิกเรียน:</strong></span>
              <span class="font-bold text-slate-800">ตั้งแต่ 16:00 น. เป็นต้นไป</span>
            </div>
          </div>

          <p class="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-blue-500"></i> นอกเหนือเวลาดังกล่าว ต้องมีใบคำร้อง OnePass ที่ได้รับอนุมัติแล้วเท่านั้น
          </p>
        </div>`;

  const newCard = `<!-- 1. กล่องเวลาเข้า-ออก (ประกาศสถานศึกษา) - ปรับแบบ 3 คอลัมน์ แนวนอน ประหยัดพื้นที่หน้าจอ -->
        <div class="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200 space-y-2 sm:space-y-2.5 relative overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-base shrink-0 shadow-xs">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-slate-800 text-xs sm:text-sm leading-tight truncate">เวลาเข้า - ออก</h3>
                <p class="text-[9px] sm:text-[10px] text-slate-400 truncate">ระเบียบฝ่ายพัฒนากิจการฯ</p>
              </div>
            </div>
            <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end shrink-0">
              <!-- Gate Hardware Status Badge (มุมมองนักเรียน) -->
              <div id="header-gate-badge" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold shadow-2xs" title="สถานะการเชื่อมต่อบอร์ด ESP32 ควบคุมไม้กั้น">
                <span id="header-gate-dot" class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span id="header-gate-text" class="text-rose-700 text-[9px] sm:text-[10.5px] font-bold">ไม้กั้นออฟไลน์</span>
              </div>
              <span class="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[8.5px] sm:text-[10px] font-bold">
                <i class="fa-solid fa-bell mr-0.5 text-blue-500"></i> ระเบียบ
              </span>
            </div>
          </div>

          <!-- ตารางเวลาแบบ 3 คอลัมน์ แนวนอน (Compact 3-Column Mini Cards) -->
          <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
            <!-- เข้าสถานศึกษา -->
            <div class="bg-amber-50/70 border border-amber-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-amber-800 font-semibold">
                <i class="fa-regular fa-sun text-amber-500 text-xs sm:text-sm"></i>
                <span class="truncate">เข้าสถานศึกษา</span>
              </div>
              <div class="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-0.5">
                ก่อน 08:00
              </div>
            </div>

            <!-- พักกลางวัน -->
            <div class="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-emerald-800 font-semibold">
                <i class="fa-solid fa-utensils text-emerald-500 text-xs sm:text-sm"></i>
                <span class="truncate">พักกลางวัน</span>
              </div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                12:00-13:00
              </div>
            </div>

            <!-- เลิกเรียน -->
            <div class="bg-blue-50/70 border border-blue-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-blue-800 font-semibold">
                <i class="fa-solid fa-door-open text-blue-500 text-xs sm:text-sm"></i>
                <span class="truncate">เลิกเรียน</span>
              </div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                ตั้งแต่ 16:00
              </div>
            </div>
          </div>

          <p class="text-[9px] sm:text-[10.5px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50/80 px-2 py-0.5 rounded-lg border border-slate-100">
            <i class="fa-solid fa-circle-info text-blue-500 shrink-0 text-[10px] sm:text-xs"></i>
            <span class="truncate">นอกเวลาดังกล่าว ต้องมีใบคำร้อง OnePass ที่ได้รับอนุมัติ</span>
          </p>
        </div>`;

  if (content.includes(oldCard)) {
    content = content.replace(oldCard, newCard);
    console.log('Replaced student announcement card successfully in:', filePath);
  } else {
    console.log('Could not find exact old student announcement card in:', filePath);
  }

  // 4. Compact Announcement Card in home-approver-view (similar structure)
  const oldApproverCard = `<!-- 1. กล่องเวลาเข้า-ออก (ระเบียบวิทยาลัย) -->
        <div class="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-2.5 sm:space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-sm sm:text-lg shrink-0 shadow-sm">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <h3 class="font-bold text-slate-800 text-sm sm:text-base leading-tight">เวลาเข้า - ออก</h3>
                <p class="text-[10px] sm:text-[11px] text-slate-400">ระเบียบฝ่ายพัฒนากิจการนักเรียน นักศึกษา</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap justify-end">
              <!-- Gate Hardware Status Badge (มุมมองนักเรียน - ย้ายมาไว้ในการ์ดประกาศตามที่วงไว้) -->
              <div id="header-gate-badge" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold shadow-2xs" title="สถานะการเชื่อมต่อบอร์ด ESP32 ควบคุมไม้กั้น">
                <span id="header-gate-dot" class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span id="header-gate-text" class="text-rose-700 text-[10px] sm:text-[11px] font-bold">ไม้กั้นออฟไลน์</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[9px] sm:text-[10px] font-bold">
                <i class="fa-solid fa-bell mr-0.5 text-blue-500"></i> ระเบียบวิทยาลัย
              </span>
            </div>
          </div>

          <div class="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 font-medium text-slate-700">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i class="fa-regular fa-sun text-amber-500 text-xs sm:text-sm"></i> <strong>เวลาเข้าสถานศึกษา:</strong></span>
              <span class="font-bold text-slate-800">ก่อน 08:00 น.</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200/70 pt-1.5">
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-utensils text-emerald-500 text-xs sm:text-sm"></i> <strong>เวลาพักกลางวัน:</strong></span>
              <span class="font-bold text-slate-800">12:00 น. - 13:00 น.</span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200/70 pt-1.5">
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-door-open text-blue-500 text-xs sm:text-sm"></i> <strong>เวลาเลิกเรียน:</strong></span>
              <span class="font-bold text-slate-800">ตั้งแต่ 16:00 น. เป็นต้นไป</span>
            </div>
          </div>

          <p class="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-blue-500"></i> นอกเหนือเวลาดังกล่าว ต้องมีใบคำร้อง OnePass ที่ได้รับอนุมัติแล้วเท่านั้น
          </p>
        </div>`;

  const newApproverCard = `<!-- 1. กล่องเวลาเข้า-ออก (ระเบียบวิทยาลัย) - ปรับแบบ 3 คอลัมน์ แนวนอน ประหยัดพื้นที่หน้าจอ -->
        <div class="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200 space-y-2 sm:space-y-2.5 relative overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-base shrink-0 shadow-xs">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-slate-800 text-xs sm:text-sm leading-tight truncate">เวลาเข้า - ออก</h3>
                <p class="text-[9px] sm:text-[10px] text-slate-400 truncate">ระเบียบฝ่ายพัฒนากิจการฯ</p>
              </div>
            </div>
            <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end shrink-0">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[8.5px] sm:text-[10px] font-bold">
                <i class="fa-solid fa-bell mr-0.5 text-blue-500"></i> ระเบียบ
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
            <div class="bg-amber-50/70 border border-amber-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-amber-800 font-semibold">
                <i class="fa-regular fa-sun text-amber-500 text-xs sm:text-sm"></i>
                <span class="truncate">เข้าสถานศึกษา</span>
              </div>
              <div class="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-0.5">
                ก่อน 08:00
              </div>
            </div>

            <div class="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-emerald-800 font-semibold">
                <i class="fa-solid fa-utensils text-emerald-500 text-xs sm:text-sm"></i>
                <span class="truncate">พักกลางวัน</span>
              </div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                12:00-13:00
              </div>
            </div>

            <div class="bg-blue-50/70 border border-blue-200/70 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center">
              <div class="flex items-center gap-1 text-[9.5px] sm:text-xs text-blue-800 font-semibold">
                <i class="fa-solid fa-door-open text-blue-500 text-xs sm:text-sm"></i>
                <span class="truncate">เลิกเรียน</span>
              </div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                ตั้งแต่ 16:00
              </div>
            </div>
          </div>

          <p class="text-[9px] sm:text-[10.5px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50/80 px-2 py-0.5 rounded-lg border border-slate-100">
            <i class="fa-solid fa-circle-info text-blue-500 shrink-0 text-[10px] sm:text-xs"></i>
            <span class="truncate">นอกเวลาดังกล่าว ต้องมีใบคำร้อง OnePass ที่ได้รับอนุมัติ</span>
          </p>
        </div>`;

  if (content.includes(oldApproverCard)) {
    content = content.replace(oldApproverCard, newApproverCard);
    console.log('Replaced approver announcement card successfully in:', filePath);
  } else {
    console.log('Could not find exact old approver announcement card in:', filePath);
  }

  // 5. Bump script version
  content = content.replace(/app\.js\?v=[a-zA-Z0-9_-]+/g, 'app.js?v=20261104_compact_announcement_v1');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Saved updated file:', filePath);
}

updateFile('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html');
updateFile('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html');
