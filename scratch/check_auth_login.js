const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const loginIdx = html.indexOf('id="auth-view-login"');
console.log('auth-view-login snippet:');
console.log(html.substring(loginIdx, loginIdx + 1200));
