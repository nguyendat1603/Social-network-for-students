// Optional browser smoke test using installed Chrome and Node 22; no extra packages.
// API fixtures and the isolated auth session exist ONLY in this test browser.
// Usage: node tests/campus-shell.browser.cjs http://127.0.0.1:5175
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const baseUrl = process.argv[2] || 'http://127.0.0.1:5175';
const demoTest = process.argv[3]; // demo-dev or demo-prod (use a Vite preview URL)
const artifacts = path.join(process.env.LOCALAPPDATA, 'Temp', 'opencode', `campus-shell-${Date.now()}`);
mkdirSync(artifacts, { recursive: true });
const browser = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
  `--user-data-dir=${path.join(artifacts, 'profile')}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

async function main() {
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome startup timed out')), 20000);
    browser.on('error', reject);
    browser.stderr.on('data', data => {
      const match = data.toString().match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  let sessionId;
  const requestUrls = [];
  const networkRequests = [];
  const send = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (task) { pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
    } else if (message.method === 'Network.requestWillBeSent') {
      networkRequests.push(message.params.request);
    } else if (message.method === 'Fetch.requestPaused') {
      const { request, requestId } = message.params;
      const pathname = new URL(request.url).pathname;
      requestUrls.push(request.url);
      let data = [];
      if (pathname.endsWith('/identity/catalog')) data = { faculties: [], courses: [] };
      if (pathname.endsWith('/communication/notifications')) data = { items: [], unreadCount: 2 };
      void send('Fetch.fulfillRequest', {
        requestId, responseCode: 200,
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, PUT, DELETE, OPTIONS' },
        ],
        body: Buffer.from(JSON.stringify({ success: true, data, meta: null, error: null })).toString('base64'),
      }).catch(console.error);
    }
  };
  try {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    sessionId = (await send('Target.attachToTarget', { targetId, flatten: true })).sessionId;
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    if (!demoTest) await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/v1/*' }] });
    if (!demoTest) await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      if (!localStorage.getItem('mxh_hssv_access_token')) {
        localStorage.setItem('mxh_hssv_access_token', 'browser-test-only');
        localStorage.setItem('mxh_hssv_user', JSON.stringify({ userId: 'browser-test', fullName: 'Kiểm thử giao diện', role: 'VERIFIED_STUDENT', isVerifiedStudent: true, karmaPoints: 0, skills: [] }));
      }
    ` });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const until = async expression => {
      for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error(`Timed out: ${expression}`);
    };
    if (demoTest) {
      await send('Page.navigate', { url: `${baseUrl}/login` });
      await until(`!!document.querySelector('input[type="email"]')`);
      if (demoTest === 'demo-prod') {
        assert.equal(await evaluate(`!!document.querySelector('#demo-code')`), false);
        await evaluate(`sessionStorage.setItem('campus_dev_demo', 'active')`);
        await send('Page.navigate', { url: `${baseUrl}/feed` });
        await until(`location.pathname === '/login' && !!document.querySelector('input[type="email"]')`);
        assert.equal(await evaluate(`!!document.querySelector('[data-demo-banner]')`), false);
        console.log('PASS production hides demo access and rejects forged demo storage');
        return;
      }
      await until(`!!document.querySelector('#demo-code')`);
      const setCode = async code => evaluate(`(() => {
        const input = document.querySelector('#demo-code');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(code)});
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await setCode('1111');
      await evaluate(`document.querySelector('#demo-code').closest('form').requestSubmit()`);
      await until(`!!document.querySelector('#demo-code-error')`);
      assert.equal(await evaluate(`sessionStorage.getItem('campus_dev_demo')`), null);
      await setCode('4444');
      await evaluate(`document.querySelector('#demo-code').closest('form').requestSubmit()`);
      await until(`location.pathname === '/feed' && !!document.querySelector('#campus-main article')`);
      assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_access_token')`), null);
      assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_user')`), null);
      await until(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Upvote') && b.disabled)`);
      console.log('PASS incorrect code rejected; 4444 enters demo with no real auth session');
      const screens = ['/feed/posts/demo-post', '/feed/department', '/feed/course?code=IT3080', '/course-reviews', '/course-reviews/IT3080', '/course-reviews/forum', '/resources', '/resources/demo-document', '/study-groups', '/study-groups/demo-group/workspace', '/marketplace', '/marketplace/housing', '/messenger?convId=demo-conversation', '/notifications', '/karma'];
      for (const route of screens) {
        await send('Page.navigate', { url: `${baseUrl}${route}` });
        await until(route.includes('/posts/') ? `!!document.querySelector('main article')` : route.startsWith('/messenger') ? `document.querySelector('main')?.textContent.includes('Đây là tin nhắn minh họa')` : `!!document.querySelector('main h1')`);
        console.log(`PASS demo screen ${route}`);
      }
      for (const route of ['/profile', '/admin/moderation']) {
        await send('Page.navigate', { url: `${baseUrl}${route}` });
        await until(`document.querySelector('main')?.textContent.includes('Trang này cần đăng nhập thật')`);
        console.log(`PASS demo restricts ${route}`);
      }
      const writeResult = await evaluate(`(async () => {
        const { apiRequest } = await import('/src/services/api.client.ts');
        try { await apiRequest('/feed/posts', { method: 'POST', body: '{}' }); return 'unexpected-success'; }
        catch (error) { return error.message; }
      })()`);
      assert.match(writeResult, /đăng nhập thật/);
      assert.equal(networkRequests.filter(request => /\/api\/v1\//.test(request.url)).length, 0, 'Demo must never contact backend');
      await evaluate(`document.querySelector('[data-demo-banner] button').click()`);
      await until(`location.pathname === '/login' && !!document.querySelector('#demo-code')`);
      assert.equal(await evaluate(`sessionStorage.getItem('campus_dev_demo')`), null);
      console.log('PASS demo persists across navigation; writes blocked; zero backend requests; exit returns to login');
      return;
    }
    await send('Page.navigate', { url: `${baseUrl}/feed` });
    await until(`!!document.querySelector('#campus-main [data-campus-feed-filters]')`);
    await until(`document.querySelector('header').textContent.includes('2')`);
    const expected = ['/feed', '/feed/course', '/resources', '/study-groups', '/feed/department', '/course-reviews', '/course-reviews/forum', '/marketplace', '/marketplace/housing', '/messenger', '/notifications', '/karma', '/profile'];
    const hrefs = await evaluate(`Array.from(document.querySelectorAll('aside[aria-label="Điều hướng chính"] a'), a => a.getAttribute('href'))`);
    expected.forEach(href => assert.ok(hrefs.includes(href), href));
    assert.ok(!hrefs.includes('/admin/moderation'), 'Student must not see admin entry');
    for (const width of [1440, 1330, 1120, 811, 810, 540, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const state = await evaluate(`(() => {
        const visible = selector => getComputedStyle(document.querySelector(selector)).display !== 'none';
        return { overflow: document.documentElement.scrollWidth > innerWidth, sidebar: visible('aside[aria-label="Điều hướng chính"]'), mobile: visible('nav[aria-label="Điều hướng điện thoại"]'), rail: visible('aside[aria-label="Thông tin liên quan"]') };
      })()`);
      assert.equal(state.overflow, false, `Horizontal overflow at ${width}px`);
      assert.equal(state.sidebar, width > 810, `Sidebar at ${width}px`);
      assert.equal(state.mobile, width <= 810, `Mobile nav at ${width}px`);
      assert.equal(state.rail, width > 1120, `Context rail at ${width}px`);
      if (width === 1440 || width === 390) {
        const { data } = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path.join(artifacts, `feed-${width}.png`), Buffer.from(data, 'base64'));
      }
      console.log(`PASS responsive ${width}px`);
    }
    await evaluate(`document.querySelector('[aria-controls="campus-mobile-explore"]').click()`);
    await until(`!!document.querySelector('#campus-mobile-explore')`);
    const mobileHrefs = await evaluate(`Array.from(document.querySelectorAll('#campus-mobile-explore a'), a => a.getAttribute('href'))`);
    expected.slice(4).forEach(href => assert.ok(mobileHrefs.includes(href), href));
    await evaluate(`document.querySelector('#campus-mobile-explore').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    await until(`!document.querySelector('#campus-mobile-explore')`);
    assert.equal(await evaluate(`document.activeElement.getAttribute('aria-controls')`), 'campus-mobile-explore');
    await evaluate(`document.querySelector('summary[aria-label="Tài khoản và chế độ ẩn danh"]').click()`);
    await evaluate(`Array.from(document.querySelectorAll('details button')).find(b => b.textContent.includes('Danh tính thật')).click()`);
    await until(`document.querySelector('details').textContent.includes('Ẩn danh:')`);
    await evaluate(`document.querySelector('details').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    await evaluate(`document.querySelector('button[aria-label="Đặt câu hỏi"]').click()`);
    await until(`Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('Post Engine'))`);
    await evaluate(`Array.from(document.querySelectorAll('form button')).find(b => b.textContent.trim() === '✕').click()`);
    console.log('PASS mobile secondary navigation, Escape/focus restoration, anonymous mode, notification badge');
    console.log('PASS header action opens the existing feed composer');
    await evaluate(`document.querySelector('a[href="/resources"]').click()`);
    await until(`location.pathname === '/resources' && !document.querySelector('#campus-main')`);
    assert.ok(await evaluate(`!!document.querySelector('main')`));
    console.log('PASS navigation to existing /resources with legacy layout');
    await evaluate(`localStorage.setItem('mxh_hssv_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('mxh_hssv_user')), role: 'ADMIN' }))`);
    await send('Page.navigate', { url: `${baseUrl}/feed` });
    await until(`!!document.querySelector('aside a[href="/admin/moderation"]')`);
    await evaluate(`document.querySelector('summary[aria-label="Tài khoản và chế độ ẩn danh"]').click()`);
    await evaluate(`Array.from(document.querySelectorAll('details button')).find(b => b.textContent === 'Đăng xuất').click()`);
    await until(`location.pathname === '/login'`);
    assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_access_token')`), null);
    console.log('PASS admin navigation visibility and existing logout flow');
    assert.ok(requestUrls.some(url => url.includes('/feed')));
    console.log(`Screenshots: ${artifacts}`);
  } finally {
    await send('Browser.close', {}, undefined).catch(() => {});
    socket.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser.kill());
