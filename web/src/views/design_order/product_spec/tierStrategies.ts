import type { DBProductItem } from './types';
import { formatProductQuantity } from './utils';
import {
	resolveProductReference,
	type ProductReference,
} from './productFootnotes';

export interface TierGiftItem extends ProductReference {
	qty: number;
	unit: string;
}

export interface TierStrategy {
	id: number;
	threshold: string;
	value: string;
	items: TierGiftItem[];
}

type FootnoteResolver = (item: TierGiftItem) => number | undefined;

const stripSuffixes = (value: string): string =>
	String(value || '').replace(/\[[\d\s,[\]]+\]/g, '').trim();

const parseQuantityItem = (
	value: string,
	products: readonly DBProductItem[],
): TierGiftItem | null => {
	const match = stripSuffixes(value).match(/^(.*?)\s*[×x]\s*(\d+)\s*(.*)$/i);
	const productText = match?.[1]?.trim() || stripSuffixes(value);
	const reference = resolveProductReference({
		productCode: '',
		nickname: productText,
		fullName: '',
		spec: '',
	}, products);
	if (!reference.nickname) return null;
	const product = products.find((item) => item.productCode === reference.productCode);
	return {
		...reference,
		qty: match ? Math.max(Number(match[2]) || 1, 1) : 1,
		unit: match?.[3]?.trim() || product?.unit || '个',
	};
};

const parseTierPart = (
	part: string,
	index: number,
	products: readonly DBProductItem[],
): TierStrategy => {
	const cleanPart = part.trim().replace(/^[A-H]档:\s*/, '');
	const thresholdMatch = cleanPart.match(/满(.*?)赠/);
	const valueMatch = cleanPart.match(/[（(]价值(.*?)[）)]/);
	const giftMatch = cleanPart.match(/赠(.*?)[（(]/);
	const giftText = giftMatch ? giftMatch[1].trim() : cleanPart.split('赠')[1]?.trim() || '';
	const items = giftText.split(/\s*\|\s*|\s*\+\s*/)
		.map((item) => parseQuantityItem(item, products))
		.filter((item): item is TierGiftItem => Boolean(item));
	return {
		id: index + 1,
		threshold: thresholdMatch ? `满 ${thresholdMatch[1].trim()}` : '满 369 元',
		value: valueMatch ? `价值 ${valueMatch[1].trim()}` : '价值 143 元',
		items,
	};
};

export const parseTierStrategies = (
	text: string,
	products: readonly DBProductItem[],
): TierStrategy[] => {
	if (!text || text === '***' || !text.trim()) return [];
	return text.split(/[；;]/)
		.map((part, index) => parseTierPart(part, index, products))
		.filter((tier) => tier.threshold || tier.items.length);
};

const formatTierItem = (
	item: TierGiftItem,
	resolveFootnote?: FootnoteResolver,
): string => {
	const number = resolveFootnote?.(item);
	const nickname = number ? `${item.nickname}[${number}]` : item.nickname;
	return `${nickname}${formatProductQuantity(item.qty, item.unit)}`;
};

export const formatTierStrategies = (
	tiers: readonly TierStrategy[],
	resolveFootnote?: FootnoteResolver,
): string => {
	const labels = 'ABCDEFGH';
	return tiers.map((tier, index) => {
		const items = tier.items.map((item) => formatTierItem(item, resolveFootnote));
		return `${labels[index]}档: ${tier.threshold}赠 ${items.join(' | ') || '—'}（${tier.value}）`;
	}).join('；');
};

export const createTierGiftItem = (product: DBProductItem): TierGiftItem => ({
	productCode: product.productCode,
	nickname: product.nickname,
	fullName: product.fullName,
	spec: product.spec,
	qty: 1,
	unit: product.unit || '个',
});
