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
				width: 280,
				buttons: {
					view: { show: false },
					borrow: {
						text: '借阅',
						iconRight: 'Reading',
						type: 'text',
						show: auth('book:book:Borrow'),
						click: async ({ row }) => {
							try {
								const res = await api.borrowBook(row.id);
								if (res) {
									crudExpose.doRefresh();
								}
							} catch (error: any) {
								// 显示详细错误信息
								const errorMsg = error?.response?.data?.error || error?.response?.data?.detail || error?.message || '借阅失败';
								console.error('Borrow error:', error?.response?.data);
								alert('借阅失败: ' + errorMsg);
							}
						},
						visible: ({ row }) => {
							// 仅库存大于0且状态正常时显示
							return row.available_quantity > 0 && row.status === 0;
						}
					},
					return: {
						text: '归还',
						iconRight: 'CircleCheck',
						type: 'text',
						show: auth('book:book:Return'),
						click: async ({ row }) => {
							const res = await api.returnBook(row.id);
							if (res) {
								crudExpose.doRefresh();
							}
						},
						// 注意：这里无法直接判断用户是否借阅了该书
						// 实际使用时可能需要根据当前用户的借阅记录动态显示
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('book:book:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('book:book:Delete'),
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
				title: {
					title: '书名',
					search: { show: true },
					type: 'input',
					column: { minWidth: 200 },
					form: {
						rules: [{ required: true, message: '书名为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				isbn: {
					title: 'ISBN',
					search: { show: true },
					type: 'input',
					column: { minWidth: 150 },
					form: {
						rules: [{ required: true, message: 'ISBN为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				author: {
					title: '作者',
					type: 'input',
					column: { minWidth: 120 },
					form: { show: false },
				},
				publisher: {
					title: '出版社',
					type: 'input',
					column: { minWidth: 150 },
					form: { show: false },
				},
				category_name: {
					title: '分类',
					type: 'input',
					column: { minWidth: 100 },
					form: { show: false },
				},
				price: {
					title: '价格',
					type: 'number',
					column: { minWidth: 80 },
					form: {
						rules: [{ required: true, message: '价格为必填项' }],
						component: {
							props: { precision: 2, min: 0 },
						},
					},
				},
				available_quantity: {
					title: '可借数量',
					type: 'number',
					column: { minWidth: 100 },
					form: {
						value: 1,
						component: { props: { min: 0 } },
					},
				},
				total_quantity: {
					title: '总数量',
					type: 'number',
					column: { minWidth: 80 },
					form: {
						rules: [{ required: true, message: '总数量为必填项' }],
						component: { props: { min: 1 } },
					},
				},
				publish_date: {
					title: '出版日期',
					type: 'date',
					column: { minWidth: 120 },
					form: {
						component: {
							props: { type: 'date', valueFormat: 'YYYY-MM-DD' },
						},
					},
				},
				status: {
					title: '状态',
					type: 'dict-radio',
					dict: dict({
						data: [
							{ label: '正常', value: 0, color: 'success' },
							{ label: '下架', value: 1, color: 'danger' },
						],
					}),
					column: { minWidth: 80 },
					form: {
						value: 0,
					},
				},
				description: {
					title: '简介',
					type: 'text',
					column: { show: false },
					form: {
						component: {
							props: { type: 'textarea', rows: 4 },
						},
					},
				},
			},
		},
	};
};
