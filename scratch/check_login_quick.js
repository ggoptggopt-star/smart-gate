const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const lqIdx = js.indexOf('function loginQuick');
console.log('loginQuick at:', lqIdx);
if (lqIdx !== -1) {
  console.log(js.substring(lqIdx, lqIdx + 600));
}
