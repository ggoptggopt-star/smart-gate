const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const navIdx = html.indexOf('id="mobile-bottom-nav"');
console.log('mobile-bottom-nav at:', navIdx);
console.log('Surrounding 400 chars:');
console.log(html.substring(navIdx - 200, navIdx + 200));
