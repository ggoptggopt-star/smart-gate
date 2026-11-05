const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');
const hIdx = html.indexOf('<header class="onepass-header');
console.log(html.substring(hIdx, hIdx + 1600));
