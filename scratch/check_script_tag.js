const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const regex = /<script[^>]*src="[^"]*app\.js[^"]*"[^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Script tag:', m[0]);
}
