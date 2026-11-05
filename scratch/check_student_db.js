require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkStudent() {
  const { data, error } = await supabase.from('users').select('*').eq('username', 'student').single();
  if (error) console.error(error);
  else console.log('Student columns:', Object.keys(data), '\nData:', data);
}
checkStudent();
