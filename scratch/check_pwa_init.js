const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const pwaIdx = js.indexOf('function initPwaServiceWorker');
console.log('initPwaServiceWorker snippet:');
console.log(js.substring(pwaIdx, pwaIdx + 800));
