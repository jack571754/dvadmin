import {
	AddReq,
	CreateCrudOptionsProps,
	CreateCrudOptionsRet,
	DelReq,
	EditReq,
	UserPageQuery,
	compute,
	dict,
} from '@fast-crud/fast-crud';
import { successMessage } from '/@/utils/message';
import { ElMessageBox } from 'element-plus';
import * as api from '/@/api/design_order/store';
import { auth } from '/@/utils/authFunction';
import { dictionary } from '/@/utils/dictionary';

const STORE_PERMISSION = 'design_order:design_workorder_archive';

const STORE_COLUMNS = {
	keyword: {
		title: '关键词',
		type: 'input',
		column: { show: false },
		form: { show: false },
		search: {
			show: true,
			component: {
				props: {
					clearable: true,
					placeholder: '店铺编码 / 店铺名称 / 负责人',
				},
			},
		},
	},
	store_code: {
		title: '店铺编码',
		type: 'input',
		column: { minWidth: 140, fixed: 'left' },
		form: {
			rules: [{ required: true, message: '店铺编码为必填项' }],
			component: {
				props: { clearable: true, placeholder: '请输入店铺编码' },
			},
		},
	},
	store_name: {
		title: '店铺名称',
		type: 'input',
		column: { minWidth: 220, fixed: 'left' },
		form: {
			rules: [{ required: true, message: '店铺名称为必填项' }],
			component: {
				props: { clearable: true, placeholder: '请输入店铺名称' },
			},
		},
	},
	store_type: {
		title: '店铺类型',
		type: 'dict-select',
		search: { show: true },
		column: { minWidth: 110, align: 'center' },
		dict: dict({ data: dictionary('design_order_store_type') }),
		form: {
			rules: [{ required: true, message: '请选择店铺类型' }],
			component: { props: { clearable: true } },
		},
	},
	brand: {
		title: '品牌',
		type: 'dict-select',
		search: { show: true },
		column: { minWidth: 120 },
		dict: dict({ data: dictionary('design_order_store_brand') }),
		form: {
			rules: [{ required: true, message: '请选择品牌' }],
			component: { props: { clearable: true } },
		},
	},
	platform: {
		title: '平台',
		type: 'dict-select',
		search: { show: true },
		column: { minWidth: 110 },
		dict: dict({ data: dictionary('design_order_store_platform') }),
		form: {
			rules: [{ required: true, message: '请选择平台' }],
			component: { props: { clearable: true } },
		},
	},
	owner_name: {
		title: '店铺负责人',
		type: 'input',
		column: { minWidth: 130 },
		form: {
			rules: [{ required: true, message: '店铺负责人为必填项' }],
			component: {
				props: {
					clearable: true,
					placeholder: '请输入负责人姓名',
				},
			},
		},
	},
	status: {
		title: '状态',
		type: 'dict-switch',
		column: { minWidth: 90, align: 'center' },
		dict: dict({
			data: [
				{ value: true, label: '启用', color: 'success' },
				{ value: false, label: '禁用', color: 'info' },
			],
		}),
		form: { value: true },
	},
};

async function changeStoreStatus(crudExpose: any, row: any, status: boolean) {
	const actionText = status ? '启用' : '禁用';
	await ElMessageBox.confirm(`确定要${actionText}店铺“${row.store_name}”吗？`, '状态确认', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	});
	await api.SetStatus(row.id, status);
	successMessage(`店铺已${actionText}`);
	crudExpose.doRefresh();
}

function createRequestOptions() {
	const pageRequest = async (query: UserPageQuery) => {
		const { keyword, ...params } = query as UserPageQuery & { keyword?: string };
		return api.GetList({
			...params,
			search: keyword || undefined,
		});
	};
	const addRequest = async ({ form }: AddReq) => api.AddObj(form);
	const editRequest = async ({ form, row }: EditReq) =>
		api.UpdateObj({ ...form, id: row.id });
	const delRequest = async ({ row }: DelReq) => api.DelObj(row.id);

	return {
		pageRequest,
		addRequest,
		editRequest,
		delRequest,
	};
}

function createRowHandle(crudExpose: any) {
	return {
		fixed: 'right',
		width: 210,
		buttons: {
			view: { show: false },
			edit: {
				type: 'text',
				iconRight: 'Edit',
				show: auth(`${STORE_PERMISSION}:Update`),
			},
			toggleStatus: {
				type: 'text',
				text: compute(({ row }: any) => (row?.status ? '禁用' : '启用')),
				show: auth(`${STORE_PERMISSION}:Status`),
				click: ({ row }: any) =>
					changeStoreStatus(crudExpose, row, !row.status),
			},
			remove: {
				type: 'text',
				iconRight: 'Delete',
				show: ({ row }: any) =>
					auth(`${STORE_PERMISSION}:Delete`) && !row.status,
			},
		},
	};
}

export const createCrudOptions = ({
	crudExpose,
}: CreateCrudOptionsProps): CreateCrudOptionsRet => {
	return {
		crudOptions: {
			request: createRequestOptions(),
			actionbar: {
				buttons: {
					add: {
						show: auth(`${STORE_PERMISSION}:Create`),
					},
				},
			},
			rowHandle: createRowHandle(crudExpose),
			columns: STORE_COLUMNS,
		},
	};
};
