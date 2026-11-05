const { execSync } = require('child_process');
const path = 'C:\\Users\\Admin\\AppData\\Local\\GitHubDesktop\\app-3.6.10\\resources\\app\\git\\cmd\\git.exe';

function run(cmd) {
  console.log('>', cmd);
  try {
    const out = execSync(`"${path}" ${cmd}`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run('init');
run('branch -M main');
run('remote remove origin');
run('remote add origin https://github.com/ggoptggopt-star/smart-gate.git');
run('remote -v');
run('status');

