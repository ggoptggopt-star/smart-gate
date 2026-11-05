const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const needle = '<!-- 2. กล่องสถานะคำขอปัจจุบัน (ไดนามิก) -->';
const idx = html.indexOf(needle);
if (idx !== -1) {
  console.log(html.substring(idx, idx + 3500));
}
