const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const approverIdx = html.indexOf('id="home-approver-view"');
const bullhornIdx = html.indexOf('fa-bullhorn', approverIdx);
console.log(html.substring(bullhornIdx - 300, bullhornIdx + 1200));
