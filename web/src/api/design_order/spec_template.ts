import { AddReq, DelReq, EditReq, PageQuery } from '@fast-crud/fast-crud';

import { request } from '/@/utils/service';

const apiPrefix = '/api/design_order/spec_templates/';

export function GetList(query: PageQuery) {
	return request({ url: apiPrefix, method: 'get', params: query });
}

export function GetObj(id: number) {
	return request({ url: `${apiPrefix}${id}/`, method: 'get' });
}

export function AddObj(obj: AddReq) {
	return request({ url: apiPrefix, method: 'post', data: obj });
}

export function UpdateObj(obj: EditReq) {
	return request({ url: `${apiPrefix}${obj.id}/`, method: 'put', data: obj });
}

export function DelObj(id: DelReq) {
	return request({ url: `${apiPrefix}${id}/`, method: 'delete', data: { id } });
}

export function GetPermission() {
	return request({ url: `${apiPrefix}field_permission/`, method: 'get' });
}

export function GetAvailableTemplates(platform: string) {
	return request({
		url: `${apiPrefix}available/`,
		method: 'get',
		params: { platform },
	});
}

export function GetTemplateSchema(templateCode: string) {
	return request({
		url: `${apiPrefix}schema/`,
		method: 'get',
		params: { template_code: templateCode },
	});
}
