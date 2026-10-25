import test from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError, AxiosHeaders, isCancel } from 'axios';
import { createHttpRuntime } from '../../src/shared/api/client.ts';

function deferred() {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
}
function response(config, data, status = 200, headers = {}) {
  return { config, data, status, statusText: 'fixture', headers: AxiosHeaders.from(headers) };
}
function fixture(adapter) {
  let token = 'account-a', revision = 0;
  const listeners = new Set(), notices = [], expirations = [];
  let clears = 0;
  const change = value => { token = value; revision++; listeners.forEach(reset => reset()); };
  const runtime = createHttpRuntime({
    getSession: () => ({ token, revision }), subscribe: reset => { listeners.add(reset); return () => listeners.delete(reset); },
    getApiBaseURL: () => 'http://api.test/', getOrigin: () => 'http://web.test', getLanguage: () => 'en',
    expireSession: () => { clears++; change(null); }, notifyExpired: () => expirations.push('expired'),
    notifyError: error => notices.push(error), message: kind => kind,
  });
  const options = { baseURL: 'http://api.test/', adapter };
  return { runtime, client: runtime.createClient(options), legacy: runtime.createClient(options, 'legacy'),
    change, notices, expirations, get token() { return token; }, get clears() { return clears; } };
}

test('adapters preserve DVAdmin pagination, legacy success and third-party/swagger payloads', async () => {
  const f = fixture(async config => response(config, JSON.parse(config.headers.get('X-Fixture'))));
  const envelope = { code: 2000, msg: 'ok', data: [{ id: 1 }], page: 2, limit: 10, total: 11 };
  assert.deepEqual(await f.client.get('/users', { headers: { 'X-Fixture': JSON.stringify(envelope) } }), envelope);
  for (const body of [{ code: 0, data: 'legacy' }, { external: true }, { swagger: '2.0', code: 99 }]) {
    assert.deepEqual(await f.legacy.get('/legacy', { headers: { 'X-Fixture': JSON.stringify(body) } }), body);
  }
  await assert.rejects(f.legacy.get('/legacy', { headers: { 'X-Fixture': JSON.stringify(envelope) } }), error => error.kind === 'business');
  assert.equal(f.runtime.pendingCount, 0);
});

test('common headers merge without mutating caller headers or leaking JWT to another origin', async () => {
  const calls = [];
  const f = fixture(async config => { calls.push(config); return response(config, { code: 2000 }); });
  const headers = { 'X-Upload': 'one' };
  await f.client.post('/upload', {}, { headers });
  await f.client.get('https://third-party.test/data');
  await f.client.get('/custom', { headers: { Authorization: 'Basic explicit', 'Accept-Language': 'zh-tw' } });
  assert.deepEqual(headers, { 'X-Upload': 'one' });
  assert.equal(calls[0].headers.get('Authorization'), 'JWT account-a');
  assert.equal(calls[0].headers.get('Accept-Language'), 'en');
  assert.equal(calls[1].headers.has('Authorization'), false);
  assert.equal(calls[2].headers.get('Authorization'), 'Basic explicit');
  assert.equal(calls[2].headers.get('Accept-Language'), 'zh-tw');
});

test('concurrent HTTP and business 401 across compatibility clients expire only once', async () => {
  const barrier = deferred();
  const f = fixture(async config => {
    await barrier.promise;
    if (config.url === '/http') throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, null,
      response(config, { detail: 'expired' }, 401));
    return response(config, { code: 401, msg: 'expired', data: null });
  });
  const pending = [f.client.get('/http'), f.client.get('/business'), f.legacy.get('/legacy')];
  const settled = Promise.allSettled(pending);
  await new Promise(resolve => setImmediate(resolve));
  barrier.resolve();
  const results = await settled;
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(f.clears, 1);
  assert.equal(f.expirations.length, 1);
  assert.equal(f.notices.length, 0);
  assert.equal(f.runtime.pendingCount, 0);
});

test('old success and old 401 are cancelled after account replacement without disturbing the new session', async () => {
  for (const status of [200, 401]) {
    const barrier = deferred();
    const f = fixture(async config => {
      await barrier.promise;
      if (status === 401) throw new AxiosError('old', 'ERR_BAD_REQUEST', config, null, response(config, {}, 401));
      return response(config, { code: 2000, data: 'old data' });
    });
    const old = f.client.get('/old');
    const checked = assert.rejects(old, error => error.kind === 'cancelled' && isCancel(error));
    await new Promise(resolve => setImmediate(resolve));
    f.change('account-b');
    barrier.resolve();
    await checked;
    assert.equal(f.token, 'account-b');
    assert.equal(f.clears, 0);
    assert.equal(f.expirations.length + f.notices.length, 0);
    assert.equal(f.runtime.pendingCount, 0);
  }
});

test('forbidden, validation and business errors preserve status and field details and notify once', async () => {
  for (const [status, code, kind] of [[403, 4000, 'forbidden'], [422, 400, 'validation'], [200, 4000, 'business']]) {
    const details = { email: ['Invalid email'] };
    const f = fixture(async config => {
      const result = response(config, { code, msg: 'fix fields', data: details }, status);
      if (status !== 200) throw new AxiosError('rejected', 'ERR_BAD_REQUEST', config, null, result);
      return result;
    });
    await assert.rejects(f.client.post('/users', {}), error => error.kind === kind && error.msg === 'fix fields'
      && error.status === status && error.code === code && error.data.email[0] === 'Invalid email');
    assert.equal(f.notices.length, 1);
    assert.equal(f.clears, 0);
  }
});

test('network and timeout failures need no response object and writes are never retried', async () => {
  for (const [code, kind] of [['ERR_NETWORK', 'network'], ['ECONNABORTED', 'timeout']]) {
    let calls = 0;
    const f = fixture(async config => { calls++; throw new AxiosError('failed', code, config); });
    await assert.rejects(f.client.post('/write', { value: 1 }), error => error.kind === kind);
    assert.equal(calls, 1);
    assert.equal(f.notices.length, 1);
    assert.equal(f.runtime.pendingCount, 0);
  }
});

test('caller cancellation is quiet and disposal releases session subscriptions', async () => {
  const barrier = deferred();
  const f = fixture(async config => { await barrier.promise; return response(config, { code: 2000 }); });
  const controller = new AbortController();
  const pending = f.client.get('/query', { signal: controller.signal });
  const checked = assert.rejects(pending, error => error.kind === 'cancelled');
  await new Promise(resolve => setImmediate(resolve));
  controller.abort();
  barrier.resolve();
  await checked;
  assert.equal(f.notices.length, 0);
  assert.equal(f.runtime.pendingCount, 0);
  f.runtime.dispose();
});

test('Blob downloads retain bytes, status and disposition while JSON Blob failures are rejected', async () => {
  const bytes = new Blob(['sheet'], { type: 'application/octet-stream' });
  const f = fixture(async config => response(config, bytes, 200, { 'content-disposition': 'attachment; filename=users.xlsx' }));
  const downloaded = await f.client.get('/download', { responseType: 'blob' });
  assert.equal(downloaded.data, bytes);
  assert.equal(downloaded.headers.get('content-disposition'), 'attachment; filename=users.xlsx');
  assert.equal(downloaded.status, 200);
  for (const [code, kind] of [[4000, 'business'], [401, 'auth']]) {
    const errors = fixture(async config => response(config, new Blob([JSON.stringify({ code, msg: 'rejected', data: null })]),
      200, { 'content-type': 'application/json; charset=utf-8' }));
    await assert.rejects(errors.client.get('/download', { responseType: 'blob' }), error => error.kind === kind);
  }
});

test('external or explicitly authenticated 401 cannot invalidate the DVAdmin account', async () => {
  const f = fixture(async config => { throw new AxiosError('denied', 'ERR_BAD_REQUEST', config, null, response(config, {}, 401)); });
  await assert.rejects(f.client.get('https://third-party.test/data'), error => error.kind === 'auth');
  await assert.rejects(f.client.get('/custom', { headers: { Authorization: 'Basic explicit' } }), error => error.kind === 'auth');
  assert.equal(f.clears, 0);
  assert.equal(f.token, 'account-a');
});

test('HTTP JSON Blob auth failures and empty validation details retain their contracts', async () => {
  const f = fixture(async config => {
    const result = response(config, new Blob([JSON.stringify({ code: 401, msg: 'expired', data: null })]),
      401, { 'content-type': 'application/problem+json' });
    throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, null, result);
  });
  await assert.rejects(f.client.get('/download', { responseType: 'blob' }), error => error.kind === 'auth' && error.data === null);
  assert.equal(f.clears, 1);
  assert.equal(f.expirations.length, 1);
});

test('new sessions can expire independently after an earlier session was cleared', async () => {
  const f = fixture(async config => response(config, { code: 401, msg: 'expired', data: null }));
  await assert.rejects(f.client.get('/a'), error => error.kind === 'auth');
  f.change('account-b');
  await assert.rejects(f.client.get('/b'), error => error.kind === 'auth');
  assert.equal(f.clears, 2);
  assert.equal(f.expirations.length, 2);
});

test('plain adapter errors are normalized and release their request ownership', async () => {
  const f = fixture(async () => { throw new Error('offline without axios metadata'); });
  await assert.rejects(f.client.get('/mock'), error => error.kind === 'network');
  assert.equal(f.notices.length, 1);
  assert.equal(f.runtime.pendingCount, 0);
});
