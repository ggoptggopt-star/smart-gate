const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const regex = /(fixed|absolute)[^"]*inset-0[^"]*/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Overlay match:', m[0]);
}
