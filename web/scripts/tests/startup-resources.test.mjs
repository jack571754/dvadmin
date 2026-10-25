import test from 'node:test';
import assert from 'node:assert/strict';
import { startOptionalStartupResources } from '../../src/shared/access/startupResources.ts';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('a failed auxiliary resource is reported without failing the start', async () => {
  const failures = [];
  await startOptionalStartupResources([
    { name: 'dictionary', load: async () => { throw new Error('dictionary 500'); } },
    { name: 'departments', load: async () => ['ok'] },
  ], (name, error) => failures.push([name, error.message]));
  assert.deepEqual(failures, [['dictionary', 'dictionary 500']]);
});

test('cancelled session work is not a degraded resource', async () => {
  const failures = [];
  await startOptionalStartupResources([
    { name: 'dictionary', load: async () => { throw new DOMException('Session changed', 'AbortError'); } },
    { name: 'systemConfig', load: async () => { throw Object.assign(new Error('superseded'), { kind: 'cancelled' }); } },
  ], (name, error) => failures.push([name, error]));
  assert.deepEqual(failures, []);
});

test('every auxiliary resource starts before any of them settles and all are awaited', async () => {
  const slow = deferred(), fast = deferred(), started = [];
  const settled = startOptionalStartupResources([
    { name: 'slow', load: () => { started.push('slow'); return slow.promise; } },
    { name: 'fast', load: () => { started.push('fast'); return fast.promise; } },
  ], () => {});
  // The helper hands both loads to the microtask queue immediately.
  await Promise.resolve();
  assert.deepEqual(started, ['slow', 'fast']);
  let done = false;
  void settled.then(() => { done = true; });
  fast.resolve('ok');
  await Promise.resolve();
  assert.equal(done, false);
  slow.resolve('ok');
  await settled;
  assert.equal(done, true);
});

test('a non-Error rejection still names the resource instead of swallowing it', async () => {
  const failures = [];
  await startOptionalStartupResources([
    { name: 'dictionary', load: async () => { throw 'offline'; } },
  ], (name, error) => failures.push([name, error]));
  assert.deepEqual(failures, [['dictionary', 'offline']]);
});
