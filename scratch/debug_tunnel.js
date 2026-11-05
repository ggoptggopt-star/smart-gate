const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('C:/Users/Admin/Desktop/proj/smart-gate/node_modules/ws');

async function run() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:/Users/Admin/Desktop/proj/smart-gate/scratch/chrome_profile_tunnel',
    '--window-size=390,844',
    'https://desktop-wires-terms-garcia.trycloudflare.com'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('trycloudflare.com')) || targets.find(t => t.type === 'page');
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

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('[EXCEPTION]', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
    if (msg.method === 'Log.entryAdded') {
      console.log('[LOG]', msg.params.entry.level, msg.params.entry.text, msg.params.entry.url);
    }
  });

  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'https://desktop-wires-terms-garcia.trycloudflare.com' });
  await new Promise(r => setTimeout(r, 4000));

  const state = await send('Runtime.evaluate', {
    expression: `
      (function() {
        return {
          url: location.href,
          typeofSetAuthView: typeof window.setAuthView,
          typeofHandleLoginSubmit: typeof window.handleLoginSubmit,
          typeofFillRoleCredentials: typeof window.fillRoleCredentials,
          btnExists: !!document.getElementById('btn-welcome-login')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Tunnel page state:', state.result.value);

  ws.close();
  chrome.kill();
}

run().catch(console.error);
