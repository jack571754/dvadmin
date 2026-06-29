import * as api from '/@/api/design_order/product_spec_template';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import { ElMessage, ElMessageBox } from 'element-plus';
import FieldEditorTable from './FieldEditorTable.vue';
import ValidationEditor from './ValidationEditor.vue';

const KIND_OPTIONS = ['text', 'longtext', 'mention', 'gifts', 'tier', 'dateRange', 'price'];

function validateForm(form: any): string[] {
	const errs: string[] = [];
	if (!form.templateType) {
		errs.push('模板标识必填');
	} else if (!/^[a-zA-Z0-9_]+$/.test(form.templateType)) {
		errs.push('模板标识仅允许字母/数字/下划线');
	}
	if (!form.label) errs.push('模板名称必填');
	const rpb = Number(form.rowsPerBlock);
	if (!rpb || rpb < 5) errs.push('每块行数必须 >=5');
	if (Number(form.columnsPerBlock) !== 6) errs.push('每块列数当前必须为 6');
	const fs = form.fields || [];
	if (fs.length !== rpb - 2) errs.push(`字段数必须 = 每块行数-2 = ${rpb - 2}，当前 ${fs.length}`);
	const rows = fs.map((f: any) => Number(f.row)).sort((a: number, b: number) => a - b);
	const expected = Array.from({ length: rpb - 2 }, (_, i) => i + 1);
	if (JSON.stringify(rows) !== JSON.stringify(expected)) errs.push('行号必须为 1..(行数-2) 连续唯一');
	const priceF = fs.find((f: any) => f.kind === 'price');
	if (!priceF || Number(priceF.row) !== rpb - 2 || priceF.key !== 'price') errs.push(`第 ${rpb - 2} 行必须为 key='price', kind='price'`);
	const dateF = fs.find((f: any) => f.kind === 'dateRange');
	if (!dateF || Number(dateF.row) !== rpb - 3 || dateF.key !== 'dateRange') errs.push(`第 ${rpb - 3} 行必须为 key='dateRange', kind='dateRange'`);
	fs.forEach((f: any, i: number) => {
		if (!f.key) errs.push(`第 ${i + 1} 行 key 必填`);
		if (!f.label) errs.push(`第 ${i + 1} 行 label 必填`);
		if (!KIND_OPTIONS.includes(f.kind)) errs.push(`第 ${i + 1} 行 kind 非法`);
	});
	return errs;
}

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		const res: any = await api.GetList(query);
		// 后端 list 返回 DetailResponse({code, data:[...]}) 平铺数组（无分页字段），
		// 这里手动包装为 fast-crud 分页结构；同时用局部 transformRes 透传，
		// 避免被 settings.ts 全局 transformRes（按 res.data/res.page/res.limit 取值）二次错误转换
		const list = Array.isArray(res) ? res : (res.data || []);
		return { records: list, total: list.length, currentPage: 1, pageSize: 100 };
	};
	const editRequest = async ({ form, row }: EditReq) => {
		const errs = validateForm(form);
		if (errs.length) { ElMessage.error(errs[0]); throw new Error(errs[0]); }
		form.id = row.id;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		const errs = validateForm(form);
		if (errs.length) { ElMessage.error(errs[0]); throw new Error(errs[0]); }
		return await api.AddObj(form);
	};

	return {
		crudOptions: {
			request: { pageRequest, transformRes: ({ res }: any) => res, addRequest, editRequest, delRequest },
			rowHandle: {
				fixed: 'right',
				width: 240,
				buttons: {
					view: { iconRight: 'View', type: 'text', show: auth('design_order:product_spec_template:View') },
					edit: {
						iconRight: 'Edit', type: 'text',
						show: ({ row }: any) => !row.builtin && auth('design_order:product_spec_template:Update'),
					},
					remove: {
						iconRight: 'Delete', type: 'text',
						show: ({ row }: any) => !row.builtin && auth('design_order:product_spec_template:Delete'),
					},
					registerFields: {
						text: '登记字段权限', type: 'text',
						show: ({ row }: any) => !row.builtin,
						click: async ({ row }: any) => {
							try {
								await ElMessageBox.confirm(`将把模板「${row.label}」的字段遮罩键登记到字段权限表，是否继续？`, '提示', { type: 'warning' });
								const res: any = await api.RegisterFieldPermissions(row.id);
								if (res.code === 2000) {
									ElMessage.success(`已登记 ${res.data.created.length} 个字段，请到「列权限」页配置各角色权限`);
								}
							} catch { /* 取消 */ }
						},
					},
				},
			},
			table: { rowKey: 'id' },
			columns: {
				templateType: {
					title: '模板标识', type: 'text', search: { show: true },
					column: { minWidth: 140 },
					form: { rules: [{ required: true, message: '请输入模板标识' }], component: { props: { disabled: false } } },
				},
				label: {
					title: '模板名称', type: 'text',
					column: { minWidth: 140 },
					form: { rules: [{ required: true, message: '请输入模板名称' }] },
				},
				builtin: {
					title: '类型', type: 'dict-select',
					column: { width: 90, align: 'center' },
					dict: dict({ data: [{ value: true, label: '内置', color: 'danger' }, { value: false, label: '自定义', color: 'primary' }] }),
					form: { show: false },
				},
				rowsPerBlock: {
					title: '每块行数', type: 'number',
					column: { width: 90 },
					form: { value: 15, rules: [{ required: true }], component: { props: { min: 5 } } },
				},
				columnsPerBlock: {
					title: '每块列数', type: 'number',
					column: { width: 90 },
					form: { value: 6, component: { props: { disabled: true } } },
				},
				fields: {
					title: '字段定义',
					column: { show: false },
					form: { component: FieldEditorTable, span: 24 },
				},
				validation: {
					title: '校验配置',
					column: { show: false },
					form: { component: ValidationEditor, span: 24 },
				},
			},
		},
	};
};
