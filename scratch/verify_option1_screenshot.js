const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('C:/Users/Admin/Desktop/proj/smart-gate/node_modules/ws');
const fs = require('fs');

async function testScreenshot() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9228',
    '--user-data-dir=C:/Users/Admin/Desktop/proj/smart-gate/scratch/chrome_verify_pos',
    '--window-size=390,844',
    'http://localhost:3000'
  ]);
  await new Promise(r => setTimeout(r, 2500));
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9228/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `
      (async function() {
        fillRoleCredentials('student');
        await handleLoginSubmit({ preventDefault: () => {} });
        setViewMode('profile');
      })()
    `,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  const shotPath = 'C:/Users/Admin/.gemini/antigravity/brain/6f44534c-30bc-4dac-98ef-aff24bac21dd/profile_option1_exact.png';
  fs.writeFileSync(shotPath, buffer);
  console.log('Verified screenshot saved:', shotPath);

  ws.close();
  chrome.kill();
}
testScreenshot().catch(console.error);
