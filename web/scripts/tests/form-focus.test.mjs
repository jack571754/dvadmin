import test from 'node:test';
import assert from 'node:assert/strict';
import { focusFirstError } from '../../src/shared/ui/formFocus.ts';

function scrollableHost() {
  const calls = [];
  return {
    calls,
    $el: { scrollIntoView: options => calls.push({ target: 'host', options }) },
  };
}

test('表单实例支持 scrollToField 时，直接滚到出错字段', async () => {
  const calls = [];
  const formRef = { scrollToField: field => calls.push(field), $el: { scrollIntoView: () => calls.push('host') } };
  await focusFirstError(formRef, 'username');
  assert.deepEqual(calls, ['username']);
});

test('拿不到 scrollToField 时回退到表单顶部', async () => {
  const formRef = scrollableHost();
  await focusFirstError(formRef, 'username');
  assert.equal(formRef.calls.length, 1);
  assert.equal(formRef.calls[0].target, 'host');
});

test('没有字段名时直接滚到表单顶部，不调用 scrollToField', async () => {
  const calls = [];
  const formRef = { scrollToField: field => calls.push(field), $el: { scrollIntoView: () => calls.push('host') } };
  await focusFirstError(formRef, undefined);
  assert.deepEqual(calls, ['host']);
});

test('表单还没渲染出来时不抛错', async () => {
  await focusFirstError(null, 'username');
  await focusFirstError(undefined, undefined);
});
