require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspectTables() {
  const tables = ['leave_requests', 'approval_logs', 'scan_logs', 'users', 'departments', 'classrooms'];
  console.log('=== SUPABASE TABLE RECORD COUNTS ===');
  for (const t of tables) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`${t}: Error - ${error.message}`);
    else console.log(`${t}: ${count} rows`);
  }
}

inspectTables();
