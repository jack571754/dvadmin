export interface IconImage {
	file_id: number;
	sort: number;
	name: string;
	url: string;
}

export interface IconItem {
	id: number;
	short_name: string;
	interpretation: string;
	remark: string;
	brand: string;
	icon_category: string;
	scope_type: 'all' | 'selected';
	status: 'enabled' | 'disabled';
	images: IconImage[];
	default_image?: IconImage | null;
	product_codes?: string[];
	product_count: number;
	update_datetime?: string;
}

export interface ProductItem {
	id: number;
	product_code: string;
	product_name: string;
	nickname: string;
	brand: string;
	series: string;
	specification: string;
}

export interface ProductCodeValidationItem {
	id?: number;
	product_code: string;
	product_name?: string;
	nickname?: string;
	brand?: string;
	series?: string;
	specification?: string;
	status: 'valid' | 'missing' | 'brand_mismatch';
}

export interface ProductCodeValidationReport {
	items: ProductCodeValidationItem[];
	valid_codes: string[];
	missing: string[];
	brand_mismatches: string[];
	duplicates: string[];
}

export interface IconFormValue {
	id?: number;
	short_name: string;
	interpretation: string;
	remark: string;
	brand: string;
	icon_category: string;
	scope_type: 'all' | 'selected';
	status: 'enabled' | 'disabled';
	images: IconImage[];
	product_codes: string[];
}

export interface DialogContext {
	openAdd: () => void;
	openEdit: (row: IconItem) => void;
	openProducts: (row: IconItem) => void;
	changeStatus: (row: IconItem) => Promise<void>;
}
