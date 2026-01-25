import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import { shallowRef } from 'vue';

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
			actionbar: {
				buttons: {
					add: {
						show: false,
					},
				},
			},
			rowHandle: {
				//固定右侧
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						show: false,
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('flowInfo:Delete'),
					},
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
				name: {
					title: '流程名称',
					search: {
						show: true,
					},
					type: 'input',
					column: {
						minWidth: 200,
					},
					form: {
						rules: [{ required: true, message: '请输入流程名称' }],
					},
				},
				description: {
					title: '描述',
					type: 'input',
					column: {
						minWidth: 200,
					},
					form: {
						rules: [{ required: false }],
					},
				},
				status: {
					title: '状态',
					search: {
						show: true,
					},
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '待发布', value: 0, color: 'info' },
							{ label: '正常', value: 1, color: 'success' },
							{ label: '下架', value: 2, color: 'danger' },
						],
					}),
					column: {
						minWidth: 120,
						component: {
							color: 'auto',
						},
					},
					form: {
						value: 0,
					},
				},
				model_type: {
					title: '流程类型',
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '数据库表', value: 0 },
							{ label: '动态表单', value: 1 },
						],
					}),
					column: {
						minWidth: 120,
					},
					form: {
						value: 1,
					},
				},
				model_name: {
					title: '数据模型',
					type: 'input',
					column: {
						minWidth: 150,
						show: false,
					},
					form: {
						show: false,
					},
				},
				operation: {
					title: '操作类型',
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '新增', value: 'create' },
							{ label: '修改', value: 'update' },
							{ label: '删除', value: 'delete' },
						],
					}),
					column: {
						minWidth: 120,
						show: false,
					},
					form: {
						show: false,
					},
				},
				icon: {
					title: '图标',
					type: 'icon-selector',
					column: {
						minWidth: 80,
					},
					form: {
						rules: [{ required: false }],
					},
				},
				create_datetime: {
					title: '创建时间',
					type: 'datetime',
					column: {
						minWidth: 180,
					},
					form: {
						show: false,
					},
				},
			},
		},
	};
};
