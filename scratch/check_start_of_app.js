const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const savIdx = js.indexOf('function setAuthView');
console.log('Index of function setAuthView:', savIdx);
console.log('Code before setAuthView (first 1000 chars):');
console.log(js.substring(0, 1000));
