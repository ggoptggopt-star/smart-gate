const fs = require('fs');
const html = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/index.html', 'utf8');

const appIdx = html.indexOf('id="home-approver-view"');
const card1Idx = html.indexOf('<!-- 1. กล่องเวลาเข้า-ออก (ระเบียบวิทยาลัย) -->', appIdx);
const card2Idx = html.indexOf('<!-- 2. กล่องตัวกรองระดับชั้น', appIdx);
console.log(html.substring(card1Idx, card2Idx));
