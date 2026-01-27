import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';

// API 前缀
const apiPrefix = '/api/book/';

// ==================== 图书相关接口 ====================

/**
 * 获取图书列表
 */
export function getBookList(query: PageQuery) {
	return request({
		url: apiPrefix + 'book/',
		method: 'get',
		params: query,
	});
}

/**
 * 获取图书详情
 */
export function getBookDetail(id: InfoReq) {
	return request({
		url: apiPrefix + `book/${id}/`,
		method: 'get',
	});
}

/**
 * 新增图书
 */
export function addBook(obj: AddReq) {
	return request({
		url: apiPrefix + 'book/',
		method: 'post',
		data: obj,
	});
}

/**
 * 更新图书
 */
export function updateBook(obj: EditReq) {
	return request({
		url: apiPrefix + `book/${obj.id}/`,
		method: 'put',
		data: obj,
	});
}

/**
 * 删除图书
 */
export function deleteBook(id: DelReq) {
	return request({
		url: apiPrefix + `book/${id}/`,
		method: 'delete',
		data: { id },
	});
}

/**
 * 获取可借阅图书列表
 */
export function getAvailableBooks(query?: PageQuery) {
	return request({
		url: apiPrefix + 'book/available/',
		method: 'get',
		params: query,
	});
}

// ==================== 图书分类相关接口 ====================

/**
 * 获取分类列表
 */
export function getCategoryList(params?: object) {
	return request({
		url: apiPrefix + 'category/',
		method: 'get',
		params,
	});
}

/**
 * 获取分类树形结构
 */
export function getCategoryTree() {
	return request({
		url: apiPrefix + 'category/tree/',
		method: 'get',
	});
}

/**
 * 获取分类详情
 */
export function getCategoryDetail(id: InfoReq) {
	return request({
		url: apiPrefix + `category/${id}/`,
		method: 'get',
	});
}

/**
 * 新增分类
 */
export function addCategory(obj: AddReq) {
	return request({
		url: apiPrefix + 'category/',
		method: 'post',
		data: obj,
	});
}

/**
 * 更新分类
 */
export function updateCategory(obj: EditReq) {
	return request({
		url: apiPrefix + `category/${obj.id}/`,
		method: 'put',
		data: obj,
	});
}

/**
 * 删除分类
 */
export function deleteCategory(id: DelReq) {
	return request({
		url: apiPrefix + `category/${id}/`,
		method: 'delete',
		data: { id },
	});
}

// ==================== 图书作者相关接口 ====================

/**
 * 获取作者列表
 */
export function getAuthorList(query: PageQuery) {
	return request({
		url: apiPrefix + 'author/',
		method: 'get',
		params: query,
	});
}

/**
 * 获取作者详情
 */
export function getAuthorDetail(id: InfoReq) {
	return request({
		url: apiPrefix + `author/${id}/`,
		method: 'get',
	});
}

/**
 * 新增作者
 */
export function addAuthor(obj: AddReq) {
	return request({
		url: apiPrefix + 'author/',
		method: 'post',
		data: obj,
	});
}

/**
 * 更新作者
 */
export function updateAuthor(obj: EditReq) {
	return request({
		url: apiPrefix + `author/${obj.id}/`,
		method: 'put',
		data: obj,
	});
}

/**
 * 删除作者
 */
export function deleteAuthor(id: DelReq) {
	return request({
		url: apiPrefix + `author/${id}/`,
		method: 'delete',
		data: { id },
	});
}

// ==================== 图书出版社相关接口 ====================

/**
 * 获取出版社列表
 */
export function getPublisherList(query: PageQuery) {
	return request({
		url: apiPrefix + 'publisher/',
		method: 'get',
		params: query,
	});
}

/**
 * 获取出版社详情
 */
export function getPublisherDetail(id: InfoReq) {
	return request({
		url: apiPrefix + `publisher/${id}/`,
		method: 'get',
	});
}

/**
 * 新增出版社
 */
export function addPublisher(obj: AddReq) {
	return request({
		url: apiPrefix + 'publisher/',
		method: 'post',
		data: obj,
	});
}

/**
 * 更新出版社
 */
export function updatePublisher(obj: EditReq) {
	return request({
		url: apiPrefix + `publisher/${obj.id}/`,
		method: 'put',
		data: obj,
	});
}

/**
 * 删除出版社
 */
export function deletePublisher(id: DelReq) {
	return request({
		url: apiPrefix + `publisher/${id}/`,
		method: 'delete',
		data: { id },
	});
}

// ==================== 图书借阅相关接口 ====================

/**
 * 获取借阅记录列表
 */
export function getBorrowList(query: PageQuery) {
	return request({
		url: apiPrefix + 'borrow/',
		method: 'get',
		params: query,
	});
}

/**
 * 获取借阅记录详情
 */
export function getBorrowDetail(id: InfoReq) {
	return request({
		url: apiPrefix + `borrow/${id}/`,
		method: 'get',
	});
}

/**
 * 创建借阅记录
 */
export function addBorrow(obj: AddReq) {
	return request({
		url: apiPrefix + 'borrow/',
		method: 'post',
		data: obj,
	});
}

/**
 * 归还图书
 */
export function returnBook(id: number) {
	return request({
		url: apiPrefix + `borrow/${id}/return_book/`,
		method: 'post',
	});
}

/**
 * 续借图书
 */
export function renewBook(id: number) {
	return request({
		url: apiPrefix + `borrow/${id}/renew/`,
		method: 'post',
	});
}

// ==================== 图书预约相关接口 ====================

/**
 * 获取预约记录列表
 */
export function getReservationList(query: PageQuery) {
	return request({
		url: apiPrefix + 'reservation/',
		method: 'get',
		params: query,
	});
}

/**
 * 创建预约
 */
export function addReservation(obj: AddReq) {
	return request({
		url: apiPrefix + 'reservation/',
		method: 'post',
		data: obj,
	});
}

/**
 * 取消预约
 */
export function cancelReservation(id: DelReq) {
	return request({
		url: apiPrefix + `reservation/${id}/`,
		method: 'delete',
		data: { id },
	});
}
