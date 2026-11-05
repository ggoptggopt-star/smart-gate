const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const testToken = 'TEST-GATE-PASS-8888';
  const testNo = 'TEST-GATE-PASS-8888';
  const today = new Date().toISOString().split('T')[0];

  // 1. Delete any existing test request first
  await supabase.from('leave_requests').delete().eq('request_no', testNo);
  await supabase.from('leave_requests').delete().eq('qr_token', testToken);

  // 2. Insert into Supabase
  const insertPayload = {
    request_no: testNo,
    qr_token: testToken,
    status: 'approved',
    title: 'ทดสอบเปิดไม้กั้น OnePass IoT',
    reason: 'ทดสอบสแกนเปิดประตูไม้กั้นฮาร์ดแวร์จริง (ลบอัตโนมัติเมื่อไม้กั้นปิด)',
    leave_date: today,
    departure_time: '08:00:00',
    expected_return_time: '17:00:00',
    student_id: '00000000-0000-0000-0000-000000000099'
  };

  const { data, error } = await supabase.from('leave_requests').insert([insertPayload]).select();

  if (error) {
    console.error('Insert error:', error.message);
    process.exit(1);
  }

  const createdId = data[0].id;
  console.log('✅ Supabase test record created with ID:', createdId);

  // 3. Save to requests_meta.json
  const metaPath = path.join(__dirname, '..', 'data', 'requests_meta.json');
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {}

  const metaData = {
    requestId: String(createdId),
    requestNo: testNo,
    qrToken: testToken,
    studentName: 'ผู้ทดสอบเปิดไม้กั้น (OnePass Test)',
    isTemporaryTest: true,
    status: 'approved',
    totalSteps: 4,
    createdAt: new Date().toISOString()
  };

  meta[String(createdId)] = metaData;
  meta[testNo] = metaData;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  console.log('✅ Meta saved with isTemporaryTest: true');
}

main();
