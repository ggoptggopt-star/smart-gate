const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
console.log(html.substring(sIdx, eIdx + 8));
