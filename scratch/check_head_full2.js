const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const headIdx = html.indexOf('<head>');
console.log(html.substring(headIdx + 450, headIdx + 1200));
