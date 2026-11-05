const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const appIdx = html.indexOf('id="screen-main-app"');
console.log(html.substring(appIdx, appIdx + 400));
