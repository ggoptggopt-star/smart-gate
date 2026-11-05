const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const idx = js.indexOf('function setAuthView');
console.log(js.substring(idx, idx + 1000));
