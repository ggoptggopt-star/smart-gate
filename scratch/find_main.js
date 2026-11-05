const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

// Find main tag or app container
const mainIdx = html.indexOf('<main');
console.log('main tag index:', mainIdx);
if (mainIdx !== -1) {
  console.log(html.substring(mainIdx, mainIdx + 600));
}
