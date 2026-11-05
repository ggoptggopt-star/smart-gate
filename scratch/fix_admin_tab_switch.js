const fs = require('fs');

function fixAdminTabSwitch() {
  const appPath = 'C:/Users/Admin/Desktop/proj/smart-gate/public/app.js';
  let js = fs.readFileSync(appPath, 'utf8');

  const oldTarget = `function switchAdminTab(tab) {
  currentAdminTab = tab;
  const tabs = ['users', 'depts', 'timetables', 'overrides'];`;

  const newTarget = `function switchAdminTab(tab) {
  currentAdminTab = tab;
  const tabs = ['users', 'depts', 'timetables', 'overrides', 'import_students'];`;

  if (js.includes(oldTarget)) {
    js = js.replace(oldTarget, newTarget);
    
    // Also trigger fetchAdminImportLogs if tab is import_students
    const subTarget = `if (tab === 'timetables') {
    fetchAdminTimetables();
  }`;

    const newSubTarget = `if (tab === 'timetables') {
    fetchAdminTimetables();
  }
  if (tab === 'import_students') {
    fetchAdminImportLogs();
  }`;

    if (js.includes(subTarget)) {
      js = js.replace(subTarget, newSubTarget);
    }

    fs.writeFileSync(appPath, js, 'utf8');
    fs.writeFileSync('C:/Users/Admin/Desktop/SSS/smart-gate/public/app.js', js, 'utf8');
    console.log('Updated switchAdminTab in app.js successfully!');
  } else {
    console.log('Target switchAdminTab not matched in app.js');
  }
}

fixAdminTabSwitch();
