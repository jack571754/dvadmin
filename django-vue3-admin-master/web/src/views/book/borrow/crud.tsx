import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import { BORROW_STATUS_OPTIONS, DEFAULT_MAX_RENEW_COUNT } from './constants';

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
				width: 200,
				buttons: {
					view: { show: false },
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('book:borrow:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('book:borrow:Delete'),
					},
					renew: {
						text: '续借',
						type: 'text',
						iconRight: 'RefreshRight',
						show: auth('book:borrow:Renew'),
						click: async ({ row }) => {
							const res = await api.renewBorrow(row.id);
							if (res) {
								crudExpose.doRefresh();
							}
						},
						visible: ({ row }) => {
							// 仅借阅中或已续借且未达到最大续借次数时显示
							return (row.status === 0 || row.status === 3) && row.renew_count < DEFAULT_MAX_RENEW_COUNT;
						}
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
				book_title: {
					title: '图书名称',
					type: 'input',
					column: { minWidth: 200 },
					form: { show: false },
				},
				book_isbn: {
					title: 'ISBN',
					type: 'input',
					column: { minWidth: 150 },
					form: { show: false },
				},
				user_name: {
					title: '借阅用户',
					type: 'input',
					search: { show: true },
					column: { minWidth: 120 },
					form: { show: false },
				},
				status: {
					title: '状态',
					type: 'dict-radio',
					dict: dict({
						data: BORROW_STATUS_OPTIONS,
					}),
					column: { minWidth: 100 },
					search: { show: true },
					form: {
						value: 0,
					},
				},
				borrow_date: {
					title: '借阅时间',
					type: 'datetime',
					column: { minWidth: 160 },
					form: { show: false },
				},
				due_date: {
					title: '应还时间',
					type: 'date',
					column: { minWidth: 120 },
					form: {
						component: {
							props: { type: 'date', valueFormat: 'YYYY-MM-DD' },
						},
					},
				},
				return_date: {
					title: '归还时间',
					type: 'datetime',
					column: { minWidth: 160 },
					form: { show: false },
				},
				renew_count: {
					title: '续借次数',
					type: 'number',
					column: { minWidth: 100 },
					form: { show: false },
				},
				max_renew_count: {
					title: '最大续借次数',
					type: 'number',
					column: { minWidth: 120 },
					form: {
						value: 3,
					},
				},
				remarks: {
					title: '备注',
					type: 'text',
					column: { minWidth: 150 },
					form: {
						component: {
							props: { type: 'textarea', rows: 3 },
						},
					},
				},
			},
		},
	};
};
