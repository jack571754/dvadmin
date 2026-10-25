import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const files = await readdir('src/views', { recursive: true });
const bundles = [];
for (const file of await readdir('dist/assets')) {
  if (file.endsWith('.js')) {
    const data = await readFile(`dist/assets/${file}`);
    bundles.push({ file, bytes: data.length, gzipBytes: gzipSync(data).length });
  }
}
const report = {
  capturedAt: new Date().toISOString(), node: process.version,
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  lockfileSha256: createHash('sha256').update(await readFile('pnpm-lock.yaml')).digest('hex'),
  vueFiles: files.filter(file => file.endsWith('.vue')).length,
  crudFiles: files.filter(file => file.endsWith('crud.tsx')).length,
  javascript: { count: bundles.length, bytes: bundles.reduce((sum, file) => sum + file.bytes, 0),
    gzipBytes: bundles.reduce((sum, file) => sum + file.gzipBytes, 0),
    largest: bundles.sort((a, b) => b.bytes - a.bytes).slice(0, 10) },
  note: 'All build assets, not first-screen transfer. Browser measurements are attached by the baseline project.',
};
await mkdir('quality-reports', { recursive: true });
await writeFile('quality-reports/build-baseline.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Baseline saved: ${report.vueFiles} Vue files, ${report.crudFiles} CRUD configs; ${bundles.length} JS assets.`);
