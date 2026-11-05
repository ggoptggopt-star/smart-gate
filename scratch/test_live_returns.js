require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'onepass_jwt_secret_key_2026_smartgate_secure_token';

const token = jwt.sign({ id: 'discipline', username: 'discipline', role: 'discipline_head' }, JWT_SECRET);

fetch('http://localhost:3000/api/gate/discipline/live-returns', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Live Returns Response:');
  console.log('Counts:', data.counts);
  console.log('Dismissal Time:', data.dismissalTime);
})
.catch(err => console.error(err));
