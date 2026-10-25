import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { testEnvironment } from './test-environment.mjs';

const urls = testEnvironment();
const backend = fileURLToPath(new URL('../../backend/', import.meta.url));
const web = fileURLToPath(new URL('../', import.meta.url));
let child;
const run = (command, args, options) => new Promise((resolve, reject) => {
  const subprocess = spawn(command, args, { stdio: 'inherit', ...options });
  child = subprocess;
  subprocess.on('error', reject);
  subprocess.on('exit', code => code === 0 ? resolve() : reject(new Error(`Test process exited: ${code}`)));
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { child?.kill(signal); process.exit(0); });
}
if (process.argv.includes('--backend')) {
  const python = process.env.PYTHON || 'python';
  const env = { ...process.env, DJANGO_SETTINGS_MODULE: 'application.e2e_settings', PYTHONUTF8: '1' };
  await run(python, ['scripts/prepare_e2e.py'], { cwd: backend, env });
  await run(python, ['-m', 'uvicorn', 'application.asgi:application', '--host', new URL(urls.api).hostname,
    '--port', new URL(urls.api).port, '--no-access-log'], { cwd: backend, env });
} else {
  const env = { ...process.env, VITE_API_URL: urls.api };
  const preview = process.env.E2E_PREVIEW === '1';
  if (preview) await run(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', 'e2e'], { cwd: web, env });
  await run(process.execPath, ['node_modules/vite/bin/vite.js', ...(preview ? ['preview'] : []),
    '--host', new URL(urls.web).hostname, '--port', new URL(urls.web).port,
    '--strictPort', ...(!preview ? ['--mode', 'e2e'] : [])], { cwd: web, env });
}
