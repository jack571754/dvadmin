import * as api from '/@/api/blog/comment';
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
						show: auth('blog:comment:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('blog:comment:Delete'),
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
				article: {
					title: '关联文章',
					search: { show: true },
					type: 'dict-select',
					column: { minWidth: 200 },
					form: {
						rules: [{ required: true, message: '请选择关联文章' }],
					},
				},
				content: {
					title: '评论内容',
					type: 'text',
					column: { minWidth: 300 },
					form: {
						rules: [{ required: true, message: '评论内容为必填项' }],
						component: { props: { type: 'textarea', rows: 3 } },
					},
				},
				user: {
					title: '评论用户',
					type: 'input',
					column: { minWidth: 120 },
					form: { show: false },
				},
				parent: {
					title: '父评论',
					type: 'input',
					column: { minWidth: 100, show: false },
					form: { show: false },
				},
				is_active: {
					title: '是否显示',
					search: { show: true },
					type: 'dict-radio',
					dict: dict({
						data: [
							{ label: '显示', value: true, color: 'success' },
							{ label: '隐藏', value: false, color: 'danger' },
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
