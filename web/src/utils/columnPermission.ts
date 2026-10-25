import { applyFieldPolicy, normalizeFieldPolicy } from '../shared/api/fieldPolicy';
import {useColumnPermission} from '/@/stores/columnPermission';

type permissionType = 'is_create' | 'is_query' | 'is_update';

export const columnPermission = (key: string, type: permissionType): boolean => {
	const permissions = useColumnPermission().permission || [];

	return !!permissions.some((i) => i.field_name === key && i[type]);
};

/**
 * 处理字段信息权限
 * @param func 获取字段信息的接口函数
 * @param crudOptions 原始的crudOptions信息
 * @param excludeColumn 需要排除的列
 */
export const handleColumnPermission = async (func: Function, crudOptions: any,excludeColumn:string[]=[]) => {
	const res = await func();
	if(crudOptions.pagination==undefined){
		crudOptions['pagination'] = {
			show:true
		}
	}
    const excluded = ['checked', '_index', 'id', 'create_datetime', 'update_datetime', ...excludeColumn];
    crudOptions.columns = applyFieldPolicy(crudOptions.columns, normalizeFieldPolicy(res.data), excluded);
    return crudOptions;
};
