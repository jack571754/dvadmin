import { AddReq, DelReq, EditReq, PageQuery } from '@fast-crud/fast-crud';

import { request } from '/@/utils/service';


const apiPrefix = '/api/design_order/stores/';

export function GetList(query: PageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
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
		url: `${apiPrefix}${obj.id}/`,
		method: 'put',
		data: obj,
	});
}

export function DelObj(id: DelReq) {
	return request({
		url: `${apiPrefix}${id}/`,
		method: 'delete',
	});
}

export function SetStatus(id: number, status: boolean) {
	return request({
		url: `${apiPrefix}${id}/set_status/`,
		method: 'post',
		data: { status },
	});
}

export function GetPermission() {
	return request({
		url: `${apiPrefix}field_permission/`,
		method: 'get',
	});
}
