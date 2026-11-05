const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const sIdx = html.indexOf('id="screen-auth"');
const eIdx = html.indexOf('<!-- ================= MAIN APP SHELL');
console.log('Inside screen-auth (length:', eIdx - sIdx, ')');

// Check all child elements of screen-auth
const snippet = html.substring(sIdx, eIdx);
const ids = snippet.match(/id="[^"]+"/g);
console.log('IDs inside screen-auth:', ids);
