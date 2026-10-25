import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveUserFormKeys } from '../../src/features/users/formKeys.ts';

test('the submit allowlist follows the CRUD schema instead of a hand-maintained list', () => {
  const columns = {
    _index: { form: { show: false } },
    username: { form: { rules: [] } },
    password: { form: { rules: [] } },
    name: { form: {} },
    email: { form: { component: {} } },
    user_type: { form: { show: false, value: 0 } },
    avatar: { form: { show: false } },
    dept_belong_id: { form: { show: false } },
    metadata: { form: false },
  };
  assert.deepEqual(deriveUserFormKeys(columns), ['username', 'password', 'name', 'email']);
});

test('a newly added form column is submitted without editing a second list', () => {
  assert.deepEqual(deriveUserFormKeys({ name: { form: {} }, nickname: { form: { rules: [] } } }), ['name', 'nickname']);
});

test('columns without a form section keep their default form behaviour', () => {
  assert.deepEqual(deriveUserFormKeys({ name: {}, created: { form: { show: true } } }), ['name', 'created']);
});
