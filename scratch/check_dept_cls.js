require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDeptAndClass() {
  const { data: dept } = await supabase.from('departments').select('*');
  const { data: cls } = await supabase.from('classrooms').select('*');
  console.log('Departments:', dept);
  console.log('Classrooms:', cls);
}
checkDeptAndClass();
