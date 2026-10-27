import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmptyState, EMPTY_STATE_VARIANTS } from '../../src/shared/ui/emptyStateVariants.ts';

const translate = key => `t:${key}`;

test('四种状态各自有不同的标题，用户能分辨"没数据"和"筛选无结果"', () => {
  const titles = EMPTY_STATE_VARIANTS.map(variant => resolveEmptyState(variant, translate).title);
  assert.equal(new Set(titles).size, titles.length);
  assert.ok(titles.every(title => title.startsWith('t:')));
});

test('筛选无结果提供「清空筛选」，不是「新建」', () => {
  const filtered = resolveEmptyState('filtered', translate);
  assert.equal(filtered.actionText, 't:message.common.clearFilters');
  assert.notEqual(filtered.actionText, resolveEmptyState('empty', translate).actionText);
});

test('出错状态提供重试，无权限状态不提供重试', () => {
  assert.equal(resolveEmptyState('error', translate).actionText, 't:message.common.retry');
  assert.equal(resolveEmptyState('forbidden', translate).actionText, '');
  assert.ok(resolveEmptyState('forbidden', translate).description);
});

test('显式传入的文案覆盖默认值', () => {
  const custom = resolveEmptyState('empty', translate, { title: '还没有店铺', description: '先新建一个店铺', actionText: '新建' });
  assert.equal(custom.title, '还没有店铺');
  assert.equal(custom.description, '先新建一个店铺');
  assert.equal(custom.actionText, '新建');
});

test('未知变体回落到 empty', () => {
  assert.deepEqual(resolveEmptyState('nonsense', translate), resolveEmptyState('empty', translate));
});
