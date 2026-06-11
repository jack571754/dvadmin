import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq } from '@fast-crud/fast-crud';

const apiPrefix = '/api/design_order/product_spec_submissions/';

export function GetList(query: PageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

export function GetObj(id: number) {
	return request({
		url: apiPrefix + id + '/',
		method: 'get',
	});
}

export function AddObj(obj: AddReq) {
	return request({
		url: apiPrefix,
		method: 'post',
		data: obj,
	});
}

export function UpdateObj(obj: EditReq) {
	return request({
		url: apiPrefix + obj.id + '/',
		method: 'put',
		data: obj,
	});
}

export function DelObj(id: DelReq) {
	return request({
		url: apiPrefix + id + '/',
		method: 'delete',
		data: { id },
	});
}

export function GetPermission() {
	return request({
		url: apiPrefix + 'field_permission/',
		method: 'get',
	});
}

export function CopyObj(id: number, data: { name: string; shop: string }) {
	return request({
		url: `${apiPrefix}${id}/copy/`,
		method: 'post',
		data: data,
	});
}
