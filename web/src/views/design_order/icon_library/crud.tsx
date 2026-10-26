import {
	CreateCrudOptionsProps,
	CreateCrudOptionsRet,
	compute,
	dict,
} from '@fast-crud/fast-crud';
import * as api from '/@/api/design_order/icon_library';
import { auth } from '/@/utils/authFunction';
import { dictionary } from '/@/utils/dictionary';
import { PERMISSION_PREFIX, SCOPE_OPTIONS, STATUS_OPTIONS } from './constants';
import type { IconItem } from './types';

function createRequestOptions() {
	return {
		pageRequest: (query: any) => api.GetList(query),
		delRequest: ({ row }: any) => api.DelObj(row.id),
	};
}

function createCategoryDict() {
	return dict({
		immediate: true,
		async getData() {
			const res = await api.GetCategories();
			const categories = res?.data || [];
			return categories.map((c: string) => ({ value: c, label: c }));
		},
	});
}

function createRowButtons() {
	return {
		view: { show: false },
		edit: {
			text: '编辑',
			type: 'text',
			iconRight: 'Edit',
			show: auth(`${PERMISSION_PREFIX}:Update`),
			click: ({ row }: { row: IconItem }) => (window as any).__iconContext?.openEdit(row),
		},

		status: {
			text: compute(({ row }: { row: IconItem }) =>
				row.status === 'enabled' ? '停用' : '启用'
			),
			type: 'text',
			iconRight: 'Switch',
			show: compute(({ row }: { row: IconItem }) =>
				auth(
					`${PERMISSION_PREFIX}:${
						row.status === 'enabled' ? 'Disable' : 'Status'
					}`
				)
			),
			click: ({ row }: { row: IconItem }) => (window as any).__iconContext?.changeStatus(row),
		},
		remove: {
			text: '删除',
			type: 'text',
			iconRight: 'Delete',
			show: compute(({ row }: { row: IconItem }) =>
				auth(`${PERMISSION_PREFIX}:Delete`) && row.status === 'disabled'
			),
		},
	};
}

export const createCrudOptions = ({
	crudExpose: _crudExpose,
}: CreateCrudOptionsProps): CreateCrudOptionsRet => {
	return {
		crudOptions: {
			request: createRequestOptions(),
			actionbar: {
				buttons: {
					add: {
						show: false, // 禁用默认添加按钮
					},
					batchEnable: {
						text: '批量启用',
						type: 'primary',
						icon: 'Unlock',
						show: auth(`${PERMISSION_PREFIX}:Status`),
						click: () => (window as any).__iconContext?.batchChangeStatus('enabled'),
					},
					batchDisable: {
						text: '批量停用',
						type: 'warning',
						icon: 'Lock',
						show: auth(`${PERMISSION_PREFIX}:Disable`),
						click: () => (window as any).__iconContext?.batchChangeStatus('disabled'),
					},
					batchRemove: {
						text: '批量删除',
						type: 'danger',
						icon: 'Delete',
						show: auth(`${PERMISSION_PREFIX}:Delete`),
						click: () => (window as any).__iconContext?.batchRemove(),
					},
				},
			},
			table: {
				rowKey: 'id',
			},
			rowHandle: {
				fixed: 'right',
				width: 260,
				buttons: createRowButtons(),
			},
			columns: {
			selection: {
				title: '选择',
				form: { show: false },
				column: {
					type: 'selection',
					align: 'center',
					width: 50,
					columnSetDisabled: true,
				},
			},

			expand: {
				title: '',
				form: { show: false },
				search: { show: false },
				column: {
					type: 'expand',
					width: 1,
					align: 'center',
					className: 'icon-expand-column',
					labelClassName: 'icon-expand-column',
					columnSetDisabled: true,
				},
			},

			preview: {
				title: 'icon图',
				form: { show: false },
				column: {
					width: 300,
					minWidth: 300,
					align: 'center',
				},
			},
			search: {
				title: '关键词',
				type: 'input',
				search: { show: true, component: { props: { clearable: true, placeholder: '简称 / 注释' } } },
				column: { show: false },
				form: { show: false },
			},
			short_name: {
				title: '简称',
				type: 'input',
				column: { minWidth: 130 },
				form: { show: false },
			},
			brand: {
				title: '品牌',
				type: 'dict-select',
				dict: dict({ data: dictionary('design_order_store_brand') }),
				search: { show: true },
				column: { minWidth: 120 },
				form: { show: false },
			},
			icon_category: {
				title: '系列',
				type: 'dict-select',
				dict: createCategoryDict(),
				search: { show: true },
				column: { minWidth: 120 },
				form: { show: false },
			},
			scope_type: {
				title: '适用类别',
				type: 'dict-select',
				dict: dict({ data: SCOPE_OPTIONS }),
				search: { show: true },
				column: { minWidth: 120, align: 'center' },
				form: { show: false },
			},
			product_count: {
				title: '适用商品',
				type: 'number',
				column: { minWidth: 130, align: 'center' },
				form: { show: false },
			},
			interpretation: {
				title: '注释',
				type: 'text',
				column: { minWidth: 260, showOverflowTooltip: true },
				form: { show: false },
			},
			status: {
				title: '状态',
				type: 'dict-select',
				dict: dict({ data: STATUS_OPTIONS }),
				search: { show: true },
				column: { show: false },
				form: { show: false },
			},
			update_datetime: {
				title: '更新时间',
				type: 'datetime',
				column: { minWidth: 165, align: 'center' },
				form: { show: false },
			},
		},
	},
	};
};
