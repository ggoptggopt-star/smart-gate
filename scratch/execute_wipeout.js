require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function executeWipeout() {
  console.log('=== STARTING COMPLETE WIPEOUT TO ZERO ===\n');

  // 1. Delete all approval_logs
  console.log('1. Deleting all approval_logs...');
  const { error: appErr } = await sb.from('approval_logs').delete().neq('id', 0);
  if (appErr) console.warn('approval_logs delete warning:', appErr.message);
  else console.log(' -> approval_logs cleared to 0');

  // 2. Delete all scan_logs
  console.log('2. Deleting all scan_logs...');
  const { error: scanErr } = await sb.from('scan_logs').delete().neq('id', 0);
  if (scanErr) console.warn('scan_logs delete warning:', scanErr.message);
  else console.log(' -> scan_logs cleared to 0');

  // 3. Delete all leave_requests
  console.log('3. Deleting all leave_requests...');
  const { error: reqErr } = await sb.from('leave_requests').delete().neq('id', 0);
  if (reqErr) console.warn('leave_requests delete warning:', reqErr.message);
  else console.log(' -> leave_requests cleared to 0');

  // 4. Clean users table (Delete all except admin, or recreate clean admin)
  console.log('4. Cleaning users table...');
  const { error: userDelErr } = await sb.from('users').delete().neq('username', 'admin');
  if (userDelErr) console.warn('users delete warning:', userDelErr.message);
  else console.log(' -> All non-admin users deleted');

  // Ensure clean admin account exists with password123
  const passwordHash = bcrypt.hashSync('password123', 10);
  const { data: adminExists } = await sb.from('users').select('*').eq('username', 'admin').single();

  if (adminExists) {
    await sb.from('users').update({
      password: passwordHash,
      full_name: 'ผู้ดูแลระบบ OnePass (Admin)',
      role: 'admin',
      department_id: null,
      classroom_id: null
    }).eq('username', 'admin');
    console.log(' -> Admin account password updated to "password123"');
  } else {
    await sb.from('users').insert([{
      id: '00000000-0000-0000-0000-000000000099',
      username: 'admin',
      password: passwordHash,
      full_name: 'ผู้ดูแลระบบ OnePass (Admin)',
      role: 'admin'
    }]);
    console.log(' -> Admin account created fresh with "password123"');
  }

  // 5. Reset local files
  console.log('5. Resetting local data files in data/...');
  const dataDir = path.join(__dirname, '..', 'data');
  
  fs.writeFileSync(path.join(dataDir, 'requests_meta.json'), JSON.stringify({}, null, 2), 'utf8');
  console.log(' -> requests_meta.json reset to {}');

  fs.writeFileSync(path.join(dataDir, 'login_logs.json'), JSON.stringify([], null, 2), 'utf8');
  console.log(' -> login_logs.json reset to []');

  fs.writeFileSync(path.join(dataDir, 'device_requests.json'), JSON.stringify([], null, 2), 'utf8');
  console.log(' -> device_requests.json reset to []');

  fs.writeFileSync(path.join(dataDir, 'delegations.json'), JSON.stringify({}, null, 2), 'utf8');
  console.log(' -> delegations.json reset to {}');

  fs.writeFileSync(path.join(dataDir, 'deleted_users.json'), JSON.stringify([], null, 2), 'utf8');
  console.log(' -> deleted_users.json reset to []');

  // Reset profiles.json to only contain admin
  const cleanProfiles = {
    "admin": {
      "username": "admin",
      "full_name": "ผู้ดูแลระบบ OnePass (Admin)",
      "role": "admin",
      "college": "วิทยาลัยการอาชีพองครักษ์",
      "updatedAt": new Date().toISOString()
    }
  };
  fs.writeFileSync(path.join(dataDir, 'profiles.json'), JSON.stringify(cleanProfiles, null, 2), 'utf8');
  console.log(' -> profiles.json reset to clean admin profile');

  // 6. Verify table counts
  console.log('\n=== FINAL VERIFICATION OF RECORD COUNTS ===');
  const checkTables = ['leave_requests', 'approval_logs', 'scan_logs', 'users', 'departments', 'classrooms'];
  for (const t of checkTables) {
    const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
    console.log(`${t}: ${count} rows`);
  }

  console.log('\n🎉 COMPLETE WIPEOUT FINISHED SUCCESSFULLY!');
}

executeWipeout().catch(console.error);
