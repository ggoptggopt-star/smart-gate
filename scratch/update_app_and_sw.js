const fs = require('fs');

function updateAppAndSw(baseDir) {
  // Update app.js
  const appPath = baseDir + '/public/app.js';
  let appJs = fs.readFileSync(appPath, 'utf8');

  if (!appJs.includes('window.setAuthView = setAuthView;')) {
    appJs += '\nwindow.setAuthView = setAuthView;\n';
    fs.writeFileSync(appPath, appJs, 'utf8');
    console.log('Exposed window.setAuthView in:', appPath);
  }

  // Update sw.js cache name so old cache is invalidated
  const swPath = baseDir + '/public/sw.js';
  let swJs = fs.readFileSync(swPath, 'utf8');
  swJs = swJs.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'onepass-pwa-v${Date.now()}';`);
  fs.writeFileSync(swPath, swJs, 'utf8');
  console.log('Updated CACHE_NAME in:', swPath);
}

updateAppAndSw('C:/Users/Admin/Desktop/proj/smart-gate');
updateAppAndSw('C:/Users/Admin/Desktop/SSS/smart-gate');
