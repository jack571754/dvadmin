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
import { shallowRef } from 'vue';

import * as api from '/@/api/design_order/spec_template';
import { auth } from '/@/utils/authFunction';
import { dictionary } from '/@/utils/dictionary';
import FieldEditorTable from './components/FieldEditorTable.vue';
import ValidationEditor from './components/ValidationEditor.vue';

const PERMISSION = 'design_order:spec_template';

const DEFAULT_FIELDS = [
	{ row: 1, key: 'brand', label: '品牌', style: 'contentCenter', kind: 'text', maskKey: 'brand' },
	{ row: 2, key: 'nickname', label: '产品昵称', style: 'editableCenter', kind: 'mention', maskKey: 'nickname' },
];

const DEFAULT_VALIDATION = {
	requiredSubmissionFields: ['name', 'shop'],
	requiredProductFields: [],
};

function createRequestOptions() {
	const pageRequest = (query: UserPageQuery) => api.GetList(query);
	const addRequest = ({ form }: AddReq) => api.AddObj(form);
	const editRequest = ({ form, row }: EditReq) => api.UpdateObj({ ...form, id: row.id });
	const delRequest = ({ row }: DelReq) => api.DelObj(row.id);
	return { pageRequest, addRequest, editRequest, delRequest };
}

export const createCrudOptions = ({
	crudExpose: _crudExpose,
}: CreateCrudOptionsProps): CreateCrudOptionsRet => ({
	crudOptions: {
		request: createRequestOptions(),
		actionbar: {
			buttons: {
				add: { show: auth(`${PERMISSION}:Create`) },
			},
		},
		rowHandle: {
			fixed: 'right',
			width: 150,
			buttons: {
				view: { show: false },
				edit: { type: 'text', iconRight: 'Edit', show: auth(`${PERMISSION}:Update`) },
				remove: { type: 'text', iconRight: 'Delete', show: auth(`${PERMISSION}:Delete`) },
			},
		},
		columns: {
			platform: {
				title: '平台',
				type: 'dict-select',
				search: { show: true },
				column: { minWidth: 110, align: 'center' },
				dict: dict({ data: dictionary('design_order_store_platform') }),
				form: {
					rules: [{ required: true, message: '请选择平台' }],
					component: { props: { clearable: false } },
				},
			},
			template_code: {
				title: '模板编码',
				type: 'input',
				search: { show: true },
				column: { minWidth: 150 },
				form: {
					rules: [
						{ required: true, message: '请输入模板编码' },
						{ pattern: /^[a-z][a-z0-9_]*$/, message: '仅支持小写字母、数字和下划线，且需以字母开头' },
					],
					component: {
						props: {
							clearable: true,
							placeholder: '例如 tmall_main_image',
							disabled: compute(({ form }: any) => Boolean(form.id)),
						},
					},
				},
			},
			template_name: {
				title: '模板名称',
				type: 'input',
				search: { show: true },
				column: { minWidth: 140 },
				form: {
					rules: [{ required: true, message: '请输入模板名称' }],
					component: { props: { clearable: true } },
				},
			},
			icon: {
				title: '图标',
				type: 'input',
				column: { minWidth: 110, align: 'center' },
				form: { component: { props: { clearable: true, placeholder: '例如 Picture' } } },
			},
			remark: {
				title: '标注',
				type: 'text',
				column: { minWidth: 240, showOverflowTooltip: true },
				form: {
					component: {
						props: { type: 'textarea', rows: 3, maxlength: 300, showWordLimit: true },
					},
				},
			},
			rows_per_block: {
				title: '每块行数',
				type: 'number',
				column: { minWidth: 100, align: 'center' },
				form: {
					value: 15,
					rules: [{ required: true, message: '请输入每产品块行数' }],
					component: { props: { min: 4, max: 99, controlsPosition: 'right' } },
				},
			},
			columns_per_block: {
				title: '每块列数',
				type: 'number',
				column: { minWidth: 100, align: 'center' },
				form: {
					value: 6,
					rules: [{ required: true, message: '请输入每产品块列数' }],
					component: { props: { min: 2, max: 24, controlsPosition: 'right' } },
				},
			},
			fields: {
				title: '字段配置',
				type: 'input',
				column: { show: false },
				form: {
					value: DEFAULT_FIELDS,
					rules: [{ required: true, message: '请配置模板字段' }],
					component: {
						name: shallowRef(FieldEditorTable),
						vModel: 'modelValue',
						rowsPerBlock: compute(({ form }: any) => form.rows_per_block || 15),
					},
				},
			},
			validation: {
				title: '校验配置',
				type: 'input',
				column: { show: false },
				form: {
					value: DEFAULT_VALIDATION,
					component: {
						name: shallowRef(ValidationEditor),
						vModel: 'modelValue',
						fields: compute(({ form }: any) => form.fields || []),
					},
				},
			},
			status: {
				title: '状态',
				type: 'dict-switch',
				search: { show: true },
				column: { minWidth: 90, align: 'center' },
				dict: dict({
					data: [
						{ value: true, label: '启用', color: 'success' },
						{ value: false, label: '禁用', color: 'info' },
					],
				}),
				form: { value: true },
			},
			sort: {
				title: '排序',
				type: 'number',
				column: { minWidth: 80, align: 'center' },
				form: { value: 0, component: { props: { min: 0, controlsPosition: 'right' } } },
			},
		},
	},
});
