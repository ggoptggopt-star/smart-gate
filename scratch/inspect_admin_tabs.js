const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');
const adminIdx = html.indexOf('id="screen-admin"');
console.log('--- screen-admin snippet ---');
console.log(html.substring(adminIdx, adminIdx + 2500));
