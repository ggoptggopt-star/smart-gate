const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('C:/Users/Admin/Desktop/proj/smart-gate/node_modules/ws');

async function run() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:/Users/Admin/Desktop/proj/smart-gate/scratch/chrome_profile',
    '--window-size=390,844',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.log('No page target found:', targets);
    chrome.kill();
    return;
  }

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

  // Reload to catch everything from start
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3000));

  // Check what element is at the center of #btn-welcome-login
  const checkRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-welcome-login');
        if (!btn) return { error: 'btn-welcome-login not found' };
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(cx, cy);
        return {
          btnRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          cx, cy,
          topElTag: topEl ? topEl.tagName : null,
          topElId: topEl ? topEl.id : null,
          topElClass: topEl ? topEl.className : null,
          topElOuterHTML: topEl ? topEl.outerHTML.slice(0, 200) : null,
          isBtnOrChild: topEl ? (btn === topEl || btn.contains(topEl)) : false,
          typeofSetAuthView: typeof window.setAuthView,
          authWelcomeHidden: document.getElementById('auth-view-welcome')?.className,
          authLoginHidden: document.getElementById('auth-view-login')?.className
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Element check:', JSON.stringify(checkRes, null, 2));

  // Now simulate clicking the button
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-welcome-login');
        btn.click();
        return {
          afterWelcomeClass: document.getElementById('auth-view-welcome')?.className,
          afterLoginClass: document.getElementById('auth-view-login')?.className
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After click:', JSON.stringify(clickRes, null, 2));

  ws.close();
  chrome.kill();
}

run().catch(console.error);
