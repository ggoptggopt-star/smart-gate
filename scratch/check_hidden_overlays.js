const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const regex = /(fixed|absolute)[^"]*inset-0[^"]*/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const isHidden = m[0].includes('hidden');
  const pos = m.index;
  console.log(`Pos: ${pos}, Hidden: ${isHidden}, Class: ${m[0].slice(0, 80)}`);
}
