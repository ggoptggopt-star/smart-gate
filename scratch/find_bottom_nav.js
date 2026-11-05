const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

// Find bottom nav
const needle = 'id="mobile-bottom-nav"';
const idx = html.indexOf(needle);
console.log('mobile-bottom-nav index:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 200, idx + 1500));
}

// Find main wrapper
const bodyIdx = html.indexOf('<body');
console.log('body tag:', html.substring(bodyIdx, bodyIdx + 500));
