import * as api from '/@/api/design_order/product_spec_submission';
import { dict, useCompute, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet, CrudExpose } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import router from '/@/router/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import { shallowRef } from 'vue';
import { CreateShareLink } from '/@/api/design_order/product_spec_share';
import { copyTextToClipboard } from '/@/utils/clipboard';
import StoreSelector from './components/StoreSelector.vue';
import { ensureProductSpecEditorRoute } from '/@/router/backEnd';

const { compute } = useCompute();

const openProductSpec = async (submissionId: number, extraQuery: Record<string, string> = {}) => {
	if (!submissionId) {
		ElMessage.error('提报记录缺少 ID，无法查看详情');
		return;
	}
	ensureProductSpecEditorRoute();
	try {
		await router.push({
			name: 'productSpec',
			query: { id: submissionId, ...extraQuery },
		});
	} catch (error) {
		console.error('打开规格提报详情失败', error);
		ElMessage.error('打开规格提报详情失败，请刷新页面后重试');
	}
};

const copyShareUrl = async (shareUrl: string) => {
	try {
		await copyTextToClipboard(shareUrl);
		return true;
	} catch {
		await ElMessageBox.alert(shareUrl, '请手动复制分享链接', {
			confirmButtonText: '知道了',
			showClose: false,
			closeOnClickModal: false,
			closeOnPressEscape: false,
		});
		return false;
	}
};

const handleShareSpec = async (row: any) => {
	try {
		const result: any = await CreateShareLink(row.id);
		const shareUrl = result.data?.shareUrl;
		if (!shareUrl) throw new Error(result.msg || '后端未返回分享链接');
		if (await copyShareUrl(shareUrl)) {
			ElMessage.success('分享链接已复制');
		}
	} catch (error: any) {
		await ElMessageBox.alert(error?.message || error?.msg || '分享链接生成失败', '分享失败');
	}
};

const openReuseForm = async (crudExpose: CrudExpose, row: any) => {
	await crudExpose.openAdd({
		row: {
			platform: row.platform,
			shop: row.shop,
			name: `${row.name}_复用`,
		},
	}, {
		wrapper: {
			title: '复用提报',
			buttons: { ok: { text: '确定复用' } },
		},
		columns: {
			platform: { component: { props: { disabled: true } } },
		},
		doSubmit: async ({ form }: any) => {
			const res: any = await api.CopyObj(row.id, { name: form.name, shop: form.shop });
			if (!res.data?.id) throw new Error(res.msg || '复用提报失败');
			ElMessage.success('提报复用成功，正在进入新表格...');
			await openProductSpec(res.data.id);
			return res;
		},
	});
};

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		// 后端 list 返回 CustomPagination 平铺分页结构 {code, data:[...], page, limit, total}
		// 手动包装为 fast-crud 分页结构；并用局部 transformRes 透传，
		// 避免被 settings.ts 全局 transformRes（按 res.data/res.page/res.limit 取值）二次错误转换
		const res: any = await api.GetList(query);
		const list = Array.isArray(res) ? res : res.data || [];
		return { records: list, total: res.total ?? list.length, currentPage: res.page ?? 1, pageSize: res.limit ?? 20 };
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
			await openProductSpec(res.data.id, { entry: 'create' });
		}
		return res;
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				transformRes: ({ res }: any) => res,
				addRequest,
				editRequest,
				delRequest,
			},
			addForm: {
				wrapper: {
					buttons: {
						copy: { show: false },
						paste: { show: false },
					},
				},
			},
			editForm: {
				wrapper: {
					buttons: {
						copy: { show: false },
						paste: { show: false },
					},
				},
			},
			actionbar: {
				buttons: {
					add: { show: auth('design_order:product_spec_submission:Create') },
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 340,
				buttons: {
					view: { show: false }, // 禁用默认的 view 弹窗
					edit: {
						iconRight: 'Edit',
						type: 'text',
						text: '修改名称',
						show: compute(({ row }: any) => auth('design_order:product_spec_submission:Update') && row.canEdit),
					},
					viewSpec: {
						iconRight: 'View',
						type: 'text',
						text: '查看详情',
						title: '前往编辑与查看产品规格对比表',
						click: async ({ row }) => {
							await openProductSpec(row.id);
						}
					},
					shareSpec: {
						iconRight: 'Link',
						type: 'text',
						text: '分享链接',
						title: '生成并复制该提报的只读分享链接',
						show: compute(({ row }: any) => auth('design_order:product_spec_submission:Share') && row.canShare),
						click: async ({ row }) => {
							await handleShareSpec(row);
						},
					},
					copySpec: {
						iconRight: 'DocumentCopy',
						type: 'text',
						text: '复用提报',
						title: '基于该历史数据克隆出一份新提报',
						show: compute(({ row }: any) => auth('design_order:product_spec_submission:Copy') && row.canCopy),
						click: async ({ row }) => {
							await openReuseForm(crudExpose, row);
						}
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: compute(({ row }: any) => auth('design_order:product_spec_submission:Delete') && row.canDelete),
					},
				},
			},
			columns: {
				platform: {
					title: '平台',
					type: 'dict-select',
					search: { show: true },
					column: { minWidth: 110, align: 'center' },
					// 列表/搜索/表单统一只展示当前用户有权限的平台。
					// 用户可见的提报单其平台必在授权范围内，故受限字典足够回显。
					dict: dict({
						getData: async () => {
							const res: any = await api.GetMyPlatforms();
							return res.data || [];
						},
					}),
					form: {
						rules: [{ required: true, message: '请选择平台' }],
						component: { props: { clearable: false, placeholder: '请选择平台' } },
					},
				},
				shop: {
					title: '提报店铺/渠道',
					type: 'input',
					column: { minWidth: 140 },
					search: {
						show: true,
						component: {
							name: shallowRef(StoreSelector),
							vModel: 'modelValue',
							placeholder: '搜索店铺/渠道',
						},
					},
					form: {
						rules: [{ required: true, message: '请选择提报店铺/渠道' }],
						component: {
							name: shallowRef(StoreSelector),
							vModel: 'modelValue',
							platform: compute(({ form }: any) => form.platform || ''),
							placeholder: '搜索并选择店铺',
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
					},
					addForm: { show: false },
					editForm: { show: false },
				},
				product_count: {
					title: '产品列数',
					type: 'number',
					column: { minWidth: 100, align: 'center' },
					form: { show: false },
					addForm: { show: false },
					editForm: { show: false },
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
