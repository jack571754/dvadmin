import * as api from '/@/api/design_order/product_spec_submission';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import router from '/@/router/index';
import { ElMessageBox, ElMessage } from 'element-plus';

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
		// 新建提报逻辑：新建成功后，自动重定向到表格编辑页
		const res: any = await api.AddObj(form);
		if (res.code === 2000 && res.data && res.data.id) {
			ElMessage.success('提报历史创建成功，正在跳转到规格表编辑...');
			router.push({
				path: '/product_spec',
				query: { id: res.data.id }
			});
		}
		return res;
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
				width: 260,
				buttons: {
					view: { show: false }, // 禁用默认的 view 弹窗
					edit: {
						iconRight: 'Edit',
						type: 'text',
						text: '修改名称',
						show: auth('design_order:product_spec_submission:Update'),
					},
					viewSpec: {
						iconRight: 'View',
						type: 'text',
						text: '查看详情',
						title: '前往编辑与查看产品规格对比表',
						click: ({ row }) => {
							router.push({
								path: '/product_spec',
								query: { id: row.id }
							});
						}
					},
					copySpec: {
						iconRight: 'DocumentCopy',
						type: 'text',
						text: '复用提报',
						title: '基于该历史数据克隆出一份新提报',
						click: ({ row }) => {
							ElMessageBox.prompt('请输入新的【提报名称】', '复用（复制）活动提报', {
								confirmButtonText: '确定克隆',
								cancelButtonText: '取消',
								inputValue: `${row.name}_复用`,
								inputPattern: /\S+/,
								inputErrorMessage: '提报名称不能为空'
							}).then(({ value: newName }) => {
								ElMessageBox.prompt('请输入关联的【提报店铺】', '复用（复制）活动提报', {
									confirmButtonText: '确定克隆',
									cancelButtonText: '取消',
									inputValue: row.shop
								}).then(async ({ value: newShop }) => {
									try {
										ElMessage.info('正在克隆数据...');
										const res: any = await api.CopyObj(row.id, { name: newName, shop: newShop });
										if (res.code === 2000 && res.data && res.data.id) {
											ElMessage.success('活动提报克隆成功，正在进入新表格...');
											router.push({
												path: '/product_spec',
												query: { id: res.data.id }
											});
										} else {
											ElMessage.error(res.msg || '克隆失败');
										}
									} catch (err: any) {
										ElMessage.error(err.message || '网络请求错误');
									}
								});
							});
						}
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('design_order:product_spec_submission:Delete'),
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
					title: '提报名称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 180 },
					form: {
						rules: [{ required: true, message: '提报名称为必填项' }],
						component: { props: { clearable: true, placeholder: '请输入活动提报名称，如“2026年618第一波”' } },
					},
				},
				shop: {
					title: '提报店铺/渠道',
					search: { show: true },
					type: 'input',
					column: { minWidth: 140 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入提报关联的店铺' } },
					},
				},
				template_type: {
					title: '模板类型',
					type: 'dict-select',
					search: { show: true },
					column: {
						minWidth: 120,
						align: 'center',
					},
					dict: dict({
						data: [
							{ value: 'main_image', label: '主图模板', color: 'primary' },
							{ value: 'live_stream', label: '直播间模板', color: 'success' },
							{ value: 'detail_page', label: '详情页模板', color: 'warning' },
						]
					}),
					form: {
						value: 'main_image',
						rules: [{ required: true, message: '请选择模板类型' }],
						component: { props: { clearable: false, placeholder: '请选择模板类型' } }
					}
				},
				status: {
					title: '状态',
					type: 'dict-select',
					search: { show: true },
					column: {
						minWidth: 100,
						align: 'center',
					},
					dict: dict({
						data: [
							{ value: 'draft', label: '草稿', color: 'info' },
							{ value: 'submitted', label: '已提交', color: 'success' },
						]
					}),
					form: {
						value: 'draft',
						component: { props: { clearable: true, placeholder: '请选择状态' } }
					}
				},
				product_count: {
					title: '产品列数',
					type: 'number',
					column: { minWidth: 100, align: 'center' },
					form: { show: false },
				},
				creator_name: {
					title: '提交人',
					type: 'input',
					column: { minWidth: 120, align: 'center' },
					form: { show: false }
				},
				create_datetime: {
					title: '提报时间',
					type: 'datetime',
					column: { minWidth: 170, align: 'center' },
					form: { show: false },
				},
			},
		},
	};
};
