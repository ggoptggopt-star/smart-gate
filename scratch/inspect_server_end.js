const fs = require('fs');
const s = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/server.js', 'utf8');

const endOfFile = s.slice(-2500);
console.log('--- End of server.js ---');
console.log(endOfFile);
