const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const domIdx = js.indexOf("addEventListener('DOMContentLoaded'");
console.log('DOMContentLoaded snippet:');
console.log(js.substring(domIdx, domIdx + 2000));
