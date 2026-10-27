import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteConfirmOptions as buildDeleteConfirm } from '../../src/shared/ui/feedbackCore.ts';

const translate = (key, params) => (params ? `${key}|${JSON.stringify(params)}` : `t:${key}`);

test('删除确认走 dialog 档，用 warning 而不是通用信息框', () => {
  const options = buildDeleteConfirm('角色A', translate);
  assert.equal(options.level, 'dialog');
  assert.equal(options.tone, 'warning');
});

test('标题里带对象名，用户能确认删的是哪一个', () => {
  const options = buildDeleteConfirm('角色A', translate);
  assert.ok(options.title.includes('角色A'), `标题应包含对象名，实际是 ${options.title}`);
});

test('按钮文案是「删除 / 取消」，不是通用的「确定」', () => {
  const options = buildDeleteConfirm('角色A', translate);
  assert.equal(options.confirmText, 't:message.common.delete');
  assert.equal(options.cancelText, 't:message.common.cancel');
});

test('没有对象名时不留下空引号', () => {
  const options = buildDeleteConfirm('', translate);
  assert.ok(!options.title.includes('「」'), `标题不该出现空引号，实际是 ${options.title}`);
});

test('批量删除按条数说明，并保留「删除 / 取消」按钮', () => {
  const options = buildDeleteConfirm(3, translate);
  assert.equal(options.tone, 'warning');
  assert.ok(options.title.includes('3'), `标题应包含条数，实际是 ${options.title}`);
  assert.equal(options.confirmText, 't:message.common.delete');
  assert.equal(options.cancelText, 't:message.common.cancel');
});
