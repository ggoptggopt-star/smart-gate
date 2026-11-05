const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const appShellStart = html.indexOf('id="app-shell"');
const appShellEnd = html.indexOf('<!-- END #app-shell -->');
const navPos = html.indexOf('id="mobile-bottom-nav"');

console.log('appShellStart:', appShellStart);
console.log('appShellEnd:', appShellEnd);
console.log('navPos:', navPos);
console.log('Is navPos inside appShell?:', navPos > appShellStart && navPos < appShellEnd);
