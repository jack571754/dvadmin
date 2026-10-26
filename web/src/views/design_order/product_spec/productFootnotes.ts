import type { DBProductItem } from './types';
import { normalizeProductName } from './productDisplay';

export interface ProductReference {
	productCode: string;
	nickname: string;
	fullName: string;
	spec: string;
}

export interface NumberedProductReference extends ProductReference {
	key: string;
	number: number;
}

export interface ProductNumberRegistry {
	register(reference: ProductReference): NumberedProductReference | undefined;
	find(reference: ProductReference): NumberedProductReference | undefined;
	readonly ordered: readonly NumberedProductReference[];
}

type FootnoteProductReference = Pick<
	NumberedProductReference,
	'number' | 'nickname' | 'fullName'
>;

const normalizeIdentityPart = (value: string): string =>
	String(value || '').trim().toLowerCase().replace(/\s+/g, '');

const normalizeProductNamePart = (value: string): string =>
	normalizeIdentityPart(normalizeProductName(value));

const getProductReferenceKey = (reference: ProductReference): string => {
	const nickname = normalizeProductNamePart(reference.nickname);
	return `nickname:${nickname}`;
};

const mergeProductReference = (
	reference: ProductReference,
	product?: DBProductItem,
): ProductReference => ({
	productCode: product?.productCode || reference.productCode || '',
	nickname: reference.nickname || product?.nickname || '',
	fullName: product?.fullName || reference.fullName || '',
	spec: reference.spec || product?.spec || '',
});

const findMatchingProduct = (
	reference: ProductReference,
	products: readonly DBProductItem[],
): DBProductItem | undefined => {
	const productCode = normalizeIdentityPart(reference.productCode);
	if (productCode) {
		const byCode = products.find(
			(item) => normalizeIdentityPart(item.productCode) === productCode,
		);
		if (byCode) return byCode;
	}
	const fullName = normalizeIdentityPart(reference.fullName);
	const nickname = normalizeProductNamePart(reference.nickname);
	const spec = normalizeIdentityPart(reference.spec);
	const candidates = products.filter((item) => {
		const matchesName = (
			(fullName && normalizeIdentityPart(item.fullName) === fullName)
			|| (nickname && normalizeProductNamePart(item.nickname) === nickname)
		);
		if (!matchesName) return false;
		return !spec || normalizeIdentityPart(item.spec) === spec;
	});
	return candidates.length === 1 ? candidates[0] : undefined;
};

export const resolveProductReference = (
	reference: ProductReference,
	products: readonly DBProductItem[],
): ProductReference => mergeProductReference(
	reference,
	findMatchingProduct(reference, products),
);

const normalizeProductReference = (
	reference: ProductReference,
	products: readonly DBProductItem[],
): ProductReference | undefined => {
	const resolved = resolveProductReference(reference, products);
	const nickname = normalizeProductName(
		resolved.nickname || reference.nickname || resolved.fullName || reference.fullName,
	);
	if (!nickname) return undefined;
	return {
		productCode: String(resolved.productCode || reference.productCode || '').trim(),
		nickname,
		fullName: String(resolved.fullName || reference.fullName || '').trim(),
		spec: String(resolved.spec || reference.spec || '').trim(),
	};
};

export const formatProductFootnote = (
	reference: FootnoteProductReference,
): string | undefined => {
	const nickname = normalizeProductName(reference.nickname);
	const fullName = String(reference.fullName || '').trim();
	if (!nickname || !fullName) return undefined;
	return `[${reference.number}]指${fullName}`;
};

export const createProductNumberRegistry = (
	products: readonly DBProductItem[],
): ProductNumberRegistry => {
	const byKey = new Map<string, NumberedProductReference>();
	const ordered: NumberedProductReference[] = [];
	const find = (reference: ProductReference): NumberedProductReference | undefined => {
		const normalized = normalizeProductReference(reference, products);
		return normalized ? byKey.get(getProductReferenceKey(normalized)) : undefined;
	};
	const register = (
		reference: ProductReference,
	): NumberedProductReference | undefined => {
		const normalized = normalizeProductReference(reference, products);
		if (!normalized) return undefined;
		const key = getProductReferenceKey(normalized);
		const existing = byKey.get(key);
		if (existing) return existing;
		const numbered = { ...normalized, key, number: ordered.length + 1 };
		byKey.set(key, numbered);
		ordered.push(numbered);
		return numbered;
	};
	return { register, find, ordered };
};
