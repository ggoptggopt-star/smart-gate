const { execSync } = require('child_process');
const gitExe = 'C:\\Users\\Admin\\AppData\\Local\\GitHubDesktop\\app-3.6.10\\resources\\app\\git\\cmd\\git.exe';

function execGit(cmd) {
  console.log(`\n> git ${cmd}`);
  try {
    const out = execSync(`"${gitExe}" ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
    if (out) console.log(out.trim());
    return { success: true, output: out };
  } catch (err) {
    console.error(`Error executing "git ${cmd}":`, err.stderr ? err.stderr.trim() : err.message);
    return { success: false, error: err };
  }
}

async function main() {
  console.log('=== PUSHING SMART-GATE TO GITHUB ===');
  execGit('init');
  execGit('branch -M main');
  
  // Set remote origin
  execGit('remote remove origin');
  execGit('remote add origin https://github.com/ggoptggopt-star/smart-gate.git');

  // Add all files
  execGit('add .');

  // Commit
  execGit('commit -m "Update OnePass: 4-step approval flow, period-based timetable, clean database, ESP32 firmware"');

  // Push to remote main
  console.log('\n> Pushing to origin main...');
  const pushRes = execGit('push -u origin main --force');

  if (pushRes.success) {
    console.log('\n🎉 Successfully pushed to GitHub (https://github.com/ggoptggopt-star/smart-gate)!');
  } else {
    console.log('\n⚠️ Push failed, checking git remote and credentials...');
  }
}

main();

