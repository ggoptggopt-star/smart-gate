const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');
const start = html.indexOf('id="home-student-view"');
const end = html.indexOf('<!-- 2. กล่องสถานะคำขอปัจจุบัน (ไดนามิก) -->');
console.log('--- Current Announcement Box ---');
console.log(html.substring(start, end));
