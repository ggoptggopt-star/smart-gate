const https = require('https');
https.get('https://desktop-wires-terms-garcia.trycloudflare.com', (res) => {
  console.log('Tunnel Status:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Has header-settings-btn:', d.includes('header-settings-btn'));
    console.log('Old profile button removed:', !d.includes('btn-open-profile-settings'));
  });
}).on('error', e => console.error(e));
