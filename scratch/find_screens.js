const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const matches = html.match(/id="screen-[^"]+"/g);
console.log('Screens:', matches);
