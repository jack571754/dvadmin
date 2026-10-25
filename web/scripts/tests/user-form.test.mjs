import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { applyFieldPolicy, normalizeFieldPolicy } from '../../src/shared/api/fieldPolicy.ts';
import { prepareUserPayload } from '../../src/features/users/payload.ts';
import { createUserFormSession, fieldErrorsFrom } from '../../src/features/users/formSession.ts';
import { createUserColumnStorage, restrictSavedColumns } from '../../src/features/users/columnStorage.ts';

const deny = { is_query: false, is_create: false, is_update: false };
const allow = { is_query: true, is_create: true, is_update: true };

test('field policies preserve validators, widgets and mode-specific hiding', () => {
  const rules = [{ required: true }], component = { placeholder: 'email' };
  const source = { email: { form: { rules, component }, addForm: { col: { span: 12 } } },
    password: { form: { rules }, editForm: { show: false } }, metadata: { form: false } };
  const result = applyFieldPolicy(source, { email: deny, password: allow, metadata: allow });
  assert.equal(result.email.form.rules, rules);
  assert.equal(result.email.form.component, component);
  assert.equal(result.email.addForm.col.span, 12);
  assert.equal(result.email.addForm.show, false);
  assert.equal(result.email.column.show, false);
  assert.equal(result.email.column.columnSetDisabled, true);
  assert.equal(result.email.search.show, false);
  assert.equal(result.password.editForm.show, false);
  assert.equal(result.metadata.addForm, false);
  assert.equal(source.email.addForm.show, undefined);
});

test('query, create and update flags remain independent; unconfigured fields preserve their original options', () => {
  const columns = { email: { form: { rules: ['email'] } }, name: { form: { rules: ['required'] } } };
  const result = applyFieldPolicy(columns, { email: { is_query: false, is_create: true, is_update: false } });
  assert.equal(result.email.column.show, false);
  assert.equal(result.email.addForm, undefined);
  assert.equal(result.email.editForm.show, false);
  assert.equal(result.name.form, columns.name.form);
});

test('malformed field responses fail closed instead of guessing permission flags', () => {
  for (const value of [null, [], true, { email: null }, { email: { is_query: 1, is_create: true, is_update: true } }]) {
    assert.throws(() => normalizeFieldPolicy(value), TypeError);
  }
  assert.deepEqual(normalizeFieldPolicy({}), {});
});

test('saved columns cannot restore a query-denied field and storage is account scoped', async () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const input = [{ key: 'email', title: 'Email', show: true, __disabled: false, __show: true }];
  const a = createUserColumnStorage(storage, 'a', () => ({ email: deny }));
  await a.set('table', input);
  const restored = await a.get('table');
  assert.equal(restored[0].show, false);
  assert.equal(restored[0].__disabled, true);
  assert.equal(await createUserColumnStorage(storage, 'b', () => ({})).get('table'), undefined);
  assert.equal(restrictSavedColumns(input, { email: deny })[0].show, false);
});

test('creation hashes a fresh snapshot once on each attempt and strips forbidden and unknown fields', () => {
  const form = { username: 'trial', password: 'Plain-Password!', email: 'private@example.com', is_superuser: true };
  const keys = ['username', 'password', 'email'];
  const policy = { email: deny };
  const a = prepareUserPayload(form, 'add', policy, keys);
  const b = prepareUserPayload(form, 'add', policy, keys);
  assert.equal(a.password, createHash('md5').update(form.password).digest('hex'));
  assert.equal(a.password, b.password);
  assert.equal(form.password, 'Plain-Password!');
  assert.equal(Object.hasOwn(a, 'email'), false);
  assert.equal(Object.hasOwn(a, 'is_superuser'), false);
});

test('editing never sends password, denied writes or derived list metadata', () => {
  const result = prepareUserPayload({ password: 'secret', email: 'x', name: 'allowed', role_info: [] },
    'edit', { email: deny }, ['password', 'email', 'name'], 42);
  assert.deepEqual(result, { name: 'allowed', id: 42 });
});

test('form submission blocks concurrent clicks and retains field feedback until retry', async () => {
  const form = createUserFormSession(() => 'check fields');
  let reject, calls = 0, focused;
  const pending = new Promise((_resolve, fail) => { reject = fail; });
  const first = form.run(async () => { calls++; await pending; }, field => { focused = field; });
  await form.run(async () => { calls++; }, () => {});
  assert.equal(calls, 1);
  assert.equal(form.busy.value, true);
  reject(Object.assign(new Error('invalid email'), { data: { email: ['already used'] } }));
  await first;
  assert.equal(form.fields.value.email[0], 'already used');
  assert.equal(focused, 'email');
  assert.equal(form.busy.value, false);
  await form.run(async () => { calls++; }, () => {});
  assert.equal(calls, 2);
  assert.equal(form.message.value, '');
});

test('native and legacy backend field errors are normalized without persisting form values', () => {
  assert.deepEqual(fieldErrorsFrom({ username: [{ message: 'required' }] }), { username: ['required'] });
  assert.deepEqual(fieldErrorsFrom({ msg: 'username:already exists', data: null }), { username: ['already exists'] });
});
