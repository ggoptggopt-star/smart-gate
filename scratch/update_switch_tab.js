const fs = require('fs');

function updateSwitchAdminTab() {
  const appPath = 'C:/Users/Admin/Desktop/proj/smart-gate/public/app.js';
  let js = fs.readFileSync(appPath, 'utf8');

  js = js.replace(
    "const tabs = ['users', 'depts', 'timetables', 'settings'];",
    "const tabs = ['users', 'depts', 'timetables', 'settings', 'import_students'];"
  );

  js = js.replace(
    "else if (tabName === 'timetables') loadAdminTimetables();",
    "else if (tabName === 'timetables') loadAdminTimetables();\n  else if (tabName === 'import_students') fetchAdminImportLogs();"
  );

  fs.writeFileSync(appPath, js, 'utf8');
  fs.writeFileSync('C:/Users/Admin/Desktop/SSS/smart-gate/public/app.js', js, 'utf8');
  console.log('Successfully updated switchAdminTab in app.js!');

  // Also check panel ID in index.html: in index.html we created admin-tab-import_students, let's make sure it matches admin-panel-import_students
  const htmlPath = 'C:/Users/Admin/Desktop/proj/smart-gate/public/index.html';
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace('id="admin-tab-import_students"', 'id="admin-panel-import_students"');
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync('C:/Users/Admin/Desktop/SSS/smart-gate/public/index.html', html, 'utf8');
  console.log('Successfully updated panel ID in index.html!');
}

updateSwitchAdminTab();
