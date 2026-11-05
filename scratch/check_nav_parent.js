const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const appShellEnd = html.indexOf('</div>\n\n  <!-- ================= 4. MOBILE BOTTOM NAVIGATION BAR');
console.log('Is mobile-bottom-nav OUTSIDE app-shell?:', appShellEnd !== -1);
if (appShellEnd !== -1) {
  console.log(html.substring(appShellEnd - 50, appShellEnd + 300));
}
