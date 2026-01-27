import { CreateCrudOptionsProps, CreateCrudOptionsRet, AddReq, DelReq, EditReq, dict } from '@fast-crud/fast-crud';
import * as api from './api';
import { successMessage } from '/@/utils/message';

/**
 * 图书管理 CRUD 配置
 */
export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: any) => {
		return await api.getBookList(query);
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		return await api.updateBook(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.deleteBook(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		return await api.addBook(form);
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			pagination: {
				show: true,
			},
			actionbar: {
				buttons: {
					add: {
						text: '新增图书',
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						show: true,
					},
					edit: {
						show: true,
					},
					remove: {
						show: true,
					},
				},
			},
			form: {
				col: { span: 24 },
				labelWidth: '100px',
				wrapper: {
					is: 'el-dialog',
					width: '700px',
				},
			},
			columns: {
				_index: {
					title: '序号',
					form: { show: false },
					column: {
						type: 'index',
						align: 'center',
						width: '70px',
						columnSetDisabled: true,
					},
				},
				id: {
					title: 'ID',
					column: { show: false },
					search: { show: false },
					form: { show: false },
				},
				isbn: {
					title: 'ISBN编号',
					search: { show: true },
					column: {
						minWidth: 140,
					},
					form: {
						rules: [
							{ required: true, message: 'ISBN编号必填' },
							{ len: 13, message: 'ISBN必须是13位' },
						],
						component: {
							placeholder: '请输入13位ISBN编号',
						},
					},
				},
				title: {
					title: '书名',
					search: { show: true },
					column: {
						minWidth: 200,
					},
					form: {
						rules: [{ required: true, message: '书名必填' }],
						component: {
							placeholder: '请输入书名',
						},
					},
				},
				subtitle: {
					title: '副标题',
					search: { show: false },
					column: {
						minWidth: 150,
						show: false,
					},
					form: {
						component: {
							placeholder: '请输入副标题（选填）',
						},
					},
				},
				category: {
					title: '图书分类',
					search: { show: false },
					column: {
						minWidth: 120,
					},
					form: {
						rules: [{ required: true, message: '请选择图书分类' }],
						component: {
							name: 'foreignKey',
							vModel: 'value',
							distinct: true,
							// 使用字典数据
							dict: dict({
								// 获取分类列表
								getData: async () => {
									const res = await api.getCategoryList();
									return res.data?.map((item: any) => ({
										label: item.name,
										value: item.id,
									})) || [];
								},
							}),
						},
					},
					valueResolve({ row, key }) {
						// 处理编辑时的显示值
						if (row.category_name) {
							row[key + '_name'] = row.category_name;
						}
					},
				},
				publisher: {
					title: '出版社',
					search: { show: false },
					column: {
						minWidth: 150,
					},
					form: {
						rules: [{ required: true, message: '请选择出版社' }],
						component: {
							name: 'foreignKey',
							vModel: 'value',
							distinct: true,
							dict: dict({
								getData: async () => {
									const res = await api.getPublisherList({ page: 1, limit: 1000 });
									return res.data?.data?.map((item: any) => ({
										label: item.name,
										value: item.id,
									})) || [];
								},
							}),
						},
					},
					valueResolve({ row, key }) {
						if (row.publisher_name) {
							row[key + '_name'] = row.publisher_name;
						}
					},
				},
				authors: {
					title: '作者',
					search: { show: false },
					column: {
						minWidth: 120,
					},
					form: {
						rules: [{ required: true, message: '请选择作者' }],
						component: {
							name: 'manyToMany',
							vModel: 'value',
							dict: dict({
								getData: async () => {
									const res = await api.getAuthorList({ page: 1, limit: 1000 });
									return res.data?.data?.map((item: any) => ({
										label: item.name,
										value: item.id,
									})) || [];
								},
							}),
						},
					},
					valueResolve({ row, key }) {
						if (row.authors_name) {
							row[key + '_name'] = row.authors_name;
						}
					},
				},
				publish_date: {
					title: '出版日期',
					search: { show: false },
					type: 'date',
					column: {
						minWidth: 120,
					},
					form: {
						component: {
							type: 'date',
							placeholder: '请选择出版日期',
						},
					},
				},
				edition: {
					title: '版次',
					search: { show: false },
					column: {
						minWidth: 80,
						show: false,
					},
					form: {
						component: {
							placeholder: '如：第1版',
						},
					},
				},
				pages: {
					title: '页数',
					search: { show: false },
					type: 'number',
					column: {
						minWidth: 80,
						show: false,
					},
					form: {
						component: {
							placeholder: '请输入页数',
						},
					},
				},
				price: {
					title: '定价',
					search: { show: false },
					type: 'price',
					column: {
						minWidth: 90,
					},
					form: {
						component: {
							placeholder: '请输入定价',
						},
					},
				},
				total_quantity: {
					title: '总册数',
					search: { show: false },
					type: 'number',
					column: {
						minWidth: 90,
					},
					form: {
						rules: [{ required: true, message: '总册数必填' }],
						component: {
							placeholder: '请输入总册数',
						},
					},
				},
				available_quantity: {
					title: '可借册数',
					search: { show: false },
					type: 'number',
					column: {
						minWidth: 100,
					},
					form: {
						rules: [{ required: true, message: '可借册数必填' }],
						component: {
							placeholder: '请输入可借册数',
						},
					},
				},
				location: {
					title: '存放位置',
					search: { show: false },
					column: {
						minWidth: 100,
					},
					form: {
						component: {
							placeholder: '如：A-01-01',
						},
					},
				},
				status: {
					title: '状态',
					search: { show: true },
					type: 'dict-select',
					column: {
						minWidth: 90,
						component: {
							name: 'fs-dict-switch',
						},
					},
					form: {
						component: {
							name: 'el-select',
						},
					},
					dict: dict({
						data: [
							{ label: '上架', value: 0, color: 'success' },
							{ label: '下架', value: 1, color: 'info' },
							{ label: '遗失', value: 2, color: 'danger' },
							{ label: '报废', value: 3, color: 'warning' },
						],
					}),
				},
				language: {
					title: '语言',
					search: { show: false },
					column: {
						minWidth: 90,
						show: false,
					},
					form: {
						component: {
							placeholder: '如：中文、英文',
						},
					},
				},
				summary: {
					title: '内容简介',
					search: { show: false },
					column: {
						show: false,
					},
					form: {
					component: {
						name: 'el-input',
						props: {
							type: 'textarea',
							rows: 4,
						},
						placeholder: '请输入内容简介',
					},
				},
				},
			},
		},
	};
};
