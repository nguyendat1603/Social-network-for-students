import { spawn, execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const children = [];
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  await Promise.all(children.map((child) => new Promise((resolve) => {
    if (process.platform === 'win32') {
      // Include the server processes created by tsx watch.
      execFile('taskkill', ['/pid', String(child.pid), '/T', '/F'],
        { windowsHide: true }, () => resolve());
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already exited. */ }
      resolve();
    }
  })));
  process.exit(code);
}

process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

function start(name, directory, cli, args) {
  console.log(`[dev] Starting ${name}...`);
  const child = spawn(process.execPath, [join(root, directory, cli), ...args], {
    cwd: join(root, directory),
    stdio: 'inherit',
    windowsHide: true,
    detached: process.platform !== 'win32',
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(`[dev] ${name}: ${error.message}`);
    void stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`[dev] ${name} stopped (exit ${code}).`);
      void stop(code || 1);
    }
  });
}

async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(
      `Port ${port} is unavailable. Stop the existing server, then run again.`)));
    server.listen(port, () => server.close(resolve));
  });
}

async function main() {
  for (const directory of ['backend', 'frontend']) {
    if (!existsSync(join(root, directory, '.env'))) {
      throw new Error(`Create ${directory}/.env using ${directory}/.env.example first.`);
    }
  }
  for (const file of ['backend/node_modules/tsx/dist/cli.mjs', 'frontend/node_modules/vite/bin/vite.js']) {
    if (!existsSync(join(root, file))) {
      throw new Error('Install dependencies first: npm --prefix backend ci && npm --prefix frontend ci');
    }
  }
  const require = createRequire(join(root, 'backend/package.json'));
  const env = require('dotenv').parse(readFileSync(join(root, 'backend/.env')));
  const port = Number(process.env.PORT || env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 5173) {
    throw new Error('Backend PORT must be between 1 and 65535 and different from frontend port 5173.');
  }
  await checkPort(port);
  await checkPort(5173);
  start('backend', 'backend', 'node_modules/tsx/dist/cli.mjs', ['watch', 'src/server.ts']);

  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline && !stopping) {
    try {
      const response = await fetch(`http://localhost:${port}/api/v1/health`, {
        signal: AbortSignal.timeout(1000),
      });
      await response.arrayBuffer();
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for the backend to listen. */ }
    await delay(300);
  }
  if (!ready) throw new Error('Backend did not become ready within 60 seconds. Check the logs above.');

  start('frontend', 'frontend', 'node_modules/vite/bin/vite.js', [
    '--port', '5173', '--strictPort',
    ...(process.argv.includes('--no-open') ? [] : ['--open']),
  ]);
  console.log('[dev] Web: http://localhost:5173 | Press Ctrl+C to stop both servers.');
}

main().catch((error) => {
  console.error(`[dev] ${error.message}`);
  void stop(1);
});
