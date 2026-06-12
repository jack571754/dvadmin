export interface GiftInfo {
	name: string;
	qty: string;
}

export interface ProductInfo {
	nickname: string;
	brand: string;
	fullName: string;
	efficacy: string;
	spec: string;
	gifts: GiftInfo[];
	thresholdA: string;
	valueA: string;
	thresholdB: string;
	valueB: string;
	memberGift: string;
	memberValue: string;
	sellingPoint: string;
	price: string;
	startDate: string;
	endDate: string;
	remarks: string;
}

export interface DBProductItem {
	nickname: string;
	brand: string;
	fullName: string;
	spec: string;
}

export interface SelectableProduct {
	name: string;
	cleanName: string;
	suffix: string;
	desc: string;
	brand: string;
	fullName: string;
}

export interface ValidationError {
	productIndex: number;
	productLabel: string;
	field: string;
	fieldLabel: string;
	rule: 'required' | 'format' | 'range';
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
}
