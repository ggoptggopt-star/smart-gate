const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const navIdx = html.indexOf('id="mobile-bottom-nav"');
const bodyEnd = html.indexOf('</body>');
console.log('Distance to body end:', bodyEnd - navIdx);
console.log(html.substring(navIdx + 2000, bodyEnd));
