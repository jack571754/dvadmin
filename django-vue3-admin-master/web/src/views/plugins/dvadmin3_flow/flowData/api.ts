import { request } from '/@/utils/service';
import { UserPageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';

export const apiPrefix = '/api/dvadmin3_flow/flow_data/';

// 获取流程数据列表
export function GetList(query: UserPageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

// 获取流程数据详情
export function GetObj(id: InfoReq) {
	return request({
		url: apiPrefix + id,
		method: 'get',
	});
}

// 添加流程数据
export function AddObj(obj: AddReq) {
	return request({
		url: apiPrefix,
		method: 'post',
		data: obj,
	});
}

// 更新流程数据
export function UpdateObj(obj: EditReq) {
	return request({
		url: apiPrefix + obj.id + '/',
		method: 'put',
		data: obj,
	});
}

// 删除流程数据
export function DelObj(id: DelReq) {
	return request({
		url: apiPrefix + id + '/',
		method: 'delete',
		data: { id },
	});
}

// 提交审批
export function SubmitApproval(id: number) {
	return request({
		url: apiPrefix + id + '/submit/',
		method: 'post',
	});
}

// 审批通过
export function Approve(id: number, data: any) {
	return request({
		url: apiPrefix + id + '/approve/',
		method: 'post',
		data,
	});
}

// 审批拒绝
export function Reject(id: number, data: any) {
	return request({
		url: apiPrefix + id + '/reject/',
		method: 'post',
		data,
	});
}

// 获取字段权限
export function GetPermission() {
    return request({
        url: apiPrefix + 'field_permission/',
        method: 'get',
    });
}
