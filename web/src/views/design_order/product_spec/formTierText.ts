import { extractUnitFromSpec, formatProductQuantity } from './utils';
import { normalizeProductName } from './productDisplay';
import { parseQtyProductText, splitMultiProductText, stripProductSuffixes } from './mainProductRefs';
import {
	calculateGiftValue,
	formatPromotionValue,
	formatSpacedStrategyLines,
	formatStrategyDisplayLine,
} from './giftStrategies';
import type { DBProductItem } from './types';

export interface FormTierGiftItem {
	productCode: string;
	nickname: string;
	fullName: string;
	spec: string;
	qty: number;
	unit: string;
	retailPrice: string;
}

export interface FormTierItem {
	id: number;
	threshold: string;
	value: string;
	items: FormTierGiftItem[];
}

export type TierSuffixResolver = (item: FormTierGiftItem) => number | undefined;

export const cloneTiers = (tiers: FormTierItem[]): FormTierItem[] =>
	tiers.map((tier) => ({
		...tier,
		items: tier.items.map((item) => ({ ...item })),
	}));

export const isPlaceholderTierValue = (value: string): boolean =>
	!value || value.includes('待填写') || /^价值\s*元$/.test(value);

export const stripTrailingBrandLabel = (value: string): string =>
	normalizeProductName(value).replace(/\s*[（(][^（）()]*[）)]\s*$/, '').trim();

export const formatTiersToText = (
	tiers: readonly FormTierItem[],
	getSuffix?: TierSuffixResolver,
): string => {
	if (!tiers || tiers.length === 0) return '';
	return formatSpacedStrategyLines(
		tiers.map((tier) => {
			const itemsText =
				tier.items
					.map((gift) => {
						const suffix = getSuffix?.(gift);
						const displayName = gift.nickname || gift.fullName;
						const numberedName = suffix === undefined ? displayName : `${displayName}[${suffix}]`;
						const normalizedSpec = String(gift.spec || '').trim();
						const specification = normalizedSpec ? ` ${normalizedSpec}` : '';
						return `${numberedName}${specification}${formatProductQuantity(gift.qty, gift.unit)}`;
					})
					.join('+') || '—';
			const threshold = tier.threshold.trim() || '未填写门槛';
			return formatStrategyDisplayLine(`${threshold}赠`, tier.value, itemsText);
		}),
	);
};

interface ParsedTierGift {
	item: FormTierGiftItem;
	isKnownProduct: boolean;
	/** 历史数据会把规格片段误存成独立赠品项，需要合并回上一个已知商品。 */
	isLegacySpecificationFragment: boolean;
}

/** 记录每个档位最近一次自动计算出的价值，用来区分用户手填值与自动值。
 * 以档位对象为键，避免档位 id 复用导致串档。 */
const autoTierValues = new WeakMap<object, string>();

export const syncTierValue = (tier: FormTierItem): void => {
	const autoValue = calculateGiftValue(tier.items);
	const previousAuto = autoTierValues.get(tier) ?? '';
	const current = String(tier.value || '').trim();
	const isManual =
		!isPlaceholderTierValue(current) && current !== previousAuto && current !== autoValue;
	autoTierValues.set(tier, autoValue);
	if (!isManual) tier.value = autoValue;
};

export const createFormTierText = (productList: () => readonly DBProductItem[]) => {
	/** 从备注里的脚注行还原 `[编号] → 商品` 映射，供赠品项精确回填商品编码。 */
	const parseFootnoteProductMap = (remarks: string): Record<number, DBProductItem> => {
		const result: Record<number, DBProductItem> = {};
		String(remarks || '')
			.split(/\r?\n/)
			.forEach((line) => {
				const match = line.trim().match(/^\[(\d+)\]指(.+)$/);
				if (!match) return;
				const fullName = match[2].trim();
				const product = productList().find((item) => item.fullName === fullName);
				if (product?.productCode) result[Number(match[1])] = product;
			});
		return result;
	};

	const findUniqueTierProduct = (name: string): DBProductItem | undefined => {
		const comparableName = stripTrailingBrandLabel(name);
		if (!comparableName) return undefined;
		const candidates = productList().filter(
			(item) =>
				stripTrailingBrandLabel(item.nickname) === comparableName ||
				stripTrailingBrandLabel(item.fullName) === comparableName,
		);
		return candidates.length === 1 ? candidates[0] : undefined;
	};

	const matchTierProduct = (
		cleanName: string,
		suffixMatch: RegExpMatchArray | null,
		footnoteProducts: Record<number, DBProductItem>,
	): DBProductItem | undefined => {
		const list = productList();
		const exactNicknameCandidates = list.filter((item) => item.nickname === cleanName);
		return (
			(suffixMatch ? footnoteProducts[Number(suffixMatch[1])] : undefined) ||
			list.find((item) => item.fullName === cleanName) ||
			(exactNicknameCandidates.length === 1 ? exactNicknameCandidates[0] : undefined) ||
			findUniqueTierProduct(cleanName)
		);
	};

	const parseTierGift = (
		segment: string,
		footnoteProducts: Record<number, DBProductItem>,
	): ParsedTierGift => {
		const suffixMatch = segment.match(/\[(\d+)\]/);
		const parsed = parseQtyProductText(segment);
		const productPart = stripProductSuffixes(parsed.name);
		const specificationMatch = productPart.match(/^(.*?)(?:（规格：(.*?)）)$/);
		const cleanName = (specificationMatch?.[1] || productPart).trim();
		const parsedSpec = (specificationMatch?.[2] || '').trim();
		const product = matchTierProduct(cleanName, suffixMatch, footnoteProducts);
		const openingCount = (segment.match(/[（(]/g) || []).length;
		const closingCount = (segment.match(/[）)]/g) || []).length;
		const looksLikeSpecificationFragment = /^\d+(?:\.\d+)?\s*(?:ml|g|kg|mg|l)\b/i.test(cleanName);
		return {
			item: {
				productCode: product?.productCode || '',
				nickname: normalizeProductName(product?.nickname) || cleanName,
				fullName: product?.fullName || cleanName,
				spec: parsedSpec || product?.spec || '',
				qty: parsed.qty,
				unit: parsed.unit || product?.unit || extractUnitFromSpec(product?.spec || parsedSpec),
				retailPrice: product?.retailPrice || '',
			},
			isKnownProduct: Boolean(product),
			isLegacySpecificationFragment:
				!product &&
				looksLikeSpecificationFragment &&
				(closingCount > openingCount || Boolean(suffixMatch)),
		};
	};

	const parseQtyItems = (
		text: string,
		footnoteProducts: Record<number, DBProductItem> = {},
	): FormTierGiftItem[] => {
		if (!text || text === '—') return [];
		const parsedItems = splitMultiProductText(text)
			.map((segment) => parseTierGift(segment, footnoteProducts))
			.filter(({ item }) => item.nickname);

		const repairedItems: FormTierGiftItem[] = [];
		let previousKnownItem: FormTierGiftItem | undefined;
		for (const { item, isKnownProduct, isLegacySpecificationFragment } of parsedItems) {
			if (isLegacySpecificationFragment && previousKnownItem) {
				previousKnownItem.qty = item.qty;
				previousKnownItem.unit = item.unit;
				continue;
			}
			repairedItems.push(item);
			previousKnownItem = isKnownProduct ? item : undefined;
		}
		return repairedItems;
	};

	/** 新格式 `【门槛｜价值￥N】：赠品`；解析不出价值时留空，交由零售价自动计算。 */
	const parseStructuredTier = (
		part: string,
		index: number,
		footnoteProducts: Record<number, DBProductItem>,
	): FormTierItem | null => {
		const strategyMatch = part.match(/^【(.*?)｜(?:价值￥\s*|价值：)(.*?)】：(.*)$/);
		if (!strategyMatch) return null;
		const value = formatPromotionValue(strategyMatch[2]);
		return {
			id: index + 1,
			threshold: strategyMatch[1].trim().replace(/赠$/, ''),
			value: value === '待填写' ? '' : `价值 ${value} 元`,
			items: parseQtyItems(strategyMatch[3].trim(), footnoteProducts),
		};
	};

	/** 旧格式 `A档: 满N元赠 赠品（价值M元）`。 */
	const parseLegacyTier = (
		part: string,
		index: number,
		footnoteProducts: Record<number, DBProductItem>,
	): FormTierItem => {
		const cleanPart = part.replace(/^[A-H]档:\s*/, '');
		const thresholdMatch = cleanPart.match(/满(.*?)赠/);
		const valueMatch = cleanPart.match(/[（(]价值(?:￥\s*)?(.*?)[）)]/);
		const giftMatch = cleanPart.match(/赠(.*?)[（(]\s*价值/);
		const giftText = giftMatch ? giftMatch[1].trim() : cleanPart.split('赠')[1]?.trim() || '';
		return {
			id: index + 1,
			threshold: thresholdMatch ? `满 ${thresholdMatch[1].trim()}` : '满 369 元',
			value: valueMatch ? `价值 ${formatPromotionValue(valueMatch[1])} 元` : '',
			items: parseQtyItems(giftText, footnoteProducts),
		};
	};

	const parseTiersFromText = (text: string, remarks = ''): FormTierItem[] => {
		if (!text || text === '***' || text.trim() === '') return [];
		const footnoteProducts = parseFootnoteProductMap(remarks);
		return text
			.split(/[；;\n]/)
			.map((part) => part.replace(/\u200B/g, '').trim())
			.filter(Boolean)
			.map(
				(part, index) =>
					parseStructuredTier(part, index, footnoteProducts) ||
					parseLegacyTier(part, index, footnoteProducts),
			)
			.filter((tier) => tier.threshold || tier.items.length);
	};

	return { parseFootnoteProductMap, findUniqueTierProduct, parseQtyItems, parseTiersFromText };
};

export type FormTierText = ReturnType<typeof createFormTierText>;
