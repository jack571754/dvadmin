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
						show: auth('book:publisher:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('book:publisher:Delete'),
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
					title: '出版社名称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 200 },
					form: {
						rules: [{ required: true, message: '出版社名称为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				code: {
					title: '出版社代码',
					search: { show: true },
					type: 'input',
					column: { minWidth: 120 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				address: {
					title: '地址',
					type: 'input',
					column: { minWidth: 200 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				contact_phone: {
					title: '联系电话',
					type: 'input',
					column: { minWidth: 130 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				email: {
					title: '邮箱',
					type: 'input',
					column: { minWidth: 180 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				website: {
					title: '网站',
					type: 'input',
					column: { minWidth: 150 },
					form: {
						component: { props: { clearable: true } },
					},
				},
				description: {
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
