// Optional browser smoke test using installed Chrome and Node 22; no extra packages.
// API fixtures and the isolated auth session exist ONLY in this test browser.
// Usage: node tests/campus-shell.browser.cjs http://127.0.0.1:5175
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const baseUrl = process.argv[2] || 'http://127.0.0.1:5175';
const regressions = process.argv[3] === 'regressions';
const allRoutes = process.argv[3] === 'all-routes' || regressions;
const demoTest = allRoutes ? undefined : process.argv[3]; // demo-dev or demo-prod (use a Vite preview URL)
const artifacts = path.join(process.env.LOCALAPPDATA, 'Temp', 'opencode', `campus-shell-${Date.now()}-${process.pid}`);
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
  const ts = require('typescript');
  const vm = require('node:vm');
  const fixtureExports = {};
  vm.runInNewContext(ts.transpileModule(require('node:fs').readFileSync(path.join(__dirname, '../src/demo/demo.fixtures.ts'), 'utf8').replaceAll('import.meta.env.DEV', 'true'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: fixtureExports, URL, btoa, structuredClone });
  const profile = { userId: 'browser-test', fullName: 'Browser QA Student', email: 'qa@sis.hust.edu.vn', role: 'ADMIN', isVerifiedStudent: true, karmaPoints: 10, skills: [], faculty: null, facultyId: null, anonymousHandle: 'qa-student', studentCode: '20260001' };
  let rejectWrites = false;
  let catalogMode = 'normal';
  const exceptions = [];
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
    } else if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails);
    } else if (message.method === 'Network.requestWillBeSent') {
      networkRequests.push(message.params.request);
    } else if (message.method === 'Fetch.requestPaused') {
      const { request, requestId } = message.params;
      const pathname = new URL(request.url).pathname;
      requestUrls.push(request.url);
      let data = [];
      if (pathname.endsWith('/identity/catalog')) data = { faculties: [], courses: [] };
      if (pathname.endsWith('/communication/notifications')) data = { items: [], unreadCount: 2 };
      if (allRoutes) {
        try { data = fixtureExports.demoRead(pathname.replace('/api/v1', '') + new URL(request.url).search); } catch { data = []; }
        if (pathname.endsWith('/identity/profile/me')) data = profile;
        if (pathname.endsWith('/marketplace/items')) data = [{ id: 'qa-item', seller_id: 'qa-seller', title: 'QA textbook listing', description: 'Browser test fixture only', category: 'TEXTBOOK', price_vnd: 50000, is_free: false, condition: 'USED_GOOD', status: 'AVAILABLE', created_at: '2026-11-12T08:00:00Z', seller: { id: 'qa-seller', full_name: 'QA Seller', is_verified_student: true }, images: [] }];
        if (pathname.endsWith('/marketplace/housing')) data = [{ id: 'qa-room', poster_id: 'qa-poster', listing_type: 'ROOMMATE_WANTED', title: 'QA housing listing', description: 'Browser test fixture only', address_district: 'QA district', distance_to_campus_km: 1, monthly_rent_vnd: 2000000, sleep_schedule: 'FLEXIBLE', smoking_allowed: false, cooking_allowed: true, gender_preference: 'ANY', status: 'OPEN', created_at: '2026-11-12T08:00:00Z', poster: { id: 'qa-poster', full_name: 'QA Poster', is_verified_student: true } }];
      }
      if (regressions) {
        if (pathname.endsWith('/identity/catalog') && catalogMode === 'empty') data = { faculties: [], courses: [] };
        if (pathname.endsWith('/communication/conversations')) data = ['A','B'].map(id => ({id, type:'DIRECT', created_at:'2026-11-12T08:00:00Z', last_message_at:'2026-11-12T08:00:00Z', participants:[{user_id:'peer-'+id,user:{id:'peer-'+id,full_name:'Peer '+id}}]}));
        if (pathname.endsWith('/A/messages') || pathname.endsWith('/B/messages')) { const id = pathname.split('/').at(-2); data = [{id:'msg-'+id, conversation_id:id, sender_id:'peer-'+id, message_type:'TEXT', content:'Private message '+id, created_at:'2026-11-12T08:00:00Z', sender:{full_name:'Peer '+id}}]; }
      }
      const rejected = (regressions && (
        (catalogMode === 'error' && pathname.endsWith('/identity/catalog')) ||
        (catalogMode === 'hierarchy-error' && pathname.endsWith('/resources/hierarchy')) ||
        (catalogMode === 'resource-error' && pathname.endsWith('/resources')) ||
        (catalogMode === 'group-error' && pathname.endsWith('/study-groups'))
      )) || rejectWrites && !['GET', 'OPTIONS'].includes(request.method);
      void send('Fetch.fulfillRequest', {
        requestId, responseCode: rejected ? 500 : 200,
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, PUT, DELETE, OPTIONS' },
        ],
        body: Buffer.from(JSON.stringify(rejected ? { success: false, data: null, error: { message: 'QA write rejected' } } : { success: true, data, meta: null, error: null })).toString('base64'),
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
    let authScript;
    if (!demoTest) authScript = await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      if (location.origin === new URL(${JSON.stringify(baseUrl)}).origin && !localStorage.getItem('mxh_hssv_access_token')) {
        localStorage.setItem('mxh_hssv_access_token', 'browser-test-only');
        localStorage.setItem('mxh_hssv_user', JSON.stringify({ userId: 'browser-test', fullName: 'Kiểm thử giao diện', role: ${allRoutes ? "'ADMIN'" : "'VERIFIED_STUDENT'"}, isVerifiedStudent: true, karmaPoints: 0, skills: [] }));
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
    if (regressions) {
      await require('./campus-ux-regressions.browser.cjs')({ send, evaluate, until, baseUrl, assert, artifacts, setCatalogMode: value => { catalogMode = value; } });
      assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
      return;
    }
    if (allRoutes) {
      const routes = ['/feed', '/feed/department', '/feed/course?code=IT3080', '/feed/posts/demo-post', '/course-reviews', '/course-reviews/IT3080', '/course-reviews/forum?courseCode=IT3080', '/resources?code=IT3080', '/resources/demo-document', '/study-groups?code=IT3080', '/study-groups/demo-group/workspace', '/marketplace', '/marketplace/housing', '/messenger?convId=demo-conversation', '/notifications', '/karma', '/profile', '/admin/moderation', '/login', '/register-edu', '/verify-otp'];
      for (const width of [1440, 390]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 810 });
        for (let index = 0; index < routes.length; index++) {
          const route = routes[index];
          await send('Page.navigate', { url: baseUrl + route });
          await until(`!!document.querySelector('h1,h2')`);
          await new Promise(resolve => setTimeout(resolve, 300));
          assert.equal(await evaluate(`location.pathname`), route.split('?')[0]);
          assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth + 1`), false, `Overflow ${route} ${width}`);
          const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
          writeFileSync(path.join(artifacts, `route-${index}-${width}.png`), Buffer.from(data, 'base64'));
          assert.ok(await evaluate(`document.querySelector('main,.campus-auth')?.getBoundingClientRect().width > 0`), route);
          console.log(`PASS route ${width}px ${route}`);
        }
      }
      // Cross-page course scope and keyboard dialog regression.
      await send('Page.navigate', { url: baseUrl + '/feed/course?code=IT3080' });
      await until(`!!document.querySelector('nav[data-campus-course-tabs]')`);
      assert.equal(await evaluate(`document.querySelector('nav[data-campus-course-tabs] a[aria-current="page"]').textContent.includes('IT3080')`), true);
      await evaluate(`Array.from(document.querySelectorAll('nav[data-campus-course-tabs] a')).find(a => a.getAttribute('href').includes('/resources')).click()`);
      await until(`location.pathname === '/resources' && location.search.includes('IT3080')`);
      await send('Page.navigate', { url: baseUrl + '/feed' });
      await until(`!!document.querySelector('button[data-campus-ask]')`);
      await evaluate(`document.querySelector('button[data-campus-ask]').focus(); document.querySelector('button[data-campus-ask]').click()`);
      await until(`!!document.querySelector('[role="dialog"]')`);
      assert.equal(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
      await evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
      await until(`!document.querySelector('[role="dialog"]')`);
      assert.equal(await evaluate(`document.activeElement.hasAttribute('data-campus-ask')`), true);
      // Existing API integration: a failed send must retain the draft and show no fake success.
      await send('Page.navigate', { url: baseUrl + '/messenger?convId=demo-conversation' });
      await until(`!!document.querySelector('main form input')`);
      rejectWrites = true;
      await evaluate(`(() => { const input = document.querySelector('main form input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'QA retained draft'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      await evaluate(`document.querySelector('main form').requestSubmit()`);
      await until(`document.querySelector('[role="alert"]')?.textContent.includes('QA write rejected')`);
      assert.equal(await evaluate(`document.querySelector('main form input').value`), 'QA retained draft');
      rejectWrites = false;
      await send('Page.navigate', { url: baseUrl + '/oauth/callback' });
      await until(`location.pathname === '/profile'`);
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: authScript.identifier });
      await evaluate(`localStorage.clear()`);
      await send('Page.navigate', { url: baseUrl + '/login' });
      await until(`!!document.querySelector('#login-email')`);
      await evaluate(`localStorage.clear()`);
      await send('Page.navigate', { url: baseUrl + '/oauth/callback' });
      await until(`!!document.querySelector('.campus-auth')`);
      assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_access_token')`), null);
      for (const width of [1440, 390]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 810 });
        assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth + 1`), false);
        const { data } = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path.join(artifacts, `sso-${width}.png`), Buffer.from(data, 'base64'));
      }
      console.log('PASS course scope, modal focus/Escape, failed message draft, SSO callback');
      assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
      console.log(`Screenshots: ${artifacts}`);
      return;
    }
    if (demoTest) {
      await send('Page.navigate', { url: `${baseUrl}/login` });
      await until(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Đăng nhập bằng Mail Trường'))`);
      if (demoTest === 'demo-prod') {
        assert.equal(await evaluate(`!!document.querySelector('#demo-code')`), false);
        await evaluate(`sessionStorage.setItem('campus_dev_demo', 'active')`);
        await send('Page.navigate', { url: `${baseUrl}/feed` });
        await until(`location.pathname === '/login' && Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Đăng nhập bằng Mail Trường'))`);
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
      // The landing page loads the registration catalog before demo is active.
      const demoRequestStart = networkRequests.length;
      await setCode('4444');
      await evaluate(`document.querySelector('#demo-code').closest('form').requestSubmit()`);
      await until(`location.pathname === '/feed' && !!document.querySelector('#campus-main article')`);
      assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_access_token')`), null);
      assert.equal(await evaluate(`localStorage.getItem('mxh_hssv_user')`), null);
      await until(`!!document.querySelector('button[aria-label="Upvote bài viết"]:disabled')`);
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
      assert.equal(networkRequests.slice(demoRequestStart).filter(request => /\/api\/v1\//.test(request.url)).length, 0, 'Demo must never contact backend');
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
    await evaluate(`Array.from(document.querySelectorAll('details button')).find(b => b.textContent.includes('eal identity')).click()`);
    await until(`document.querySelector('details[open]').textContent.includes('nonymous:')`);
    await evaluate(`document.querySelector('details').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    await evaluate(`document.querySelector('button[aria-label="Đặt câu hỏi"]').click()`);
    await until(`Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('Xuất bản Bài viết'))`);
    await evaluate(`Array.from(document.querySelectorAll('form button')).find(b => b.textContent.trim() === '✕').click()`);
    console.log('PASS mobile secondary navigation, Escape/focus restoration, anonymous mode, notification badge');
    console.log('PASS header action opens the existing feed composer');
    await evaluate(`document.querySelector('a[href="/resources"]').click()`);
    await until(`location.pathname === '/resources' && !!document.querySelector('#campus-main')`);
    assert.ok(await evaluate(`!!document.querySelector('main')`));
    console.log('PASS navigation to existing /resources with campus layout');
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
