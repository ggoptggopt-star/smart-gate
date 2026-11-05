const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
  getElementById: (id) => ({
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    querySelector: () => null,
    querySelectorAll: () => []
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: { classList: { add: () => {}, remove: () => {}, contains: () => false } }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.sessionStorage = global.localStorage;
global.navigator = { userAgent: 'test', serviceWorker: { register: () => Promise.resolve() } };
global.location = { href: '', search: '', pathname: '/' };
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

try {
  const code = fs.readFileSync('C:/Users/Admin/Desktop/proj/smart-gate/public/app.js', 'utf8');
  eval(code);
  console.log('app.js executed successfully without errors!');
  console.log('typeof setAuthView:', typeof setAuthView);
} catch (e) {
  console.error('Error during app.js execution:', e);
}
