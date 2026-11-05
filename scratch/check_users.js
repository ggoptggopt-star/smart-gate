require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await sb.from('users').select('id, username, full_name, role, department_id, classroom_id');
  if (error) console.error(error);
  console.log('Total users:', data ? data.length : 0);
  console.log(JSON.stringify(data, null, 2));
}

check();
