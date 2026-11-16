const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

const src = path.resolve(__dirname, '../src');
function load(relative) {
  const filename = path.resolve(src, relative);
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    exports,
    require: name => load(path.relative(src, path.resolve(path.dirname(filename), `${name}.ts`))),
  });
  return exports;
}

const { APP_ROUTES } = load('config/routes.config.ts');
const { CAMPUS_PRIMARY_NAV, CAMPUS_SECONDARY_NAV } = load('config/navigation.config.ts');

test('Every navigation destination is an existing route, with no placeholders', () => {
  const knownRoutes = Object.values(APP_ROUTES);
  for (const item of [...CAMPUS_PRIMARY_NAV, ...CAMPUS_SECONDARY_NAV]) {
    assert.ok(knownRoutes.includes(item.to), item.to);
    assert.ok(item.label.trim());
    assert.ok(!item.to.includes(':'));
  }
  assert.equal(new Set([...CAMPUS_PRIMARY_NAV, ...CAMPUS_SECONDARY_NAV].map(item => item.to)).size, 13);
});

test('Primary navigation defers saved posts and followed-course placeholders', () => {
  assert.deepEqual(Array.from(CAMPUS_PRIMARY_NAV, item => item.to), ['/feed', '/feed/course', '/resources', '/study-groups']);
});

test('All eight business modules retain navigation entry points', () => {
  const destinations = [...CAMPUS_PRIMARY_NAV, ...CAMPUS_SECONDARY_NAV].map(item => item.to);
  for (const route of ['/profile', '/feed', '/study-groups', '/course-reviews', '/resources', '/marketplace', '/marketplace/housing', '/messenger', '/notifications', '/karma', '/feed/department', '/course-reviews/forum']) {
    assert.ok(destinations.includes(route), route);
  }
  const shell = readFileSync(path.join(src, 'components/layout/CampusAppShell.tsx'), 'utf8');
  assert.match(shell, /user\?\.role === 'ADMIN' \|\| user\?\.role === 'MODERATOR'/);
  assert.match(shell, /APP_ROUTES.MODERATION_DASHBOARD/);
});

test('All MainLayout consumers use the shared Campus shell and keep messaging', () => {
  const layout = readFileSync(path.join(src, 'components/layout/MainLayout.tsx'), 'utf8');
  assert.match(layout, /return <CampusAppShell/);
  assert.match(layout, /FloatingChatBubbles/);
  assert.doesNotMatch(layout, /substack-layout-grid/);
});
