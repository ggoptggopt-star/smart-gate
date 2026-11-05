const fs = require('fs');

function fixAuthButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add early setAuthView in <head>
  const oldThemeScript = `<script>(function(){try{var t=localStorage.getItem("onepass_theme");if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();</script>`;
  const newEarlyScript = `<script>
    (function(){
      try{
        var t=localStorage.getItem("onepass_theme");
        if(t==="dark"){document.documentElement.classList.add("dark");}
      }catch(e){}
    })();

    // Early Auth View Switcher (Ensures Login/Register buttons work with 0ms delay on mobile)
    function setAuthView(view) {
      window.currentAuthView = view;
      var vw = document.getElementById('auth-view-welcome');
      var vl = document.getElementById('auth-view-login');
      var vr = document.getElementById('auth-view-register');
      if (vw) vw.classList.add('hidden');
      if (vl) vl.classList.add('hidden');
      if (vr) vr.classList.add('hidden');
      if (view === 'welcome' && vw) vw.classList.remove('hidden');
      if (view === 'login' && vl) vl.classList.remove('hidden');
      if (view === 'register' && vr) vr.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.setAuthView = setAuthView;
  </script>`;

  if (content.includes(oldThemeScript)) {
    content = content.replace(oldThemeScript, newEarlyScript);
    console.log('Added early setAuthView in <head> for:', filePath);
  } else {
    console.log('Could not find oldThemeScript in:', filePath);
  }

  // 2. Enhance Login & Sign Up buttons on Welcome screen with IDs and robust touch-action
  const oldWelcomeButtons = `<!-- ปุ่ม 1: Login (ปุ่มทึบสีน้ำเงิน/ม่วง) -->
        <button onclick="setAuthView('login')" class="w-full py-4 bg-[#4f46e5] hover:bg-[#4338ca] active:bg-[#3730a3] text-white font-bold rounded-2xl text-base shadow-lg shadow-indigo-950/50 transition hover:scale-[1.01] flex items-center justify-center gap-2">
          <span>Login</span>
        </button>

        <!-- ปุ่ม 2: Sign Up (ปุ่มขอบเส้นตามรูป) -->
        <button onclick="setAuthView('register')" class="w-full py-4 bg-transparent hover:bg-white/5 active:bg-white/10 text-white font-bold rounded-2xl text-base border-2 border-[#4f46e5] transition hover:scale-[1.01] flex items-center justify-center gap-2">
          <span>Sign Up</span>
        </button>`;

  const newWelcomeButtons = `<!-- ปุ่ม 1: Login (ปุ่มทึบสีน้ำเงิน/ม่วง) -->
        <button type="button" id="btn-welcome-login" onclick="setAuthView('login')" class="w-full py-4 bg-[#4f46e5] hover:bg-[#4338ca] active:bg-[#3730a3] text-white font-bold rounded-2xl text-base shadow-lg shadow-indigo-950/50 transition active:scale-95 cursor-pointer touch-manipulation select-none flex items-center justify-center gap-2">
          <i class="fa-solid fa-right-to-bracket"></i>
          <span>Login เข้าสู่ระบบ</span>
        </button>

        <!-- ปุ่ม 2: Sign Up (ปุ่มขอบเส้นตามรูป) -->
        <button type="button" id="btn-welcome-register" onclick="setAuthView('register')" class="w-full py-4 bg-transparent hover:bg-white/10 active:bg-white/20 text-white font-bold rounded-2xl text-base border-2 border-[#4f46e5] transition active:scale-95 cursor-pointer touch-manipulation select-none flex items-center justify-center gap-2">
          <i class="fa-solid fa-user-plus"></i>
          <span>Sign Up สมัครสมาชิก</span>
        </button>`;

  if (content.includes(oldWelcomeButtons)) {
    content = content.replace(oldWelcomeButtons, newWelcomeButtons);
    console.log('Replaced welcome buttons successfully in:', filePath);
  } else {
    console.log('Could not find oldWelcomeButtons in:', filePath);
  }

  // 3. Update script version
  content = content.replace(/app\.js\?v=[a-zA-Z0-9_-]+/g, 'app.js?v=20261104_auth_click_fix_v2');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixAuthButtons('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html');
fixAuthButtons('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html');
