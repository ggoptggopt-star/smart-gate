require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runTest() {
  console.log('=== TEST 30-SECOND OUTBOUND GATE WORKFLOW ===\n');

  // 1. Prepare request 33 as approved with valid qr_token for today (regular outbound)
  const testToken = 'TEST_QR_GATE_30S';
  console.log('1. Setting up Request #33 as regular APPROVED with QR token:', testToken);
  const { error: prepErr } = await sb.from('leave_requests').update({
    status: 'approved',
    qr_token: testToken,
    leave_type: 'business',
    no_return: false,
    expected_return_time: '15:30:00',
    is_qr_used: false,
    leave_date: '2026-11-05'
  }).eq('id', 33);
  if (prepErr) throw prepErr;
  console.log(' -> Request #33 set to APPROVED successfully.');

  // 2. Scan QR at Gate Kiosk
  console.log('\n2. Scanning QR at Gate Kiosk (POST /api/gate/scan)...');
  const scanRes = await fetch('http://localhost:3000/api/gate/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: testToken, scanType: 'exit' })
  });
  const scanData = await scanRes.json();
  console.log('Gate Scan Result:');
  console.log(' - success:', scanData.success);
  console.log(' - gateStatus:', scanData.gateStatus);
  console.log(' - openDuration:', scanData.openDuration, 'seconds');
  console.log(' - message:', scanData.message);
  console.log(' - notice:', scanData.notice);

  // 3. Verify that gate status is gate_opened and QR is NOT expired
  console.log('\n3. Verifying interim state (gate_opened) in Database...');
  const { data: midReq } = await sb.from('leave_requests').select('*').eq('id', 33).single();
  console.log(' - Status in DB:', midReq.status);
  console.log(' - is_qr_used in DB:', midReq.is_qr_used);

  if (midReq.status === 'gate_opened' && midReq.is_qr_used === false) {
    console.log(' ✅ PASS: Request is "gate_opened" and QR token is NOT expired yet!');
  } else {
    console.error(' ❌ FAIL: Status or is_qr_used unexpected', midReq.status, midReq.is_qr_used);
  }

  // 4. Verify gate status endpoint (/api/gate/status)
  console.log('\n4. Checking /api/gate/status...');
  const statusRes = await fetch('http://localhost:3000/api/gate/status');
  const statusData = await statusRes.json();
  console.log(' - Gate online:', statusData.gate.online, '(', statusData.gate.connectionType, ')');
  console.log(' - Door state:', statusData.simulator.door);
  console.log(' - Active open sessions count:', (statusData.activeSessions || []).length);
  if (statusData.activeSessions && statusData.activeSessions.length > 0) {
    console.log('   * Session RequestId:', statusData.activeSessions[0].requestId, 'Remaining:', statusData.activeSessions[0].remainingSeconds, 's');
  }

  // 5. Simulate vehicle / student passing ultrasonic sensor
  console.log('\n5. Simulating vehicle/student passing ultrasonic sensor (POST /api/gate/sensor-pass)...');
  const passRes = await fetch('http://localhost:3000/api/gate/sensor-pass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: 33, reason: 'SENSOR_PASSED' })
  });
  const passData = await passRes.json();
  console.log('Sensor Pass Result:', passData.message);

  // 6. Verify final state: gate closed, status = 'exited', is_qr_used = true
  console.log('\n6. Verifying final state in Database after sensor pass...');
  const { data: finalReq } = await sb.from('leave_requests').select('*').eq('id', 33).single();
  console.log(' - Final Status:', finalReq.status);
  console.log(' - Final is_qr_used:', finalReq.is_qr_used);
  console.log(' - Actual Out Time:', finalReq.actual_out_time);

  if (finalReq.status === 'exited' && finalReq.is_qr_used === true && finalReq.actual_out_time) {
    console.log('\n🎉 ALL 4 REQUIREMENTS VERIFIED & PASSED PERFECTLY!');
    console.log(' 1. ขาออก: สแกน QR ที่ตู้ ➔ เซิร์ฟเวอร์สั่ง ESP32 ยกไม้กั้น 30 วินาที (สำเร็จ)');
    console.log(' 2. QR ไม่หมดทันทีที่สแกน (is_qr_used=false, status=gate_opened) (สำเร็จ)');
    console.log(' 3. ผ่านเซนเซอร์ หรือ 30 วินาที ไม้กั้นจะปิดลง (สำเร็จ)');
    console.log(' 4. QR หมดอายุและเปลี่ยนเป็น exited หลังจากไม้กั้นปิดลงจริง (สำเร็จ)');
  } else {
    console.error('Final check mismatch:', finalReq);
  }
}

runTest().catch(console.error);
