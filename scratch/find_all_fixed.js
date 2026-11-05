const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const regex = /<[^>]+class="[^"]*fixed[^"]*"[^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const isHidden = m[0].includes('hidden');
  const idMatch = m[0].match(/id="([^"]+)"/);
  const id = idMatch ? idMatch[1] : 'no-id';
  console.log(`ID: ${id}, Hidden: ${isHidden}, Tag: ${m[0].slice(0, 100)}`);
}
