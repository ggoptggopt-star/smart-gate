const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

const regex = /(addEventListener\(['"]DOMContentLoaded|window\.onload|\$\(document\)\.ready)/g;
let m;
while ((m = regex.exec(js)) !== null) {
  console.log('Init match:', m[0], 'at pos:', m.index);
}

// Check end of app.js
console.log('--- Last 2000 chars of app.js ---');
console.log(js.slice(-2000));
