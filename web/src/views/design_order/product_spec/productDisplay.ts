const MISSING_PRODUCT_NAMES = new Set(['-', '--', '—']);

export interface ProductDisplaySource {
	nickname?: unknown;
	shortName?: unknown;
	fullName?: unknown;
	productCode?: unknown;
}

export const normalizeProductName = (value: unknown): string => {
	const text = String(value ?? '').trim();
	return text && !MISSING_PRODUCT_NAMES.has(text) ? text : '';
};

export const isMissingProductName = (value: unknown): boolean =>
	!normalizeProductName(value);

export const resolveProductDisplayName = (source: ProductDisplaySource): string =>
	normalizeProductName(source.nickname)
	|| normalizeProductName(source.shortName)
	|| normalizeProductName(source.fullName)
	|| normalizeProductName(source.productCode);
