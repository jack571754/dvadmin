import * as api from './api';
import {
    dict,
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    compute,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import { request } from '/@/utils/service';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import tableSelector from '/@/components/tableSelector/index.vue';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const { t } = useI18n();
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

	/**
	 * 懒加载
	 * @param row
	 * @returns {Promise<unknown>}
	 */
	const loadContentMethod = (tree: any, treeNode: any, resolve: Function) => {
		pageRequest({ pcode: tree.code }).then((res: APIResponseData) => {
			resolve(res.data);
		});
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			actionbar: {
				buttons: {
					add: {
						text: t('message.pages.areas.buttons.add'),
						show: auth('area:Create'),
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						text: t('message.pages.areas.buttons.edit'),
						iconRight: 'Edit',
						type: 'text',
						show: auth('area:Update'),
					},
					remove: {
						text: t('message.pages.areas.buttons.delete'),
						iconRight: 'Delete',
						type: 'text',
						show: auth('area:Delete'),
					},
				},
			},
			pagination: {
				show: false,
			},
			table: {
				rowKey: 'id',
				lazy: true,
				load: loadContentMethod,
				treeProps: { children: 'children', hasChildren: 'hasChild' },
			},
			columns: {
				_index: {
					title: t('message.pages.areas.table.columns.index'),
					form: { show: false },
					column: {
						type: 'index',
						align: 'center',
						width: '70px',
						columnSetDisabled: true,
					},
				},
				name: {
					title: t('message.pages.areas.table.columns.areaName'),
					search: {
						show: true,
					},
					treeNode: true,
					type: 'input',
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							{ required: true, message: t('message.pages.areas.validation.areaNameRequired') },
						],
						component: {
							placeholder: t('message.pages.areas.form.areaNamePlaceholder'),
						},
					},
				},
				pcode: {
					title: t('message.pages.areas.table.columns.parentArea'),
					search: {
						disabled: true,
					},
					width: 130,
					type: 'table-selector',
					form: {
						component: {
							name: shallowRef(tableSelector),
							vModel: 'modelValue',
							displayLabel: compute(({ row }) => {
								if (row) {
									return row.pcode_info;
								}
								return null;
							}),
							tableConfig: {
								url: '/api/system/area/',
								label: 'name',
								value: 'id',
								isTree: true,
								isMultiple: false,
								lazy: true,
								load: loadContentMethod,
								treeProps: { children: 'children', hasChildren: 'hasChild' },
								columns: [
									{
										prop: 'name',
										label: t('message.pages.areas.table.columns.areaName'),
										width: 150,
									},
									{
										prop: 'code',
										label: t('message.pages.areas.table.columns.areaCode'),
									},
								],
							},
						},
					},
					column: {
						show: false,
					},
				},
				code: {
					title: t('message.pages.areas.table.columns.areaCode'),
					search: {
						show: true,
					},
					type: 'input',
					column: {
						minWidth: 90,
					},
					form: {
						rules: [
							{ required: true, message: t('message.pages.areas.validation.areaCodeRequired') },
						],
						component: {
							placeholder: t('message.pages.areas.form.areaCodePlaceholder'),
						},
					},
				},
				enable: {
					title: t('message.pages.areas.table.columns.status'),
					search: {
						show: true,
					},
					type: 'dict-radio',
					column: {
						minWidth: 90,
						component: {
							name: 'fs-dict-switch',
							activeText: '',
							inactiveText: '',
							style: '--el-switch-on-color: var(--el-color-primary); --el-switch-off-color: #dcdfe6',
							onChange: compute((context) => {
								return () => {
									api.UpdateObj(context.row).then((res: APIResponseData) => {
										successMessage(res.msg as string);
									});
								};
							}),
						},
					},
					dict: dict({
						data: dictionary('button_status_bool'),
					}),
				},
			},
		},
	};
};
