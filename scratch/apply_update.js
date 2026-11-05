const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'ooo_extracted');
const dstDir = path.resolve(__dirname, '..');

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dst, item));
    }
  } else {
    fs.copyFileSync(src, dst);
    console.log('Updated:', path.relative(dstDir, dst));
  }
}

copyRecursive(srcDir, dstDir);
console.log('All files from OOO.zip successfully applied!');
