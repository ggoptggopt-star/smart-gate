const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const regex = /mobile-bottom-nav/g;
let m;
while ((m = regex.exec(js)) !== null) {
  console.log('mobile-bottom-nav at:', m.index, js.substring(m.index - 50, m.index + 200));
}
