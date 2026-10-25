import { request } from '/@/utils/service';
import XEUtils from 'xe-utils';
import { captureSession } from '/@/shared/access/sessionEvents';
/**
 * 获取 角色-菜单
 * @param query
 */
export function getRoleMenu(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/get_role_menu/',
		method: 'get',
		params: query,
	}).then((res: any) => {
		return XEUtils.toArrayTree(res.data, { key: 'id', parentKey: 'parent', children: 'children', strict: false });
	});
}
/**
 * 设置 角色-菜单
 * @param data
 * @returns
 */
export function setRoleMenu(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu/',
		method: 'put',
		data,
	});
}
/**
 * 获取 角色-菜单-按钮-列字段
 * @param query
 */
export function getRoleMenuBtnField(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/get_role_menu_btn_field/',
		method: 'get',
		params: query,
	});
}

/**
 * 批量设置 角色-菜单-按钮
 * @param data { roleId, menuId, buttons: [{btnId, isCheck, data_range, dept}] }
 */
export function batchSetRoleMenuBtn(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/batch_set_role_menu_btn/',
		method: 'put',
		data,
	});
}

/**
 * 设置 角色-菜单-按钮
 * @param data
 */
export function setRoleMenuBtn(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu_btn/',
		method: 'put',
		data,
	});
}

/**
 * 设置 角色-菜单-列字段
 * @param data
 */
export function setRoleMenuField(roleId: string | number | undefined, data: object) {
	return request({
		url: `/api/system/role_menu_button_permission/${roleId}/set_role_menu_field/`,
		method: 'put',
		data,
	});
}

/**
 * 设置 角色-菜单-按钮-数据权限
 * @param query
 * @returns
 */
export function setRoleMenuBtnDataRange(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu_btn_data_range/',
		method: 'put',
		data,
	});
}

/**
 * 获取当前用户角色下所能授权的部门
 * @param query
 * @returns
 */
export function getRoleToDeptAll(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/role_to_dept_all/',
		method: 'get',
		params: query,
	});
}

/**
 * 获取所有用户
 * @param query
 * @returns
 */
export async function getAllUsers() {
    const assertCurrent = captureSession();
    const users = new Map<string | number, { id: string | number; name: string }>();
    for (let page = 1; ; page++) {
        assertCurrent();
        const response = await request({ url: '/api/system/user/', method: 'get', params: { page, limit: 200 } });
        assertCurrent();
        const previous = users.size;
        for (const row of response.data) users.set(row.id, { id: row.id, name: row.name });
        if (response.data.length === 0 || users.size >= response.total || response.data.length < response.limit) return [...users.values()];
        if (users.size === previous) throw new Error('User pagination made no progress');
    }
}

/**
 * 设置角色-用户
 * @param query
 * @returns
 */
export function setRoleUsers(roleId: string | number | undefined, data: object) {
	return request({
		url: `/api/system/role/${roleId}/set_role_users/`,
		method: 'put',
		data,
	});
}
