import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import { successMessage, errorMessage } from '/@/utils/message';
import { h } from 'vue';
import WngEditor from '/@/components/editor/index.vue';

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
			form: {
				wrapper: {
					is: 'el-dialog',
					width: '1200px',
					draggable: true,
					class: 'article-form-dialog',
					closeOnClickModal: false,
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: { show: false },
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('blog:article:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('blog:article:Delete'),
					},
					custom: {
						iconRight: 'Check',
						text: '发布',
						type: 'text',
						show: auth('blog:article:Publish'),
						click: async ({ row }) => {
							try {
								if (row.status === 'published') {
									successMessage('文章已发布');
									return;
								}
								await api.Publish(row.id);
								successMessage('发布成功！');
								await crudExpose?.doRefresh?.();
							} catch (error: any) {
								const errorMsg = error?.response?.data?.msg || error?.response?.data?.detail || error?.message || '发布失败';
								errorMessage(errorMsg);
							}
						},
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
					title: '文章标题',
					search: { show: true },
					type: 'input',
					column: { minWidth: 200 },
					form: {
						col: { span: 24 },
						rules: [{ required: true, message: '文章标题为必填项' }],
						component: { props: { clearable: true } },
					},
				},
				summary: {
					title: '文章摘要',
					type: 'text',
					column: { minWidth: 250, show: true },
					form: {
						col: { span: 24 },
						component: {
							type: 'textarea',
							rows: 2,
							placeholder: '请输入文章摘要'
						},
					},
				},
				cover_image: {
					title: '封面图片',
					type: 'input',
					column: { minWidth: 120, show: false },
					form: {
						col: { span: 12 },
						component: { placeholder: '请输入封面图 URL' },
					},
				},
				category: {
					title: '分类',
					dict: dict({ url: '/api/blog/categories/dict/' }),
					type: 'dict-select',
					column: { minWidth: 100 },
					form: {
						col: { span: 12 },
						rules: [{ required: false, message: '请选择分类' }],
					},
				},
				tags: {
					title: '标签',
					dict: dict({ url: '/api/blog/tags/dict/' }),
					type: 'dict-select',
					column: { minWidth: 120, show: false },
					form: {
						col: { span: 12 },
						component: {
							props: {
								multiple: true,
								placeholder: '请选择标签',
							}
						},
					},
				},
				status: {
					title: '状态',
					search: { show: true },
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '草稿', value: 'draft', color: 'info' },
							{ label: '已发布', value: 'published', color: 'success' },
						],
					}),
					column: { minWidth: 100, align: 'center' },
					form: {
						col: { span: 12 },
						value: 'draft'
					},
				},
				views_count: {
					title: '阅读量',
					type: 'number',
					column: { minWidth: 90, align: 'center' },
					form: { show: false, value: 0 },
				},
				likes_count: {
					title: '点赞数',
					type: 'number',
					column: { minWidth: 90, align: 'center' },
					form: { show: false, value: 0 },
				},
				is_top: {
					title: '是否置顶',
					type: 'dict-radio',
					dict: dict({
						data: [
							{ label: '是', value: true, color: 'warning' },
							{ label: '否', value: false, color: 'default' },
						],
					}),
					column: { minWidth: 90, align: 'center' },
					form: {
						col: { span: 12 },
						value: false
					},
				},
				content: {
					title: '文章内容',
					type: 'text',
					column: { show: false },
					form: {
						col: { span: 24 },
						rules: [{ required: true, message: '文章内容为必填项' }],
						component: {
							render: (context: any) => {
								return h('div', {
									class: 'article-content-wrapper',
								}, [
									h(WngEditor, {
										placeholder: '请输入文章内容...',
										mode: 'default',
										height: '500px',
										getHtml: context.form.content,
										'onUpdate:getHtml': (value: string) => {
											context.form.content = value;
										},
									}),
								]);
							},
						},
					},
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
