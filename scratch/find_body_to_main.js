const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const bIdx = html.indexOf('<body');
const mIdx = html.indexOf('<main');
console.log(html.substring(bIdx, mIdx));
