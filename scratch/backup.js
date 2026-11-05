const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'smartgate_bk_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Copy files
  execSync(`robocopy . "${tempDir}" /E /XD node_modules .git scratch\\chrome_* /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`);
  
  const destZip = 'C:\\Users\\Admin\\Desktop\\LLL.zip';
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${destZip}' -Force"`);
  
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('✅ Backup zip created at:', destZip);
} catch (err) {
  console.warn('Backup warning:', err.message);
}
