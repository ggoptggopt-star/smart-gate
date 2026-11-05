const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const regSubmitIdx = js.indexOf('handleRegisterSubmit');
console.log('handleRegisterSubmit:');
console.log(js.substring(regSubmitIdx, regSubmitIdx + 1200));

const appIdx = js.indexOf('applyCurrentUserUI');
console.log('applyCurrentUserUI:');
console.log(js.substring(appIdx, appIdx + 1200));
