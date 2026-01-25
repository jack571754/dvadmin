import {downloadFile, request} from '/@/utils/service';
import { UserPageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';

export const apiPrefix = '/api/dvadmin3_flow/flow_data/';
export function GetList(id:any,query: UserPageQuery) {
	return request({
		url: `/api/dvadmin3_flow/flow_data/${id}/get_crud_data/`,
		method: 'get',
		params: query,
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

export function GetCrudColumns(id: InfoReq) {
	return request({
		url: `/api/dvadmin3_flow/flow_data/${id}/get_crud_columns/`,
		method: 'get',
	});
}

export function exportData(id:any,params: any) {
	return downloadFile({
		url: `/api/dvadmin3_flow/flow_data/${id}/export_data/`,
		params: params,
		method: 'get',
	});
}