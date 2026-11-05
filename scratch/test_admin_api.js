require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'onepass_jwt_secret_key_2026_smartgate_secure_token';

const token = jwt.sign({ id: 'admin', username: 'admin', role: 'admin' }, JWT_SECRET);

fetch('http://localhost:3000/api/admin/users', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  const users = data.users || [];
  console.log('Total users:', users.length);
  const advisors = users.filter(u => u.role === 'advisor');
  console.log('Advisors count:', advisors.length);
  console.log('Advisors list:', advisors.map(u => ({ username: u.username, full_name: u.full_name, dept: u.dept, classroom: u.classroom })));
})
.catch(err => console.error(err));
