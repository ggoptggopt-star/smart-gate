require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await sb.from('leave_requests').select('id, request_no, qr_token, status, leave_date, is_qr_used').order('id', { ascending: false }).limit(6);
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

check();
