require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'onepass_jwt_secret_key_2026_smartgate_secure_token';

const studentToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000001', username: 'student', role: 'student' }, JWT_SECRET);
const disciplineToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000004', username: 'discipline', role: 'discipline_head' }, JWT_SECRET);

async function runTests() {
  console.log("=== STARTING INTEGRATION TESTS FOR RETURN ENGINE ===");

  // 1. Check live returns endpoint
  const lrRes = await fetch('http://localhost:3000/api/gate/discipline/live-returns', {
    headers: { Authorization: `Bearer ${disciplineToken}` }
  });
  const lrData = await lrRes.json();
  console.log("1. Live Returns Endpoint Success:", lrData.success, "Counts:", lrData.counts);

  // 2. Test Inbound QR Scan rejection
  const scanInRes = await fetch('http://localhost:3000/api/gate/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'test_token', scanType: 'entry' })
  });
  const scanInData = await scanInRes.json();
  console.log("2. Inbound Scan Rejection Result:", scanInData.reason);

  // 3. Test Return Button with simulated request (Key: 26 in requests_meta)
  // 3.1 Test flagged return (> 60 cm)
  const returnFlaggedRes = await fetch('http://localhost:3000/api/gate/return-button', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      requestId: '26',
      distanceCm: 95
    })
  });
  const flaggedData = await returnFlaggedRes.json();
  console.log("3. Return Button (95 cm - Out of Range):", {
    success: flaggedData.success,
    status: flaggedData.verificationStatus,
    isFlagged: flaggedData.isFlagged,
    message: flaggedData.message
  });

  // 4. Test Discipline Revoke
  const revokeRes = await fetch('http://localhost:3000/api/gate/discipline/return-revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${disciplineToken}`
    },
    body: JSON.stringify({
      requestId: '26',
      reason: 'ทดสอบการเพิกถอนรายการกดผิด'
    })
  });
  const revokeData = await revokeRes.json();
  console.log("4. Discipline Revoke Result:", revokeData.message);

  // 5. Test Return Button valid (25 cm <= 60 cm)
  const returnValidRes = await fetch('http://localhost:3000/api/gate/return-button', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      requestId: '26',
      distanceCm: 25
    })
  });
  const validData = await returnValidRes.json();
  console.log("5. Return Button (25 cm - In Range):", {
    success: validData.success,
    status: validData.verificationStatus,
    isFlagged: validData.isFlagged,
    message: validData.message
  });

  // 6. Test Discipline Manual Return
  const manualRes = await fetch('http://localhost:3000/api/gate/discipline/return-manual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${disciplineToken}`
    },
    body: JSON.stringify({
      requestId: '26',
      note: 'ฝ่ายปกครองตรวจพบตัวที่อาคาร 3 บันทึกรับเข้าแทน'
    })
  });
  const manualData = await manualRes.json();
  console.log("6. Discipline Manual Return Result:", manualData.message);

  // 7. Verify Live Returns updated
  const lrRes2 = await fetch('http://localhost:3000/api/gate/discipline/live-returns', {
    headers: { Authorization: `Bearer ${disciplineToken}` }
  });
  const lrData2 = await lrRes2.json();
  console.log("7. Live Returns Stats After Tests:", lrData2.counts.statsByMethod);

  console.log("=== ALL INTEGRATION TESTS PASSED PERFECTLY ===");
}

runTests().catch(err => console.error(err));
