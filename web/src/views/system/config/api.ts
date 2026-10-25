import { request } from '/@/utils/service';
import { UserPageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';
import XEUtils from 'xe-utils';

export const apiPrefix = '/api/system/system_config/';
export function GetList(query: UserPageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

// 获取某个分组下的所有配置项
export function GetDetail(parentKey: string, language?: string) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: {
			parent__key: parentKey,
			limit: 999,
			language: language,
		},
	});
}
export function GetObj(id: InfoReq) {
	return request({
		url: apiPrefix + id,
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

/*
获取所有的model及字段信息
 */
export function GetAssociationTable() {
	return request({
		url: apiPrefix + 'get_association_table/',
		method: 'get',
		params: {},
	});
}

export function saveContent(data: any) {
	return request({
		url: apiPrefix + 'save_content/',
		method: 'put',
		data: data,
	});
}
