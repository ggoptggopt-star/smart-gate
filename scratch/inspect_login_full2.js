const fs = require('fs');
const s = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/server.js', 'utf8');

const loginIdx = s.indexOf("app.post('/api/login'");
console.log('--- app.post(/api/login) part 2 ---');
console.log(s.substring(loginIdx + 1800, loginIdx + 3800));
