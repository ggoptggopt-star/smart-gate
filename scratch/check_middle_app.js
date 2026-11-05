const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const savIdx = js.indexOf('function setAuthView');
console.log('Between 35000 and 38000:');
console.log(js.substring(36500, savIdx + 200));
