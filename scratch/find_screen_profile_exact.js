const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const pIdx = html.indexOf('id="screen-profile"');
console.log(html.substring(pIdx - 100, pIdx + 600));
