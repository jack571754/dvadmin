import test from 'node:test';
import assert from 'node:assert/strict';
import { createStartupState } from '../../src/shared/access/startup.ts';

test('a failed start exposes its message and one usable retry action', () => {
  const startup = createStartupState();
  const attempt = startup.begin();
  let retries = 0;
  assert.equal(startup.fail(attempt, new Error('dictionary unavailable'), () => { retries++; }), true);
  assert.equal(startup.status.value, 'failed');
  assert.equal(startup.message.value, 'dictionary unavailable');
  assert.equal(startup.retry(), true);
  assert.equal(retries, 1);
  assert.equal(startup.status.value, 'initializing');
  assert.equal(startup.message.value, '');
  assert.equal(startup.retry(), false);
  assert.equal(retries, 1);
});

test('a retry that fails again becomes actionable again', () => {
  const startup = createStartupState();
  const first = startup.begin();
  startup.fail(first, new Error('offline'), () => {});
  startup.retry();
  const second = startup.begin();
  startup.fail(second, new Error('still offline'), () => {});
  assert.equal(startup.status.value, 'failed');
  assert.equal(startup.message.value, 'still offline');
  assert.equal(startup.retry(), true);
});

test('session cancellation or a superseded attempt never shows a startup error', () => {
  const startup = createStartupState();
  const aborted = startup.begin();
  assert.equal(startup.fail(aborted, new DOMException('Session changed', 'AbortError'), () => {}), false);
  assert.equal(startup.status.value, 'initializing');

  const cancelled = startup.begin();
  assert.equal(startup.fail(cancelled, Object.assign(new Error('superseded'), { kind: 'cancelled' }), () => {}), false);
  assert.equal(startup.status.value, 'initializing');

  const stale = startup.begin();
  const current = startup.begin();
  assert.equal(startup.fail(stale, new Error('late failure'), () => {}), false);
  assert.equal(startup.status.value, 'initializing');
  startup.ready(current);
  assert.equal(startup.status.value, 'ready');
  assert.equal(startup.fail(stale, new Error('later failure'), () => {}), false);
  assert.equal(startup.status.value, 'ready');
});

test('success clears a previous failure and its retry action', () => {
  const startup = createStartupState();
  const failed = startup.begin();
  startup.fail(failed, new Error('offline'), () => {});
  const next = startup.begin();
  startup.ready(next);
  assert.equal(startup.status.value, 'ready');
  assert.equal(startup.message.value, '');
  assert.equal(startup.retry(), false);

  assert.equal(startup.fail(next, new Error('late'), () => {}), false);
  assert.equal(startup.status.value, 'ready');
});

test('reset drops the failure and makes an old retry inert', () => {
  const startup = createStartupState();
  const attempt = startup.begin();
  let retries = 0;
  startup.fail(attempt, new Error('offline'), () => { retries++; });
  startup.reset();
  assert.equal(startup.status.value, 'idle');
  assert.equal(startup.message.value, '');
  assert.equal(startup.retry(), false);
  assert.equal(retries, 0);
});
