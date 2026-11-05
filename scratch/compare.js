const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashFile(p) {
  if (!fs.existsSync(p)) return null;
  return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item === 'node_modules') continue;
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.resolve(__dirname, 'ooo_extracted');
const dstDir = path.resolve(__dirname, '..');

const srcFiles = walk(srcDir);
for (const f of srcFiles) {
  const rel = path.relative(srcDir, f);
  const target = path.join(dstDir, rel);
  const hSrc = hashFile(f);
  const hDst = hashFile(target);
  if (!hDst) {
    console.log('NEW:', rel);
  } else if (hSrc !== hDst) {
    console.log('MODIFIED:', rel);
  }
}
