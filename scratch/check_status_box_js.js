const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const statusIdx = js.indexOf('home-current-status-box');
console.log('Status box in JS:', statusIdx);
if (statusIdx !== -1) {
  console.log(js.substring(statusIdx - 50, statusIdx + 1200));
}
