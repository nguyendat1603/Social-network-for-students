const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function harness(dev, initialDemo = false) {
  const session = new Map(initialDemo ? [['campus_dev_demo', 'active']] : []);
  const real = new Map([['mxh_hssv_access_token', 'existing-real-session']]);
  const storage = values => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) });
  const cache = new Map();
  const calls = [];
  const events = [];
  const src = path.resolve(__dirname, '../src');
  function load(file) {
    file = path.resolve(src, file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = readFileSync(file, 'utf8').replaceAll('import.meta.env.DEV', String(dev));
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
      exports, sessionStorage: storage(session), localStorage: storage(real), URL, btoa, structuredClone, Event,
      window: { dispatchEvent: event => events.push(event.type) },
      fetch: async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ success: true, data: { source: 'real-api' } }) };
      },
      require: name => {
        if (name === 'zustand') return require('zustand');
        if (name.endsWith('config/api.config')) return { API_CONFIG: { baseUrl: 'https://backend.invalid/api/v1' } };
        return load(path.relative(src, path.resolve(path.dirname(file), `${name}.ts`)));
      },
    });
    return exports;
  }
  return { load, session, real, calls, events };
}

test('Dev accepts only 4444, persists per-tab demo, never changes real authentication', () => {
  const h = harness(true);
  const { useDemoStore, isDemoMode } = h.load('demo/demo.store.ts');
  assert.equal(useDemoStore.getState().enter('1234'), false);
  assert.equal(isDemoMode(), false);
  assert.equal(useDemoStore.getState().enter('4444'), true);
  assert.equal(isDemoMode(), true);
  assert.equal(h.real.get('mxh_hssv_access_token'), 'existing-real-session');
  assert.equal(h.real.size, 1);
  useDemoStore.getState().exit();
  assert.equal(isDemoMode(), false);
  assert.equal(h.real.get('mxh_hssv_access_token'), 'existing-real-session');
});

test('Demo reads only isolated fixtures; every write and unknown endpoint is rejected without fetch', async () => {
  const h = harness(true, true);
  const { apiRequest } = h.load('services/api.client.ts');
  const posts = await apiRequest('/feed');
  assert.equal(posts[0].id, 'demo-post');
  posts[0].title = 'mutated by consumer';
  assert.notEqual((await apiRequest('/feed'))[0].title, 'mutated by consumer');
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'post']) {
    await assert.rejects(apiRequest('/feed/posts', { method, body: '{}' }), /đăng nhập thật/);
  }
  await assert.rejects(apiRequest('/moderation/admin/queue'), /chưa có dữ liệu demo/);
  assert.equal(h.calls.length, 0);
  assert.equal(h.events.length, 5);
});

test('Real API path remains unchanged outside demo, including login and Authorization header', async () => {
  const h = harness(true);
  const { identityService } = h.load('services/identity.service.ts');
  await identityService.login('student@example.edu', 'test-password');
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].url, 'https://backend.invalid/api/v1/identity/login');
  assert.equal(h.calls[0].options.method, 'POST');
  assert.equal(h.calls[0].options.headers.Authorization, 'Bearer existing-real-session');
  assert.deepEqual(JSON.parse(h.calls[0].options.body), { email: 'student@example.edu', password: 'test-password' });
});

test('Production rejects 4444 and forged demo storage, always uses the existing API path', async () => {
  const h = harness(false, true);
  const { useDemoStore, isDemoMode } = h.load('demo/demo.store.ts');
  assert.equal(useDemoStore.getState().active, false);
  assert.equal(useDemoStore.getState().enter('4444'), false);
  assert.equal(isDemoMode(), false);
  const { apiRequest } = h.load('services/api.client.ts');
  assert.equal((await apiRequest('/feed')).source, 'real-api');
  assert.equal(h.calls.length, 1);
});
