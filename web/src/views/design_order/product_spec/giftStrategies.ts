import type { DBProductItem, GiftInfo } from './types';
import { formatProductQuantity } from './utils';

export interface GiftStrategyItem {
	id: string;
	productCode: string;
	nickname: string;
	brand: string;
	fullName: string;
	spec: string;
	qty: number;
	unit: string;
	retailPrice: string;
}

export interface GiftStrategy {
	id: string;
	name: string;
	value: string;
	items: GiftStrategyItem[];
}

const createId = (prefix: string): string =>
	`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const cleanNickname = (value: string): string => value.replace(/\[\d+\]/g, '').trim();
export const STRATEGY_SPACER_LINE = '\u200B';

export const formatSpacedStrategyLines = (lines: readonly string[]): string => {
	if (!lines.length) return '';
	const separator = `\n${STRATEGY_SPACER_LINE}\n`;
	return `${STRATEGY_SPACER_LINE}\n${lines.join(separator)}\n${STRATEGY_SPACER_LINE}`;
};

export const createGiftStrategy = (): GiftStrategy => ({
	id: createId('strategy'),
	name: '',
	value: '',
	items: [],
});

export const createGiftStrategyItem = (product: DBProductItem): GiftStrategyItem => ({
	id: createId('gift'),
	productCode: product.productCode,
	nickname: product.nickname,
	brand: product.brand,
	fullName: product.fullName,
	spec: product.spec,
	qty: 1,
	unit: product.unit || '份',
	retailPrice: product.retailPrice,
});

const formatAmount = (amount: number): string =>
	amount.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');

export interface PricedGiftItem {
	qty: number;
	retailPrice: string;
}

// 零售价缺失或非数字时返回空串，交由调用方回退为“待填写”。
export const calculateGiftValue = (items: readonly PricedGiftItem[]): string => {
	if (!items.length) return '';
	if (items.some((item) => !String(item.retailPrice ?? '').trim())) return '';
	const prices = items.map((item) => Number(item.retailPrice));
	if (prices.some((price) => !Number.isFinite(price))) return '';
	const total = items.reduce((sum, item, index) => sum + prices[index] * item.qty, 0);
	return `价值 ${formatAmount(total)} 元`;
};

export const calculateGiftStrategyValue = (strategy: GiftStrategy): string =>
	calculateGiftValue(strategy.items);

const formatGiftItem = (
	item: GiftStrategyItem,
	getSuffix?: (item: GiftStrategyItem) => number | undefined,
): string => {
	const normalizedSpec = String(item.spec || '').trim();
	const specification = normalizedSpec ? ` ${normalizedSpec}` : '';
	const suffix = getSuffix?.(item);
	const nickname = suffix === undefined ? item.nickname : `${item.nickname}[${suffix}]`;
	return `${nickname}${specification}${formatProductQuantity(item.qty, item.unit)}`;
};

export const formatPromotionValue = (value: string): string => {
	const normalized = value.trim()
		.replace(/^价值\s*[:：]?\s*/, '')
		.replace(/^￥\s*/, '')
		.replace(/\s*元\s*$/, '');
	return normalized || '待填写';
};

export const formatStrategyDisplayLine = (
	title: string,
	value: string,
	items: string,
): string => `【${title}｜价值￥ ${formatPromotionValue(value)}】：${items}`;

export const formatGiftStrategies = (
	strategies: GiftStrategy[],
	getSuffix?: (item: GiftStrategyItem) => number | undefined,
): string => formatSpacedStrategyLines(
	strategies.map((strategy) => {
		const name = strategy.name.trim() || '未命名策略';
		const items = strategy.items.length
			? strategy.items.map((item) => formatGiftItem(item, getSuffix)).join('+')
			: '暂未添加赠品';
		return formatStrategyDisplayLine(name, strategy.value, items);
	}),
);

const parseFormattedItem = (value: string): GiftStrategyItem | null => {
	const match = value.trim().match(/^(.*?)\s*×\s*(\d+)\s*(.*)$/);
	const productText = (match?.[1] || value).trim();
	if (!productText) return null;
	const legacyProduct = productText.match(/^(.*?)(?:（规格：(.*?)）)$/);
	const numberedProduct = productText.match(/^(.*?\[\d+\])\s*(.*)$/);
	const plainProduct = productText.match(/^(.*?)\s+(\d+(?:\.\d+)?\s*(?:kg|mg|ml|g|l)(?=\b|[×*x/]).*)$/i);
	const nickname = legacyProduct?.[1] || numberedProduct?.[1] || plainProduct?.[1] || productText;
	const specification = legacyProduct?.[2] || numberedProduct?.[2] || plainProduct?.[2] || '';
	return {
		id: createId('gift'),
		productCode: '',
		nickname: cleanNickname(nickname),
		brand: '',
		fullName: '',
		spec: specification.trim(),
		qty: match ? Number(match[2]) : 1,
		unit: match?.[3] || '',
		retailPrice: '',
	};
};

const parseFormattedStrategy = (line: string): GiftStrategy | null => {
	const match = line.trim().match(/^(?:赠品策略\s+\d+\s*)?【(.*?)｜(?:价值￥\s*|价值：)(.*?)】：(.*)$/);
	if (!match) return null;
	const itemText = match[3].trim();
	const items = itemText === '暂未添加赠品'
		? []
		: itemText.split(/[；;+]/).map(parseFormattedItem).filter(Boolean) as GiftStrategyItem[];
	const parsedValue = match[2].trim();
	const value = /^\d+(?:\.\d+)?$/.test(parsedValue)
		? `价值 ${parsedValue} 元`
		: parsedValue;
	return { id: createId('strategy'), name: match[1], value, items };
};

const parseLegacyGifts = (text: string): GiftStrategy[] => {
	const items = text.split('|').map((part) => {
		const cleanPart = part.trim().replace(/^🎁\s*/, '');
		const match = cleanPart.match(/^(.*?)\s+x\s+(\d+)\s*(.*)$/i);
		if (!match) return null;
		return {
			id: createId('gift'),
			productCode: '',
			nickname: cleanNickname(match[1]),
			brand: '',
			fullName: '',
			spec: '',
			qty: Number(match[2]),
			unit: match[3] || '份',
			retailPrice: '',
		};
	}).filter(Boolean) as GiftStrategyItem[];
	return items.length ? [{ ...createGiftStrategy(), name: '历史赠品', items }] : [];
};

const isStructuredGiftStrategies = (value: unknown): value is GiftStrategy[] =>
	Array.isArray(value) && value.every((item) => item && typeof item === 'object' && 'items' in item);

export const parseGiftStrategies = (value: unknown): GiftStrategy[] => {
	if (!value || value === '***') return [];
	if (isStructuredGiftStrategies(value)) return value;
	const text = String(value).trim();
	if (!text) return [];
	if (text.startsWith('[')) {
		const parsed = JSON.parse(text);
		if (isStructuredGiftStrategies(parsed)) return parsed;
	}
	const strategies = text.split('\n').map(parseFormattedStrategy).filter(Boolean) as GiftStrategy[];
	return strategies.length ? strategies : parseLegacyGifts(text);
};

const normalizeProductText = (value: string): string =>
	String(value || '').toLowerCase().replace(/[\s×*x]/g, '');

const findGiftProduct = (
	item: GiftStrategyItem,
	products: DBProductItem[],
): DBProductItem | undefined => {
	if (item.productCode) {
		const product = products.find((candidate) => candidate.productCode === item.productCode);
		if (product) return product;
	}
	const candidates = products.filter((candidate) =>
		candidate.nickname === item.nickname || candidate.fullName === item.fullName);
	const normalizedSpec = normalizeProductText(item.spec);
	const exactSpec = candidates.find((candidate) =>
		normalizeProductText(candidate.spec) === normalizedSpec);
	if (exactSpec) return exactSpec;
	return candidates.length === 1 ? candidates[0] : undefined;
};

export const enrichGiftStrategies = (
	strategies: GiftStrategy[],
	products: DBProductItem[],
): GiftStrategy[] => strategies.map((strategy) => ({
	...strategy,
	items: strategy.items.map((item) => {
		const product = findGiftProduct(item, products);
		return product ? { ...item, brand: product.brand, fullName: product.fullName,
			productCode: product.productCode, retailPrice: product.retailPrice,
			spec: item.spec || product.spec, unit: item.unit || product.unit || '份' } : item;
	}),
}));

export const flattenGiftStrategies = (strategies: GiftStrategy[]): GiftInfo[] =>
	strategies.flatMap((strategy) => strategy.items.map((item) => ({
		name: item.nickname,
		qty: `${item.qty}${item.unit}`,
	})));
