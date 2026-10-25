import assert from 'node:assert/strict';
import test from 'node:test';
import { testEnvironment } from '../test-environment.mjs';

test('uses separate loopback servers by default', () => {
  assert.deepEqual(testEnvironment({}), { web: 'http://127.0.0.1:8210', api: 'http://127.0.0.1:9010' });
});
test('rejects working servers and non-local origins before starting tests', () => {
  for (const api of ['http://127.0.0.1:9000', 'https://example.com', 'http://user:pass@localhost:9010',
    'http://localhost:9010/api', 'http://127.0.0.1:8210', 'http://localhost']) {
    assert.throws(() => testEnvironment({ API_BASE_URL: api }));
  }
});
test('allows independent loopback ports', () => {
  assert.equal(testEnvironment({ WEB_BASE_URL: 'http://localhost:8211', API_BASE_URL: 'http://localhost:9011' }).api,
    'http://localhost:9011');
});
