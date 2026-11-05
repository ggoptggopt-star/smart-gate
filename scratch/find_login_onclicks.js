const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const loginStart = html.indexOf('id="auth-view-login"');
const loginEnd = html.indexOf('id="auth-view-register"');
const snippet = html.substring(loginStart, loginEnd);

const onclicks = snippet.match(/onclick="[^"]+"/g);
console.log('Onclicks in auth-view-login:', onclicks);
