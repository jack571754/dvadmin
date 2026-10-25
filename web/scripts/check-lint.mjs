import { ESLint } from 'eslint';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const eslint = new ESLint();
const results = await eslint.lintFiles(['src', 'tests', 'scripts', 'playwright.config.ts']);
const counts = {};
for (const result of results) {
  const file = path.relative(process.cwd(), result.filePath).replaceAll('\\', '/');
  for (const message of result.messages.filter(item => item.severity === 2)) {
    const key = JSON.stringify([file, message.ruleId, message.message]);
    counts[key] = (counts[key] || 0) + 1;
  }
}
const baselineFile = new URL('../quality/eslint-baseline.json', import.meta.url);
if (process.argv.includes('--record-baseline')) {
  for (const key of Object.keys(counts)) {
    if (!JSON.parse(key)[0].startsWith('src/')) throw new Error('Fix infrastructure lint errors before recording legacy source debt.');
  }
  await mkdir(new URL('../quality/', import.meta.url), { recursive: true });
  await writeFile(baselineFile, JSON.stringify(counts, null, 2) + '\n');
  console.log(`Recorded ${Object.values(counts).reduce((sum, count) => sum + count, 0)} legacy source errors.`);
} else {
  const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));
  const regressions = Object.entries(counts).filter(([key, count]) => count > (baseline[key] || 0));
  if (regressions.length) {
    for (const [key, count] of regressions) console.error(key, `current=${count}, baseline=${baseline[key] || 0}`);
    process.exitCode = 1;
  }
  console.log(`Lint: ${regressions.length} new error groups; ${Object.values(counts).reduce((sum, count) => sum + count, 0)} known legacy errors. Full output: pnpm lint:all.`);
}
