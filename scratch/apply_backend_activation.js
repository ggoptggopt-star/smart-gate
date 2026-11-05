const fs = require('fs');

function buildBackendActivationPatch() {
  const filePath = 'C:/Users/Admin/Desktop/proj/smart-gate/server.js';
  let serverCode = fs.readFileSync(filePath, 'utf8');

  // Code to insert before app.listen
  const activationEndpointsCode = `
// ============================================================================
// STUDENT PRE-REGISTRATION & SELF-ACTIVATION MODULE (Enterprise Roster System)
// ============================================================================

// Rate Limit & Lockout tracking in memory (IP-level + Account-level)
const rateLimitByIp = new Map(); // ip -> { count: number, resetAt: number }
const MAX_IP_ATTEMPTS = 15;      // 15 attempts per 15 minutes per IP
const IP_WINDOW_MS = 15 * 60 * 1000;

function checkIpRateLimit(req, res) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let rec = rateLimitByIp.get(clientIp);
  if (!rec || now > rec.resetAt) {
    rec = { count: 1, resetAt: now + IP_WINDOW_MS };
    rateLimitByIp.set(clientIp, rec);
    return true;
  }
  rec.count++;
  if (rec.count > MAX_IP_ATTEMPTS) {
    const waitMins = Math.ceil((rec.resetAt - now) / 60000);
    res.status(429).json({
      success: false,
      message: \`มีการร้องขอจากเครือข่ายนี้บ่อยเกินไป กรุณารออีก \${waitMins} นาที\`
    });
    return false;
  }
  return true;
}

// Middleware: Admin JWT Authentication (ตรวจ JWT ฝั่งเซิร์ฟเวอร์ทุก endpoint /api/admin/*)
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (Admin)' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'สิทธิ์การเข้าถึงถูกปฏิเสธ: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
    }
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' });
  }
}

// Middleware: Advisor/Admin JWT Authentication (สำหรับอนุมัติคำขอเปิดบัญชี)
function requireApproverOrAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const allowed = ['admin', 'advisor', 'dept_head', 'discipline_head'];
    if (!decoded || !allowed.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'เฉพาะครูที่ปรึกษาหรือแอดมินเท่านั้น' });
    }
    req.authUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

// ฟังก์ชันแปลงวันเกิด พ.ศ. -> ค.ศ. (ISO: YYYY-MM-DD)
function parseThaiBirthDateToIso(rawDateStr) {
  if (!rawDateStr) return null;
  const str = String(rawDateStr).trim();
  
  // รูปแบบ 1: YYYY-MM-DD (ค.ศ. อยู่แล้ว)
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    if (y > 2400) { // ถ้าเป็น พ.ศ. ในฟอร์แมต YYYY-MM-DD
      return \`\${y - 543}-\${String(m).padStart(2, '0')}-\${String(d).padStart(2, '0')}\`;
    }
    return str;
  }

  // รูปแบบ 2: วว/ดด/ปปปป (เช่น 15/08/2549 หรือ 15-08-2549)
  const slashMatch = str.match(/^(\\d{1,2})[\\/\\-\\.](\\d{1,2})[\\/\\-\\.](\\d{4})$/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    let month = parseInt(slashMatch[2], 10);
    let year = parseInt(slashMatch[3], 10);
    if (year > 2400) year -= 543; // แปลง พ.ศ. -> ค.ศ.
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    }
  }

  // รูปแบบ 3: Date object หรือ timestamp
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    let y = d.getFullYear();
    if (y > 2400) y -= 543;
    return \`\${y}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
  }
  return null;
}

// ฟังก์ชันปิดบังชื่อบางส่วนเพื่อความปลอดภัย (Masking e.g. นาย ธ*** รั***)
function maskStudentName(fullName) {
  if (!fullName) return '***';
  const parts = fullName.trim().split(/\\s+/);
  return parts.map(p => {
    if (p.length <= 2) return p;
    return p[0] + '*'.repeat(Math.min(3, p.length - 1));
  }).join(' ');
}

// ----------------------------------------------------------------------------
// 1. ดาวน์โหลดไฟล์แม่แบบนักเรียน (Excel/CSV Template)
// ----------------------------------------------------------------------------
app.get('/api/admin/student-template', (req, res) => {
  const csvHeaders = 'รหัสนักศึกษา,คำนำหน้า,ชื่อ,นามสกุล,แผนกวิชา,ห้องเรียน,วันเกิด(วว/ดด/ปปปป พ.ศ.),เบอร์โทร,เบอร์ผู้ปกครอง';
  const sample1 = '66209010001,นาย,สมชาย,ใจดี,แผนกวิชาช่างยนต์,ปวช.3/1 (ช่างยนต์),15/08/2549,0812345678,0898765432';
  const sample2 = '67202010002,นางสาว,สมหญิง,รักเรียน,แผนกวิชาการบัญชี,ปวช.2/1 (การบัญชี),20/01/2550,0823456789,0887654321';
  const sample3 = '68301010003,นาย,อาทิตย์,ยอดเยี่ยม,แผนกวิชาช่างไฟฟ้ากำลัง,ปวส.2/1 (ช่างไฟฟ้ากำลัง),05/11/2547,0834567890,0876543210';
  
  const csvContent = '\\uFEFF' + [csvHeaders, sample1, sample2, sample3].join('\\r\\n'); // BOM for Thai in Excel
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="OnePass_Student_Roster_Template.csv"');
  return res.send(csvContent);
});

// ----------------------------------------------------------------------------
// 2. พรีวิวและตรวจสอบไฟล์นำเข้ารายชื่อนักศึกษา (Admin Validation Preview)
// ----------------------------------------------------------------------------
app.post('/api/admin/import-students-preview', requireAdminAuth, async (req, res) => {
  try {
    const { students } = req.body; // Array of student rows from frontend parser
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่พบรายการข้อมูลนักเรียนในไฟล์' });
    }

    // โหลด departments และ classrooms ทั้งหมดจาก Supabase เพื่อนำมาจับคู่
    let dbDepts = [];
    let dbClasses = [];
    if (supabase) {
      const { data: dData } = await supabase.from('departments').select('id, name, code');
      const { data: cData } = await supabase.from('classrooms').select('id, name, department_id, advisor_name');
      dbDepts = dData || [];
      dbClasses = cData || [];
    }

    // โหลดผู้ใช้ที่มีอยู่แล้วเพื่อตรวจสอบสถานะ
    let existingStudentsMap = new Map();
    if (supabase) {
      const { data: uData } = await supabase.from('users').select('id, username, student_code, full_name, status, classroom_id');
      if (uData) {
        uData.forEach(u => {
          if (u.student_code) existingStudentsMap.set(u.student_code.trim(), u);
          if (u.username) existingStudentsMap.set(u.username.trim(), u);
        });
      }
    }

    const previewRows = [];
    const seenCodesInFile = new Set();
    let validCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const rawCode = String(row.student_code || row.studentCode || row['รหัสนักศึกษา'] || '').trim();
      const title = String(row.title || row['คำนำหน้า'] || '').trim();
      const firstName = String(row.first_name || row.firstName || row['ชื่อ'] || '').trim();
      const lastName = String(row.last_name || row.lastName || row['นามสกุล'] || '').trim();
      const deptNameInput = String(row.department || row.dept || row['แผนกวิชา'] || '').trim();
      const classNameInput = String(row.classroom || row.room || row['ห้องเรียน'] || '').trim();
      const rawBirth = String(row.birth_date || row.birthDate || row['วันเกิด'] || '').trim();
      const phone = String(row.phone || row['เบอร์โทร'] || '').trim();
      const parentPhone = String(row.parent_phone || row.parentPhone || row['เบอร์ผู้ปกครอง'] || '').trim();

      const fullName = \`\${title} \${firstName} \${lastName}\`.trim() || String(row.full_name || row['ชื่อ-นามสกุล'] || '').trim();
      const errors = [];

      // ตรวจสอบรหัสนักศึกษา
      if (!rawCode) {
        errors.push('ไม่มีรหัสนักศึกษา');
      } else if (seenCodesInFile.has(rawCode)) {
        errors.push('รหัสนักศึกษาซ้ำในไฟล์เดียวกัน');
      } else {
        seenCodesInFile.add(rawCode);
      }

      // ตรวจสอบชื่อ
      if (!fullName || fullName.length < 3) {
        errors.push('ชื่อ-นามสกุลไม่ครบถ้วน');
      }

      // ตรวจสอบและแปลงวันเกิด
      const birthDateIso = parseThaiBirthDateToIso(rawBirth);
      if (!birthDateIso) {
        errors.push('วันเกิดไม่ถูกต้อง (รูปแบบที่แนะนำ: วว/ดด/ปปปป เช่น 15/08/2549)');
      }

      // จับคู่แผนกวิชา
      let matchedDept = null;
      if (deptNameInput) {
        matchedDept = dbDepts.find(d => 
          d.name.includes(deptNameInput) || deptNameInput.includes(d.name) || d.code.toLowerCase() === deptNameInput.toLowerCase()
        );
      }
      if (!matchedDept && deptNameInput) {
        errors.push(\`ไม่พบแผนกวิชา "\${deptNameInput}" ในระบบ\`);
      }

      // จับคู่ห้องเรียน (Single Source of Truth)
      let matchedClass = null;
      if (classNameInput) {
        matchedClass = dbClasses.find(c => 
          c.name.includes(classNameInput) || classNameInput.includes(c.name)
        );
      }
      if (!matchedClass && matchedDept) {
        // หาห้องแรกของแผนกเป็น fallback
        matchedClass = dbClasses.find(c => c.department_id === matchedDept.id);
      }

      // ตรวจสอบกับข้อมูลเดิมในระบบ
      let statusType = 'new'; // 'new' | 'update_pending' | 'already_active'
      const existing = existingStudentsMap.get(rawCode);
      if (existing) {
        if (existing.status === 'active') {
          statusType = 'already_active';
          errors.push('บัญชีนี้เปิดใช้งานแล้วในระบบ (ข้ามการอัปเดตรหัสผ่าน)');
        } else {
          statusType = 'update_pending';
        }
      }

      if (errors.length > 0) {
        errorCount++;
      } else if (statusType === 'update_pending') {
        conflictCount++;
      } else {
        validCount++;
      }

      previewRows.push({
        rowNumber: i + 1,
        studentCode: rawCode,
        fullName,
        deptId: matchedDept ? matchedDept.id : null,
        deptName: matchedDept ? matchedDept.name : deptNameInput,
        classroomId: matchedClass ? matchedClass.id : null,
        classroomName: matchedClass ? matchedClass.name : classNameInput,
        advisorName: matchedClass ? matchedClass.advisor_name : null,
        birthDate: birthDateIso,
        rawBirthDate: rawBirth,
        phone,
        parentPhone,
        statusType,
        isValid: errors.length === 0,
        errors
      });
    }

    res.json({
      success: true,
      summary: {
        total: previewRows.length,
        validCount,
        conflictCount,
        errorCount
      },
      rows: previewRows,
      availableDepartments: dbDepts,
      availableClassrooms: dbClasses
    });
  } catch (err) {
    console.error('import-students-preview error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบไฟล์: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. บันทึกรายชื่อนักศึกษาลงฐานข้อมูลจริง (Commit Roster Import with Audit Log)
// ----------------------------------------------------------------------------
app.post('/api/admin/import-students-commit', requireAdminAuth, async (req, res) => {
  try {
    const { rows, fileName, updateExistingPending } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่มีรายการข้อมูลที่ต้องบันทึก' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'ไม่ได้เชื่อมต่อ Supabase Database' });
    }

    let successCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const errorDetails = [];

    for (const r of rows) {
      if (!r.isValid || !r.studentCode) {
        failedCount++;
        errorDetails.push({ code: r.studentCode, error: r.errors?.join(', ') || 'ข้อมูลไม่สมบูรณ์' });
        continue;
      }

      try {
        // ตรวจสอบว่ามีอยู่แล้วหรือไม่
        const { data: exist } = await supabase
          .from('users')
          .select('id, username, status')
          .or(\`username.eq.\${r.studentCode},student_code.eq.\${r.studentCode}\`)
          .maybeSingle();

        if (exist) {
          if (exist.status === 'active') {
            // ไม่แตะต้องบัญชีที่ active แล้ว
            failedCount++;
            errorDetails.push({ code: r.studentCode, error: 'บัญชีเปิดใช้งานแล้ว ข้ามการบันทึก' });
            continue;
          }

          if (updateExistingPending) {
            // อัปเดตข้อมูลบัญชีที่ยังไม่เปิดใช้งาน
            const { error: upErr } = await supabase
              .from('users')
              .update({
                full_name: r.fullName,
                department_id: r.deptId,
                classroom_id: r.classroomId,
                advisor_name: r.advisorName,
                birth_date: r.birthDate,
                phone: r.phone || null,
                parent_phone: r.parentPhone || null,
                status: 'pending_activation'
              })
              .eq('id', exist.id);

            if (upErr) throw upErr;
            updatedCount++;
          } else {
            failedCount++;
            errorDetails.push({ code: r.studentCode, error: 'มีข้อมูลเดิมแล้ว (ข้ามตามตัวเลือก)' });
          }
        } else {
          // เพิ่มนักเรียนใหม่ สถานะ pending_activation
          const { error: insErr } = await supabase
            .from('users')
            .insert([{
              username: r.studentCode,
              student_code: r.studentCode,
              password: '', // ยังไม่มีรหัสผ่าน
              password_hash: null,
              full_name: r.fullName,
              role: 'student',
              department_id: r.deptId,
              classroom_id: r.classroomId,
              advisor_name: r.advisorName,
              birth_date: r.birthDate,
              phone: r.phone || null,
              parent_phone: r.parentPhone || null,
              college: 'วิทยาลัยการอาชีพองครักษ์',
              status: 'pending_activation',
              failed_attempts: 0
            }]);

          if (insErr) throw insErr;
          successCount++;
        }
      } catch (rowErr) {
        failedCount++;
        errorDetails.push({ code: r.studentCode, error: rowErr.message });
      }
    }

    // บันทึก Audit Log ลงตาราง student_import_logs (ข้อกำหนด 10)
    try {
      await supabase.from('student_import_logs').insert([{
        admin_id: req.adminUser.id || null,
        admin_username: req.adminUser.username || 'admin',
        file_name: fileName || 'Imported_File.xlsx',
        total_rows: rows.length,
        success_rows: successCount,
        updated_rows: updatedCount,
        failed_rows: failedCount,
        error_summary: errorDetails
      }]);
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr.message);
    }

    res.json({
      success: true,
      message: \`บันทึกข้อมูลเรียบร้อย: เพิ่มใหม่ \${successCount} รายการ, อัปเดต \${updatedCount} รายการ, ล้มเหลว/ข้าม \${failedCount} รายการ\`,
      stats: { total: rows.length, successCount, updatedCount, failedCount }
    });
  } catch (err) {
    console.error('import-students-commit error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. นักเรียนยืนยันตัวตนเพื่อเปิดใช้งานบัญชี (Step 1: Verify Student Code + Birthdate)
// ----------------------------------------------------------------------------
app.post('/api/auth/verify-student', async (req, res) => {
  if (!checkIpRateLimit(req, res)) return;

  const { studentCode, birthDate } = req.body;
  const genericErrMsg = 'รหัสนักศึกษาหรือวันเดือนปีเกิดไม่ถูกต้อง หรือบัญชีนี้ไม่สามารถดำเนินการได้ในขณะนี้';

  if (!studentCode || !birthDate) {
    return res.status(400).json({ success: false, message: genericErrMsg });
  }

  const cleanCode = String(studentCode).trim();
  const isoBirth = parseThaiBirthDateToIso(birthDate);

  if (!isoBirth) {
    return res.status(400).json({ success: false, message: genericErrMsg });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, message: 'ระบบฐานข้อมูลไม่พร้อมใช้งานชั่วคราว' });
  }

  try {
    // ดึงข้อมูลนักเรียนจาก Supabase
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, username, student_code, full_name, birth_date, status, failed_attempts, locked_until, classroom_id, department_id, classrooms(name, advisor_name), departments(name)')
      .or(\`username.eq.\${cleanCode},student_code.eq.\${cleanCode}\`)
      .maybeSingle();

    if (userErr || !user) {
      return res.status(400).json({ success: false, message: genericErrMsg });
    }

    // ตรวจสอบการถูกล็อกชั่วคราว (Account-level Lockout)
    const now = new Date();
    if (user.locked_until && new Date(user.locked_until) > now) {
      const waitMins = Math.ceil((new Date(user.locked_until) - now) / 60000);
      return res.status(403).json({
        success: false,
        message: \`บัญชีนี้ถูกระงับการยืนยันตัวตนชั่วคราวเนื่องจากกรอกข้อมูลผิดหลายครั้ง กรุณารออีก \${waitMins} นาที หรือติดต่ออาจารย์ที่ปรึกษา\`
      });
    }

    // ถ้ารหัสนี้เปิดใช้งานแล้ว (status == active)
    if (user.status === 'active') {
      return res.status(400).json({
        success: false,
        isAlreadyActive: true,
        message: 'รหัสนักศึกษานี้ได้เปิดใช้งานบัญชีไปแล้ว กรุณาเข้าสู่ระบบ หรือใช้เมนูลืมรหัสผ่าน'
      });
    }

    // ตรวจสอบวันเกิด (เทียบแบบ ISO YYYY-MM-DD)
    const userBirthStr = user.birth_date ? String(user.birth_date).slice(0, 10) : '';
    if (!userBirthStr || userBirthStr !== isoBirth) {
      // กรอกผิด: เพิ่ม failed_attempts
      const newAttempts = (user.failed_attempts || 0) + 1;
      let newLockedUntil = null;
      if (newAttempts >= 5) {
        newLockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // ล็อก 15 นาที
      }

      await supabase
        .from('users')
        .update({ failed_attempts: newAttempts, locked_until: newLockedUntil })
        .eq('id', user.id);

      return res.status(400).json({ success: false, message: genericErrMsg });
    }

    // ยืนยันตัวตนถูกต้อง: รีเซ็ต failed_attempts
    await supabase
      .from('users')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('id', user.id);

    // ออก Temporary Token อายุสั้น 15 นาที (ข้อกำหนด 6)
    const activationToken = jwt.sign(
      {
        userId: user.id,
        studentCode: user.student_code || user.username,
        purpose: 'student_activation'
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // ส่งข้อมูลแบบปิดบังบางส่วน (Masked) และล็อกชั้นปี
    const maskedName = maskStudentName(user.full_name);
    const deptName = user.departments?.name || 'แผนกวิชาช่างยนต์';
    const classroomName = user.classrooms?.name || 'ปวช.3/1';
    const advisorName = user.classrooms?.advisor_name || user.advisor_name || '-';

    res.json({
      success: true,
      activationToken,
      student: {
        maskedName,
        studentCode: user.student_code || user.username,
        department: deptName,
        classroom: classroomName,
        advisor: advisorName
      }
    });
  } catch (err) {
    console.error('verify-student error:', err);
    res.status(500).json({ success: false, message: genericErrMsg });
  }
});

// ----------------------------------------------------------------------------
// 5. นักเรียนตั้งรหัสผ่านใหม่และเปิดใช้งานบัญชีจริง (Step 2: Activate Student Account)
// ----------------------------------------------------------------------------
app.post('/api/auth/activate-student', async (req, res) => {
  if (!checkIpRateLimit(req, res)) return;

  const { activationToken, newPassword, phone, parentPhone, plateNo } = req.body;
  if (!activationToken || !newPassword) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผ่านใหม่' });
  }

  // ตรวจสอบความยาวรหัสผ่านอย่างน้อย 8 ตัวอักษร
  const cleanPass = String(newPassword).trim();
  if (cleanPass.length < 8) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
  }

  // ตรวจสอบความถูกต้องของ Activation Token
  let decoded = null;
  try {
    decoded = jwt.verify(activationToken, JWT_SECRET);
    if (!decoded || decoded.purpose !== 'student_activation') {
      return res.status(401).json({ success: false, message: 'โทเคนยืนยันตัวตนไม่ถูกต้องหรือหมดอายุ กรุณายืนยันตัวตนใหม่อีกครั้ง' });
    }
  } catch (err) {
    return res.status(401).json({ success: false, message: 'โทเคนหมดอายุ กรุณายืนยันตัวตนใหม่อีกครั้ง' });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, message: 'ระบบฐานข้อมูลไม่พร้อมใช้งาน' });
  }

  try {
    // Hash รหัสผ่านด้วย Bcrypt 10 รอบ
    const passwordHash = await hashPassword(cleanPass);

    // อัปเดตรหัสผ่านและเปลี่ยนสถานะเป็น active
    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update({
        password: passwordHash,
        password_hash: passwordHash,
        phone: phone ? String(phone).trim() : null,
        parent_phone: parentPhone ? String(parentPhone).trim() : null,
        plate_no: plateNo ? String(plateNo).trim() : null,
        status: 'active',
        activated_at: new Date().toISOString(),
        failed_attempts: 0,
        locked_until: null,
        must_change_password: false
      })
      .eq('id', decoded.userId)
      .select('*, classrooms(name, advisor_name), departments(name)')
      .single();

    if (updateErr || !updatedUser) {
      throw updateErr || new Error('Update user failed');
    }

    // ออก Official Login Token เข้าสู่ระบบได้ทันที
    const loginUser = sanitizeUser({
      ...updatedUser,
      dept: updatedUser.departments?.name || 'แผนกวิชาช่างยนต์',
      classroom: updatedUser.classrooms?.name || 'ปวช.3/1',
      advisor: updatedUser.classrooms?.advisor_name || updatedUser.advisor_name
    });

    const token = generateToken(loginUser);

    console.log(\`🎉 [ACTIVATION] Student \${loginUser.username} successfully activated their account.\`);

    res.json({
      success: true,
      message: 'เปิดใช้งานบัญชีเรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่ระบบ OnePass',
      token,
      user: loginUser
    });
  } catch (err) {
    console.error('activate-student error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเปิดใช้งานบัญชี: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. นักเรียนขอเปิดบัญชีแบบ "รอยืนยัน" (กรณีไม่มีชื่อในรายชื่อ Excel ตามข้อกำหนด 7)
// ----------------------------------------------------------------------------
app.post('/api/auth/request-pending-account', async (req, res) => {
  if (!checkIpRateLimit(req, res)) return;

  const { studentCode, fullName, departmentId, classroomId, birthDate, phone, parentPhone, note } = req.body;
  if (!studentCode || !fullName || !departmentId) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, message: 'ระบบฐานข้อมูลไม่พร้อมใช้งาน' });
  }

  try {
    const cleanCode = String(studentCode).trim();
    // ตรวจสอบว่ามีรหัสนี้อยู่แล้วหรือไม่
    const { data: exist } = await supabase
      .from('users')
      .select('id, status')
      .or(\`username.eq.\${cleanCode},student_code.eq.\${cleanCode}\`)
      .maybeSingle();

    if (exist) {
      return res.status(400).json({ success: false, message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว' });
    }

    const isoBirth = parseThaiBirthDateToIso(birthDate);

    // บันทึกสถานะ pending_approval
    const { error: insErr } = await supabase.from('users').insert([{
      username: cleanCode,
      student_code: cleanCode,
      password: '',
      full_name: String(fullName).trim(),
      role: 'student',
      department_id: parseInt(departmentId, 10),
      classroom_id: classroomId ? parseInt(classroomId, 10) : null,
      birth_date: isoBirth,
      phone: phone || null,
      parent_phone: parentPhone || null,
      status: 'pending_approval',
      college: 'วิทยาลัยการอาชีพองครักษ์'
    }]);

    if (insErr) throw insErr;

    res.json({
      success: true,
      message: 'ยื่นคำขอลงทะเบียนเรียบร้อยแล้ว กรุณาติดต่ออาจารย์ที่ปรึกษาหรือแอดมินเพื่อตรวจสอบและอนุมัติบัญชี'
    });
  } catch (err) {
    console.error('request-pending-account error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. ครูที่ปรึกษา/แอดมิน ดูและอนุมัติบัญชีที่รอยืนยัน (ข้อกำหนด 9)
// ----------------------------------------------------------------------------
app.get('/api/admin/pending-approvals', requireApproverOrAdminAuth, async (req, res) => {
  if (!supabase) return res.json({ success: true, students: [] });
  try {
    let query = supabase
      .from('users')
      .select('id, student_code, full_name, role, department_id, classroom_id, phone, parent_phone, created_at, departments(name), classrooms(name, advisor_name)')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    // ถ้าเป็นครูที่ปรึกษา ให้ดูเฉพาะห้องที่ตัวเองเป็นที่ปรึกษา
    if (req.authUser.role === 'advisor' && req.authUser.classroom_id) {
      query = query.eq('classroom_id', req.authUser.classroom_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, students: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/approve-pending-student', requireApproverOrAdminAuth, async (req, res) => {
  const { studentId, action, reason } = req.body; // action: 'approve' | 'reject'
  if (!studentId || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'ข้อมูลคำสั่งไม่ถูกต้อง' });
  }

  if (!supabase) return res.status(500).json({ success: false, message: 'ฐานข้อมูลไม่พร้อมใช้งาน' });

  try {
    if (action === 'approve') {
      // อนุมัติ: ให้เป็น pending_activation เพื่อให้นักเรียนตั้งรหัสผ่านเอง
      await supabase
        .from('users')
        .update({ status: 'pending_activation' })
        .eq('id', studentId);
      res.json({ success: true, message: 'อนุมัติบัญชีนักเรียนเรียบร้อยแล้ว (นักเรียนสามารถยืนยันตัวตนและตั้งรหัสผ่านได้แล้ว)' });
    } else {
      // ปฏิเสธ: ลบหรือระงับ
      await supabase
        .from('users')
        .delete()
        .eq('id', studentId);
      res.json({ success: true, message: 'ปฏิเสธและลบคำขอเรียบร้อยแล้ว' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------------------------------
// 8. ดึงประวัติ Audit Logs การนำเข้าไฟล์ (สำหรับหน้าจอ Admin)
// ----------------------------------------------------------------------------
app.get('/api/admin/import-logs', requireAdminAuth, async (req, res) => {
  if (!supabase) return res.json({ success: true, logs: [] });
  try {
    const { data, error } = await supabase
      .from('student_import_logs')
      .select('*')
      .order('imported_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ success: true, logs: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
`;

  // Insert before app.listen
  const listenMarker = "app.listen(PORT, () => {";
  if (!serverCode.includes(listenMarker)) {
    console.error('Marker not found!');
    return false;
  }

  serverCode = serverCode.replace(listenMarker, activationEndpointsCode + '\n' + listenMarker);
  fs.writeFileSync(filePath, serverCode, 'utf8');
  console.log('Successfully added Activation Module to:', filePath);

  // Sync to SSS
  const sssPath = 'C:/Users/Admin/Desktop/SSS/smart-gate/server.js';
  fs.writeFileSync(sssPath, serverCode, 'utf8');
  console.log('Successfully synced to:', sssPath);
  return true;
}

buildBackendActivationPatch();
