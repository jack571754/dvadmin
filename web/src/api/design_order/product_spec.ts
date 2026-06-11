import { request } from '/@/utils/service';

const apiPrefix = '/api/design_order/product_specs/';

export function GetPermission() {
	return request({
		url: apiPrefix + 'field_permission/',
		method: 'get',
	});
}
