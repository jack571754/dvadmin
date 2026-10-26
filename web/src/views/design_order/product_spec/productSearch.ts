import type { DBProductItem } from './types';

export const getProductSelectionKey = (product: DBProductItem): string =>
	product.productCode || [product.nickname, product.spec, product.fullName].join('__');
