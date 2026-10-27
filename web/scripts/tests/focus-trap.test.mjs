import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapFocusIndex } from '../../src/shared/ui/focusTrap.ts';

const opts = (over) => ({ key: 'Tab', shiftKey: false, count: 3, currentIndex: 0, ...over });

test('Tab 在最后一个可聚焦元素上回到第一个', () => {
	assert.equal(wrapFocusIndex(opts({ currentIndex: 2 })), 0);
});

test('Shift+Tab 在第一个可聚焦元素上回到最后一个', () => {
	assert.equal(wrapFocusIndex(opts({ shiftKey: true, currentIndex: 0 })), 2);
});

test('中间位置不拦截，交给浏览器默认行为', () => {
	assert.equal(wrapFocusIndex(opts({ currentIndex: 1 })), null);
	assert.equal(wrapFocusIndex(opts({ shiftKey: true, currentIndex: 1 })), null);
});

test('焦点不在容器内（-1）时：Tab 进第一个，Shift+Tab 进最后一个', () => {
	assert.equal(wrapFocusIndex(opts({ currentIndex: -1 })), 0);
	assert.equal(wrapFocusIndex(opts({ shiftKey: true, currentIndex: -1 })), 2);
});

test('没有可聚焦元素时不拦截', () => {
	assert.equal(wrapFocusIndex(opts({ count: 0, currentIndex: -1 })), null);
});

test('非 Tab 键一律不拦截', () => {
	assert.equal(wrapFocusIndex(opts({ key: 'Enter', currentIndex: 2 })), null);
});
