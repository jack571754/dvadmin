import { request } from '/@/utils/service';

const apiPrefix = '/api/design_order/icons/';

export interface IconListQuery {
	page?: number;
	limit?: number;
	search?: string;
	brand?: string;
	icon_category?: string;
	scope_type?: string;
	status?: string;
}

export function GetList(query: IconListQuery) {
	return request({ url: apiPrefix, method: 'get', params: query });
}

export function GetObj(id: number) {
	return request({ url: `${apiPrefix}${id}/`, method: 'get' });
}

export function AddObj(data: Record<string, unknown>) {
	return request({ url: apiPrefix, method: 'post', data });
}

export function UpdateObj(data: Record<string, any>) {
	return request({ url: `${apiPrefix}${data.id}/`, method: 'put', data });
}

export function DelObj(id: number) {
	return request({ url: `${apiPrefix}${id}/`, method: 'delete' });
}

export function ChangeStatus(id: number, status: 'enabled' | 'disabled') {
	return request({
		url: `${apiPrefix}${id}/${status === 'enabled' ? 'enable' : 'disable'}/`,
		method: 'post',
	});
}

export function BatchChangeStatus(ids: number[], status: 'enabled' | 'disabled') {
	return request({
		url: `${apiPrefix}batch-change-status/`,
		method: 'post',
		data: { ids, status },
	});
}

export function BatchDelete(ids: number[]) {
	return request({
		url: `${apiPrefix}batch-delete/`,
		method: 'post',
		data: { ids },
	});
}

export function UploadImage(file: File) {
	const data = new FormData();
	data.append('file', file);
	return request({
		url: `${apiPrefix}upload-image/`,
		method: 'post',
		data,
		headers: { 'Content-Type': 'multipart/form-data' },
		timeout: 20000,
	});
}

export function GetProducts(id: number, params: Record<string, unknown>) {
	return request({
		url: `${apiPrefix}${id}/products/`,
		method: 'get',
		params,
	});
}

export function BatchAddProducts(id: number, productCodes: string | string[]) {
	return request({
		url: `${apiPrefix}${id}/products/batch-add/`,
		method: 'post',
		data: { product_codes: productCodes },
	});
}

export function BatchRemoveProducts(id: number, productCodes: string | string[]) {
	return request({
		url: `${apiPrefix}${id}/products/batch-remove/`,
		method: 'post',
		data: { product_codes: productCodes },
	});
}

export function GetProductOptions(params: Record<string, unknown>) {
	return request({
		url: `${apiPrefix}product-options/`,
		method: 'get',
		params,
	});
}

export function ValidateProductCodes(productCodes: string[], brand: string) {
	return request({
		url: `${apiPrefix}validate-product-codes/`,
		method: 'post',
		data: { product_codes: productCodes, brand },
	});
}

export function GetBrands() {
	return request({ url: `${apiPrefix}brands/`, method: 'get' });
}

export function GetCategories() {
	return request({ url: `${apiPrefix}categories/`, method: 'get' });
}

export function ResolveByProducts(productCodes: string[]) {
	return request({
		url: `${apiPrefix}resolve-by-products/`,
		method: 'post',
		data: { product_codes: productCodes },
	});
}

export function ResolveImageUrls(fileIds: number[]) {
	return request({
		url: `${apiPrefix}resolve-image-urls/`,
		method: 'post',
		data: { file_ids: fileIds },
	});
}
