const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('C:/Users/Admin/Desktop/proj/smart-gate/node_modules/ws');

async function run() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9224',
    '--user-data-dir=C:/Users/Admin/Desktop/proj/smart-gate/scratch/chrome_profile3',
    '--window-size=390,844',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9224/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
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
  });

  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 3000));

  // Click #btn-welcome-login
  const click1 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-welcome-login');
        btn.click();
        return {
          welcomeHidden: document.getElementById('auth-view-welcome').classList.contains('hidden'),
          loginHidden: document.getElementById('auth-view-login').classList.contains('hidden'),
          currentAuthView: window.currentAuthView
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After click #btn-welcome-login:', click1.result.value);

  await new Promise(r => setTimeout(r, 2000));

  const checkAfter2s = await send('Runtime.evaluate', {
    expression: `
      (function() {
        return {
          welcomeHidden: document.getElementById('auth-view-welcome').classList.contains('hidden'),
          loginHidden: document.getElementById('auth-view-login').classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After 2s:', checkAfter2s.result.value);

  // Now test fillRoleCredentials('student') and submit login
  const loginTest = await send('Runtime.evaluate', {
    expression: `
      (async function() {
        fillRoleCredentials('student');
        await handleLoginSubmit({ preventDefault: () => {} });
        return {
          loggedIn: localStorage.getItem('onepass_logged_in'),
          authHidden: document.getElementById('screen-auth').classList.contains('hidden'),
          appShellHidden: document.getElementById('app-shell').classList.contains('hidden')
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('After login student:', loginTest.result ? loginTest.result.value : loginTest);

  ws.close();
  chrome.kill();
}

run().catch(console.error);
