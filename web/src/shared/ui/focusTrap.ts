/**
 * 弹层焦点陷阱的判定（纯函数，可在 Node 下单测）。
 *
 * 只在两端拦截：最后一个元素上按 Tab、第一个元素上按 Shift+Tab。
 * 中间位置返回 null，让浏览器按默认顺序走——把每个 Tab 都吃掉反而会毁掉
 * 读屏软件和浏览器的既有行为。
 */
export interface TabKeyLike {
	key: string;
	shiftKey: boolean;
}

export function wrapFocusIndex({ key, shiftKey, count, currentIndex }: TabKeyLike & { count: number; currentIndex: number }): number | null {
	if (key !== 'Tab' || count <= 0) return null;
	const inContainer = currentIndex >= 0 && currentIndex < count;
	if (!inContainer) return shiftKey ? count - 1 : 0;
	if (shiftKey && currentIndex === 0) return count - 1;
	if (!shiftKey && currentIndex === count - 1) return 0;
	return null;
}

/** 弹层内可聚焦元素的选择器，与 Element Plus 的约定保持一致 */
export const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
