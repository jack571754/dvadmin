import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		return await api.GetList(query);
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		return await api.AddObj(form);
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			rowHandle: {
				fixed: 'right',
				width: 150,
				buttons: {
					view: { show: false },
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('blog:category:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('blog:category:Delete'),
					},
				},
			},
			columns: {
				_index: {
					title: '序号',
					form: { show: false },
					column: {
						align: 'center',
						width: '70px',
						columnSetDisabled: true,
						formatter: (context) => {
							let index = context.index ?? 1;
							let pagination = crudExpose!.crudBinding.value.pagination;
							return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
						},
					},
				},
				name: {
					title: '分类名称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 150 },
					form: {
						rules: [{ required: true, message: '分类名称为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				description: {
					title: '分类描述',
					type: 'text',
					column: { minWidth: 200, show: false },
					form: {
						component: { props: { type: 'textarea', rows: 3 } },
					},
				},
				sort_order: {
					title: '排序',
					type: 'number',
					column: { minWidth: 80, align: 'center' },
					form: { value: 0 },
				},
				is_active: {
					title: '是否启用',
					type: 'dict-radio',
					dict: dict({
						data: [
							{ label: '启用', value: true, color: 'success' },
							{ label: '禁用', value: false, color: 'danger' },
						],
					}),
					column: { minWidth: 100, align: 'center' },
					form: { value: true },
				},
				create_datetime: {
					title: '创建时间',
					type: 'datetime',
					column: { minWidth: 180, align: 'center' },
					form: { show: false },
				},
			},
		},
	};
};
