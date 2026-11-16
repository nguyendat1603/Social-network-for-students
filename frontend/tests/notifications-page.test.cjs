const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Isolated component-logic tests: no DOM, environment files, network or database.
const source = readFileSync(resolve(__dirname, '../src/features/communication/pages/NotificationsPage.tsx'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;

function deferred() {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject; });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
}

function harness({ items = fixtures(), list, mark } = {}) {
  const slots = [];
  const effects = [];
  let cursor = 0;
  let mounted = false;
  const calls = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(fn) { if (!mounted) effects.push(fn); },
  };
  const service = {
    listNotifications: list || (async () => ({ items, unreadCount: items.filter((n) => !n.is_read).length })),
    markNotificationsRead: async (id) => { calls.push(id); return mark ? mark(id) : { updated: true }; },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react-router-dom') return { Link: 'Link' };
      if (name.endsWith('/MainLayout')) return { MainLayout: 'MainLayout' };
      if (name.endsWith('/communication.service')) return { communicationService: service };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const render = () => { cursor = 0; return exports.NotificationsPage(); };
  render();
  mounted = true;
  effects.forEach((fn) => fn());
  return { render, calls };
}

function fixtures() {
  return [
    { id: 'one', title: 'Thông báo một', body: 'Nội dung một', is_read: false, created_at: '2026-11-10T00:00:00Z', reference_url: '/feed/posts/one' },
    { id: 'two', title: 'Thông báo hai', body: 'Nội dung hai', is_read: false, created_at: '2026-11-10T00:00:00Z' },
    { id: 'three', title: 'Thông báo ba', body: 'Nội dung ba', is_read: true, created_at: '2026-11-10T00:00:00Z' },
  ];
}

function nodes(tree) {
  return !tree || typeof tree !== 'object' ? [] : [tree, ...tree.children.flatMap(nodes)];
}
function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  return typeof tree === 'object' ? tree.children.map(text).join('') : String(tree);
}
function button(tree, label) {
  const result = nodes(tree).find((node) => node.type === 'button' && (node.props['aria-label'] === label || text(node) === label));
  assert.ok(result, `Không tìm thấy nút ${label}`);
  return result;
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('Tải, chuyển Tất cả/Chưa đọc và giữ liên kết', async () => {
  const h = harness();
  assert.match(text(h.render()), /Đang tải thông báo/);
  await settle();
  let tree = h.render();
  assert.match(text(tree), /Thông báo ba/);
  assert.equal(nodes(tree).find((n) => n.type === 'Link').props.to, '/feed/posts/one');
  button(tree, 'Chưa đọc').props.onClick();
  tree = h.render();
  assert.doesNotMatch(text(tree), /Thông báo ba/);
  assert.match(text(tree), /Thông báo một/);
  assert.equal(button(tree, 'Chưa đọc').props['aria-pressed'], true);
  button(tree, 'Tất cả').props.onClick();
  assert.match(text(h.render()), /Thông báo ba/);
});

test('Đọc riêng chỉ gửi một ID, giảm bộ đếm sau thành công', async () => {
  const pending = deferred();
  const h = harness({ mark: () => pending.promise });
  await settle();
  const action = button(h.render(), 'Đánh dấu đã đọc: Thông báo một').props.onClick();
  assert.match(text(h.render()), /2 thông báo chưa đọc/);
  pending.resolve({ updated: true });
  await action;
  let tree = h.render();
  assert.deepEqual(h.calls, ['one']);
  assert.match(text(tree), /1 thông báo chưa đọc/);
  button(tree, 'Chưa đọc').props.onClick();
  tree = h.render();
  assert.doesNotMatch(text(tree), /Thông báo một/);
  assert.match(text(tree), /Thông báo hai/);
});

test('Chặn gửi lặp và xung đột đọc riêng/đọc tất cả khi đang chờ', async () => {
  const pending = deferred();
  const h = harness({ mark: () => pending.promise });
  await settle();
  const tree = h.render();
  const first = button(tree, 'Đánh dấu đã đọc: Thông báo một');
  const action = first.props.onClick();
  await first.props.onClick();
  await button(tree, '✓ Đánh dấu tất cả đã đọc (2)').props.onClick();
  assert.deepEqual(h.calls, ['one']);
  assert.equal(button(h.render(), 'Đánh dấu đã đọc: Thông báo hai').props.disabled, true);
  pending.resolve({ updated: true });
  await action;
});

test('Lỗi API không đổi trạng thái và có thể thử lại', async () => {
  let fail = true;
  const h = harness({ mark: async () => { if (fail) throw new Error('Offline'); return { updated: true }; } });
  await settle();
  await button(h.render(), 'Đánh dấu đã đọc: Thông báo một').props.onClick();
  assert.match(text(h.render()), /2 thông báo chưa đọc/);
  assert.ok(nodes(h.render()).some((n) => n.props.role === 'alert'));
  fail = false;
  await button(h.render(), 'Đánh dấu đã đọc: Thông báo một').props.onClick();
  assert.match(text(h.render()), /1 thông báo chưa đọc/);
  assert.ok(!nodes(h.render()).some((n) => n.props.role === 'alert'));
});

test('updated=false không được coi là thành công', async () => {
  const h = harness({ mark: async () => ({ updated: false }) });
  await settle();
  await button(h.render(), 'Đánh dấu đã đọc: Thông báo một').props.onClick();
  assert.match(text(h.render()), /2 thông báo chưa đọc/);
  assert.match(text(h.render()), /Không thể đánh dấu/);
});

test('Đọc tất cả được giữ nguyên, bộ lọc chưa đọc trở thành rỗng', async () => {
  const h = harness();
  await settle();
  await button(h.render(), '✓ Đánh dấu tất cả đã đọc (2)').props.onClick();
  assert.deepEqual(h.calls, [undefined]);
  assert.match(text(h.render()), /0 thông báo chưa đọc/);
  button(h.render(), 'Chưa đọc').props.onClick();
  assert.match(text(h.render()), /Bạn không có thông báo chưa đọc/);
});

test('Lỗi đọc tất cả giữ nguyên các mục chưa đọc', async () => {
  const h = harness({ mark: async () => { throw new Error('Offline'); } });
  await settle();
  await button(h.render(), '✓ Đánh dấu tất cả đã đọc (2)').props.onClick();
  assert.match(text(h.render()), /2 thông báo chưa đọc/);
  assert.ok(button(h.render(), 'Đánh dấu đã đọc: Thông báo hai'));
});

test('Lỗi tải có thông báo và nút tải lại, không báo rỗng giả', async () => {
  let fail = true;
  const h = harness({ list: async () => { if (fail) throw new Error('Offline'); return { items: fixtures(), unreadCount: 2 }; } });
  await settle();
  assert.match(text(h.render()), /Không thể tải thông báo/);
  assert.doesNotMatch(text(h.render()), /Bạn chưa có thông báo/);
  fail = false;
  await button(h.render(), 'Thử lại').props.onClick();
  assert.match(text(h.render()), /Thông báo một/);
});

test('Danh sách rỗng hiển thị thông điệp đúng', async () => {
  const h = harness({ items: [] });
  await settle();
  assert.match(text(h.render()), /Bạn chưa có thông báo mới nào/);
});

test('Bấm liên kết vẫn đánh dấu đúng ID và xử lý lỗi', async () => {
  const h = harness({ mark: async () => { throw new Error('Offline'); } });
  await settle();
  const link = nodes(h.render()).find((n) => n.type === 'Link');
  assert.equal(link.props.to, '/feed/posts/one');
  link.props.onClick();
  await settle();
  assert.deepEqual(h.calls, ['one']);
  assert.match(text(h.render()), /Không thể đánh dấu/);
});

function serviceHarness(apiRequest) {
  const events = [];
  const exports = {};
  const serviceSource = readFileSync(resolve(__dirname, '../src/services/communication.service.ts'), 'utf8');
  const output = ts.transpileModule(serviceSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(output, {
    exports, Event: class { constructor(type) { this.type = type; } },
    window: { dispatchEvent: (event) => events.push(event.type) },
    require(name) {
      assert.equal(name, './api.client');
      return { apiRequest };
    },
  });
  return { ...exports, events };
}

test('Service gửi PATCH theo ID và chỉ báo chuông sau thành công', async () => {
  const pending = deferred();
  const calls = [];
  const h = serviceHarness((...args) => { calls.push(args); return pending.promise; });
  const action = h.communicationService.markNotificationsRead('one');
  assert.equal(h.events.length, 0);
  assert.equal(calls[0][0], '/communication/notifications/read');
  assert.equal(calls[0][1].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0][1].body), { notificationId: 'one' });
  pending.resolve({ updated: true });
  await action;
  assert.deepEqual(h.events, [h.NOTIFICATIONS_READ_EVENT]);
});

test('Service đọc tất cả vẫn gửi đối tượng rỗng', async () => {
  let body;
  const h = serviceHarness(async (_url, options) => { body = options.body; return { updated: true }; });
  await h.communicationService.markNotificationsRead();
  assert.deepEqual(JSON.parse(body), {});
  assert.equal(h.events.length, 1);
});

test('Service không báo thành công cho chuông nếu API lỗi hoặc updated=false', async () => {
  const failed = serviceHarness(async () => { throw new Error('Offline'); });
  await assert.rejects(failed.communicationService.markNotificationsRead('one'), /Offline/);
  assert.equal(failed.events.length, 0);
  const unchanged = serviceHarness(async () => ({ updated: false }));
  await unchanged.communicationService.markNotificationsRead('one');
  assert.equal(unchanged.events.length, 0);
});

test('Chuông tải lại sau sự kiện đọc, bỏ phản hồi cũ và gỡ listener', async () => {
  const requests = [];
  let effect;
  let count = 0;
  let listener;
  let removed = false;
  let cleared = false;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
    useState: () => [count, (value) => { count = value; }],
    useEffect: (fn) => { effect = fn; },
  };
  const exports = {};
  const bellSource = readFileSync(resolve(__dirname, '../src/features/communication/components/RealtimeNotificationBell.tsx'), 'utf8');
  const output = ts.transpileModule(bellSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(output, {
    exports,
    window: {
      setInterval: () => 1,
      clearInterval: () => { cleared = true; },
      addEventListener: (_name, fn) => { listener = fn; },
      removeEventListener: (_name, fn) => { removed = fn === listener; },
    },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react-router-dom') return { Link: 'Link' };
      if (name.endsWith('/routes.config')) return { APP_ROUTES: {} };
      if (name.endsWith('/communication.service')) return {
        NOTIFICATIONS_READ_EVENT: 'read',
        communicationService: { listNotifications: () => { const request = deferred(); requests.push(request); return request.promise; } },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  exports.RealtimeNotificationBell();
  const cleanup = effect();
  const refresh = listener();
  requests[1].resolve({ unreadCount: 1 });
  await refresh;
  requests[0].resolve({ unreadCount: 2 });
  await settle();
  assert.equal(count, 1);
  cleanup();
  assert.equal(removed, true);
  assert.equal(cleared, true);
});
