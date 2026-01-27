import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq } from '@fast-crud/fast-crud';
import * as bookApi from '../book/api';

const apiPrefix = '/api/book/borrow/';

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

// 续借操作
export function renewBorrow(borrowId: number) {
	return request({
		url: apiPrefix + borrowId + '/renew/',
		method: 'post',
	});
}

// 导出图书相关的操作（从 book 模块导入）
export const borrowBook = bookApi.borrowBook;
export const returnBook = bookApi.returnBook;
