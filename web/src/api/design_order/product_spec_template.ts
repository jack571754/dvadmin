import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq } from '@fast-crud/fast-crud';

const apiPrefix = '/api/design_order/product_spec_templates/';

export function GetList(query?: PageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

export function GetObj(id: any) {
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

export function GetTemplateTypes() {
	return request({
		url: apiPrefix + 'template_types/',
		method: 'get',
	});
}

export function RegisterFieldPermissions(id: any) {
	return request({
		url: `${apiPrefix}${id}/register_field_permissions/`,
		method: 'post',
	});
}
