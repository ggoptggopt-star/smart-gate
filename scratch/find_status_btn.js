const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const needle = 'setViewMode(\'status\')';
const idx = html.indexOf(needle);
console.log(html.substring(idx - 150, idx + 400));
