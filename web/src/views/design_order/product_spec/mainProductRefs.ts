import { extractUnitFromSpec, formatProductQuantity, getCleanNickname } from './utils';
import { isMissingProductName } from './productDisplay';
import type { DBProductItem } from './types';

/** 同一提报列里的多个主商品在单元格文本中用 `+` 连接。 */
export const MAIN_PRODUCT_SEPARATOR = '+';

export interface MainProductRef {
	cleanNick: string;
	spec: string;
	qty: number;
	unit: string;
	fullName: string;
}

export interface MainProductRefDeps {
	/** 商品规格库全量列表，用于按昵称/全称/规格回填缺失字段。 */
	productList: () => readonly DBProductItem[];
	/** 去重后的昵称集合，用于从"昵称+规格"混排文本中切出昵称。 */
	uniqueNicknames: () => readonly string[];
}

/**
 * 按顶层分隔符切分多商品文本：括号内的 `+` / `|` 属于规格描述，不能当作分隔符。
 */
export const splitMultiProductText = (value: any): string[] => {
	const parts: string[] = [];
	let current = '';
	let parenthesisDepth = 0;

	for (const char of String(value || '')) {
		if (char === '(' || char === '（') parenthesisDepth += 1;
		if (char === ')' || char === '）') parenthesisDepth = Math.max(parenthesisDepth - 1, 0);
		if (parenthesisDepth === 0 && (char === '|' || char === MAIN_PRODUCT_SEPARATOR)) {
			if (current.trim()) parts.push(current.trim());
			current = '';
			continue;
		}
		current += char;
	}

	if (current.trim()) parts.push(current.trim());
	return parts;
};

export const stripProductSuffixes = (value: string): string =>
	String(value || '').replace(/\[[\d\s,[\]]+\]/g, '').trim();

export const normalizeQty = (qty: number): number =>
	Number.isFinite(qty) && qty > 0 ? qty : 1;

export const cleanSpecForMainProduct = (value: string): string => {
	// 外层数量已由 parseQtyProductText 拆分，规格内部的包装数量必须原样保留。
	return stripProductSuffixes(value);
};

/** 只识别括号外的 `×N` / `xN`，取最后一个匹配作为整条商品的数量。 */
export const findTopLevelQuantity = (
	text: string,
): { index: number; qty: number; unit: string } | null => {
	let parenthesisDepth = 0;
	let matched: { index: number; qty: number; unit: string } | null = null;

	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (char === '(' || char === '（') {
			parenthesisDepth += 1;
			continue;
		}
		if (char === ')' || char === '）') {
			parenthesisDepth = Math.max(parenthesisDepth - 1, 0);
			continue;
		}
		if (parenthesisDepth !== 0 || (char !== '×' && char.toLowerCase() !== 'x')) continue;

		const quantityMatch = text.slice(index + 1).match(/^\s*(\d+)\s*(.*)$/);
		if (!quantityMatch) continue;
		matched = {
			index,
			qty: normalizeQty(Number(quantityMatch[1])),
			unit: quantityMatch[2].trim(),
		};
	}

	return matched;
};

export const parseQtyProductText = (value: string) => {
	const text = stripProductSuffixes(value);
	const quantity = findTopLevelQuantity(text);
	if (!quantity) return { name: text, qty: 1, unit: '' };
	return {
		name: text.slice(0, quantity.index).trim(),
		qty: quantity.qty,
		unit: quantity.unit,
	};
};

export const formatMainProductRefText = (item: MainProductRef): string => {
	const specText = item.spec ? `${item.cleanNick}${item.spec}` : item.cleanNick;
	const unit = item.unit || extractUnitFromSpec(item.spec);
	return `${specText}${formatProductQuantity(normalizeQty(item.qty), unit)}`;
};

/** 编号后缀由脚注注册表决定，因此格式化时单独传入而非塞进 MainProductRef。 */
export const formatNumberedMainProductRefText = (
	item: MainProductRef,
	suffix: number | undefined,
): string =>
	formatMainProductRefText({
		...item,
		cleanNick: suffix === undefined ? item.cleanNick : `${item.cleanNick}[${suffix}]`,
	});

const resolveSpecFromName = (cleanName: string, cleanNick: string): string =>
	cleanName.startsWith(cleanNick) ? cleanName.slice(cleanNick.length).trim() : '';

export const createMainProductRefParser = (deps: MainProductRefDeps) => {
	/** 依次按"昵称+规格""昵称+全称""全称+规格"逐级放宽匹配，避免同名不同规格串档。 */
	const findProductByMainRef = (
		nickname: string,
		spec: string,
		fullName: string,
	): DBProductItem | null => {
		const list = deps.productList();
		return (
			list.find((item) => item.nickname === nickname && item.spec === spec) ||
			list.find((item) => item.nickname === nickname && item.fullName === fullName) ||
			list.find((item) => item.fullName === fullName && item.spec === spec) ||
			list.find((item) => item.nickname === nickname) ||
			list.find((item) => item.fullName === fullName) ||
			null
		);
	};

	const parseMainProductRef = (
		part: string,
		specParts: readonly string[],
		fullNameParts: readonly string[],
		index: number,
	): MainProductRef | null => {
		const parsed = parseQtyProductText(part);
		const cleanName = stripProductSuffixes(parsed.name);
		const cleanNick = getCleanNickname(cleanName, deps.uniqueNicknames() as string[]);
		if (!cleanNick) return null;

		const spec = cleanSpecForMainProduct(
			resolveSpecFromName(cleanName, cleanNick) || specParts[index] || '',
		);
		const matched = findProductByMainRef(cleanNick, spec, fullNameParts[index] || '');
		const resolvedNick = isMissingProductName(cleanNick) ? matched?.nickname || '' : cleanNick;
		if (!resolvedNick) return null;

		const finalSpec = spec || matched?.spec || '';
		return {
			cleanNick: resolvedNick,
			spec: finalSpec,
			qty: parsed.qty,
			unit: parsed.unit || matched?.unit || extractUnitFromSpec(finalSpec),
			fullName: fullNameParts[index] || matched?.fullName || '',
		};
	};

	const parseMainProductRefs = (
		nicknameVal: any,
		specVal: any = '',
		fullNameVal: any = '',
	): MainProductRef[] => {
		const specParts = splitMultiProductText(specVal).map(cleanSpecForMainProduct);
		const fullNameParts = splitMultiProductText(fullNameVal).map(stripProductSuffixes);
		return splitMultiProductText(nicknameVal)
			.map((part, index) => parseMainProductRef(part, specParts, fullNameParts, index))
			.filter((item): item is MainProductRef => Boolean(item));
	};

	return { findProductByMainRef, parseMainProductRefs };
};

export type MainProductRefParser = ReturnType<typeof createMainProductRefParser>;
