const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');
const idx = html.indexOf('btn-open-profile-settings');
console.log(html.substring(idx - 300, idx + 1000));
