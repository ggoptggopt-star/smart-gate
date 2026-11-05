const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const caIdx = js.indexOf('function checkAuth(');
console.log(js.substring(caIdx, caIdx + 1500));
