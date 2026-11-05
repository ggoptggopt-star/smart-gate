const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('C:/Users/Admin/Desktop/proj/smart-gate/node_modules/ws');

async function run() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:/Users/Admin/Desktop/proj/smart-gate/scratch/chrome_profile2',
    '--window-size=390,844',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  console.log('Targets:', targets.map(t => ({ type: t.type, url: t.url, title: t.title })));
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || targets.find(t => t.type === 'page');

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
  await new Promise(r => setTimeout(r, 4000));

  const info = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-welcome-login');
        const rect = btn ? btn.getBoundingClientRect() : null;
        const cx = rect ? rect.left + rect.width / 2 : 195;
        const cy = rect ? rect.top + rect.height / 2 : 650;
        const topEl = document.elementFromPoint(cx, cy);
        return {
          url: location.href,
          title: document.title,
          readyState: document.readyState,
          hasBtn: !!btn,
          rect,
          topElTag: topEl ? topEl.tagName : null,
          topElId: topEl ? topEl.id : null,
          topElClass: topEl ? topEl.className : null,
          topElOuter: topEl ? topEl.outerHTML.slice(0, 300) : null,
          bodyClasses: document.body ? document.body.className : null,
          bodyChildren: document.body ? Array.from(document.body.children).map(c => ({ tag: c.tagName, id: c.id, className: c.className, display: getComputedStyle(c).display, pos: getComputedStyle(c).position, zIndex: getComputedStyle(c).zIndex })) : []
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Page info:', JSON.stringify(info, null, 2));

  ws.close();
  chrome.kill();
}

run().catch(console.error);
