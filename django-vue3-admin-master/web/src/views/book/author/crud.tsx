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
						show: auth('book:author:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('book:author:Delete'),
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
					title: '作者姓名',
					search: { show: true },
					type: 'input',
					column: { minWidth: 150 },
					form: {
						rules: [{ required: true, message: '作者姓名为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				country: {
					title: '国籍',
					type: 'input',
					column: { minWidth: 100 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				birth_date: {
					title: '出生日期',
					type: 'date',
					column: { minWidth: 120 },
					form: {
						component: { props: { type: 'date', valueFormat: 'YYYY-MM-DD' } },
					},
				},
				biography: {
					title: '简介',
					type: 'text',
					column: { show: false },
					form: {
						component: { props: { type: 'textarea', rows: 4 } },
					},
				},
			},
		},
	};
};
