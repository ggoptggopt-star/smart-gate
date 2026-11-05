const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const wIdx = html.indexOf('id="auth-view-welcome"');
console.log(html.substring(wIdx, wIdx + 2000));
