import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfirmedAction } from '../../src/features/users/confirmedAction.ts';

test('confirmation and request share one lock; cancel and failure allow a manual retry', async () => {
  const pending = new Set(); let release, confirms = 0, writes = 0;
  const gate = new Promise(resolve => { release = resolve; });
  const run = createConfirmedAction(pending, () => true, () => () => {});
  const first = run(1, 'delete', async () => { confirms++; await gate; return true; }, async () => { writes++; throw new Error('failed'); });
  assert.equal(await run(1, 'reset', async () => true, async () => { writes++; }), false);
  release(); assert.equal(await first, false); assert.equal(confirms, 1); assert.equal(writes, 1);
  assert.equal(pending.size, 0);
  assert.equal(await run(1, 'delete', async () => false, async () => { writes++; }), false);
  assert.equal(writes, 1);
  assert.equal(await run(1, 'delete', async () => true, async () => { writes++; }), true);
});
test('revoking a grant or replacing the account during confirmation cannot authorize a write', async () => {
  let allowed = true, session = 0, writes = 0;
  const run = createConfirmedAction(new Set(), () => allowed, () => { const original = session; return () => { if (original !== session) throw new Error('changed'); }; });
  assert.equal(await run(1, 'delete', async () => { allowed = false; return true; }, async () => { writes++; }), false);
  allowed = true;
  assert.equal(await run(1, 'delete', async () => { session++; return true; }, async () => { writes++; }), false);
  assert.equal(writes, 0);
});
