import test from 'node:test';
import assert from 'node:assert/strict';
import { needsLeaveConfirm } from '../../src/views/design_order/product_spec/leaveGuard.ts';

test('有改动且可编辑时才拦离开', () => {
  assert.equal(needsLeaveConfirm({ isDirty: true, canEdit: true }), true);
});

test('没有改动直接走', () => {
  assert.equal(needsLeaveConfirm({ isDirty: false, canEdit: true }), false);
});

test('只读工单不拦——用户改不了，也就没有会丢的东西', () => {
  assert.equal(needsLeaveConfirm({ isDirty: true, canEdit: false }), false);
});

test('保存中就离开也不再拦——改动已经在路上', () => {
  assert.equal(needsLeaveConfirm({ isDirty: true, canEdit: true, isSaving: true }), false);
});
