require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function backupSnapshot() {
  console.log('=== CREATING PRE-RESET SAFETY SNAPSHOT ===');
  const backupDir = path.join(__dirname, '..', 'data', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotFile = path.join(backupDir, `snapshot_${timestamp}.json`);

  const tables = ['leave_requests', 'approval_logs', 'scan_logs', 'users', 'departments', 'classrooms'];
  const snapshotData = {};

  for (const t of tables) {
    const { data, error } = await sb.from(t).select('*');
    snapshotData[t] = data || [];
    console.log(`Backed up ${t}: ${snapshotData[t].length} rows`);
  }

  // Backup data files
  const dataDir = path.join(__dirname, '..', 'data');
  const jsonFiles = ['profiles.json', 'requests_meta.json', 'settings.json', 'login_logs.json', 'device_requests.json', 'delegations.json'];
  snapshotData.localFiles = {};
  for (const f of jsonFiles) {
    const p = path.join(dataDir, f);
    if (fs.existsSync(p)) {
      snapshotData.localFiles[f] = JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    }
  }

  fs.writeFileSync(snapshotFile, JSON.stringify(snapshotData, null, 2), 'utf8');
  console.log(`✅ Snapshot saved to: ${snapshotFile}`);
}

backupSnapshot();
