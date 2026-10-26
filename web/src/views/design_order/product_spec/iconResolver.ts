/**
 * Icon 候选解析缓存。
 *
 * recalculateSuffixesAndFootnotes 是同步函数，不能在里面 await 接口；
 * 因此这里维护一份「商品编码 -> 可选 Icon」缓存：同步读缓存，缺失的编码排队后台批量拉取，
 * 拉到后回调触发一次重算。缓存过的编码不会重复请求，所以不会形成请求-重算死循环。
 */

import { ResolveByProducts } from '/@/api/design_order/icon_library';
import { normalizeIconOptions, type IconOption } from './iconRefs';

/** 后端 resolve-by-products 单次上限 500，这里留出余量分片。 */
const RESOLVE_CHUNK_SIZE = 200;

export interface IconResolver {
	/** 同步读取；undefined 表示尚未解析（已排队）。 */
	getSync(productCode: string): IconOption[] | undefined;
	/** 多个主商品的候选并集，未解析的编码会自动排队。 */
	optionsFor(productCodes: readonly string[]): IconOption[];
	/** 只排队不取值，用于同步流程中登记待解析编码。 */
	request(productCodes: readonly string[]): void;
	/** 等待指定编码解析完成，供表单打开等异步场景使用。 */
	ensure(productCodes: readonly string[]): Promise<void>;
	/** 解析完成回调（有新数据入缓存时触发）。 */
	onResolved(handler: () => void): void;
	/** 清空缓存，切换提报单时调用。 */
	reset(): void;
}

const chunk = <T>(items: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		result.push(items.slice(index, index + size));
	}
	return result;
};

export const createIconResolver = (): IconResolver => {
	const cache = new Map<string, IconOption[]>();
	const pending = new Set<string>();
	const handlers: Array<() => void> = [];
	let flushing: Promise<void> | null = null;
	let scheduled = false;

	const normalizeCode = (value: string): string => String(value || '').trim();

	const flush = async (): Promise<void> => {
		const codes = [...pending];
		pending.clear();
		if (!codes.length) return;
		let changed = false;
		try {
			for (const batch of chunk(codes, RESOLVE_CHUNK_SIZE)) {
				const response: any = await ResolveByProducts(batch);
				const items: any[] = response?.data?.items || [];
				for (const item of items) {
					const code = normalizeCode(item?.product_code ?? item?.productCode);
					if (!code) continue;
					cache.set(code, normalizeIconOptions(item?.icons));
					changed = true;
				}
				// 后端未返回的编码也落盘为空，避免反复请求
				for (const code of batch) {
					if (!cache.has(code)) cache.set(code, []);
				}
			}
		} catch (error) {
			// 解析失败不缓存，下次仍可重试；提报页保持可用
			console.warn('解析商品 Icon 失败:', error);
		}
		if (changed) handlers.forEach((handler) => handler());
	};

	const schedule = () => {
		if (scheduled || !pending.size) return;
		scheduled = true;
		Promise.resolve().then(() => {
			scheduled = false;
			flushing = flush().finally(() => {
				flushing = null;
			});
		});
	};

	const request = (productCodes: readonly string[]) => {
		let added = false;
		for (const raw of productCodes) {
			const code = normalizeCode(raw);
			if (!code || cache.has(code) || pending.has(code)) continue;
			pending.add(code);
			added = true;
		}
		if (added) schedule();
	};

	const getSync = (productCode: string): IconOption[] | undefined => {
		const code = normalizeCode(productCode);
		if (!code) return [];
		const cached = cache.get(code);
		if (cached) return cached;
		request([code]);
		return undefined;
	};

	const optionsFor = (productCodes: readonly string[]): IconOption[] => {
		const byId = new Map<number, IconOption>();
		for (const raw of productCodes) {
			for (const option of getSync(raw) || []) {
				if (!byId.has(option.id)) byId.set(option.id, option);
			}
		}
		return [...byId.values()].sort((a, b) => a.id - b.id);
	};

	const ensure = async (productCodes: readonly string[]): Promise<void> => {
		request(productCodes);
		// 等待已排队的批次落地：schedule 走微任务，这里连续 await 直到队列清空
		while (pending.size || flushing) {
			if (flushing) {
				await flushing;
			} else {
				await Promise.resolve();
			}
		}
	};

	return {
		getSync,
		optionsFor,
		request,
		ensure,
		onResolved: (handler: () => void) => {
			handlers.push(handler);
		},
		reset: () => {
			cache.clear();
			pending.clear();
		},
	};
};
