const fs = require('fs');
const js = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');

// Find all top-level statements in app.js
const lines = js.split('\n');
console.log('Total lines:', lines.length);

// Check if setAuthView is attached to window
console.log('window.setAuthView exists in code?:', js.includes('window.setAuthView'));
