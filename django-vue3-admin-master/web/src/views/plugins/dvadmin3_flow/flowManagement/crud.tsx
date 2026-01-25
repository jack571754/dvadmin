import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { request } from '/@/utils/service';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import {commonCrudConfig} from "/@/utils/commonCrud";

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
				align: 'center',
				width: 180,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: false,
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
					},
				},
			},
			form: {
				col: { span: 24 },
				labelWidth: '110px',
				wrapper: {
					is: 'el-dialog',
					width: '600px',
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
							let pagination: any = crudExpose!.crudBinding.value.pagination;
							return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
						},
					},
				},
				name: {
					title: '流程名称',
					search: {
						show: true,
						component: {
							props: {
								clearable: true,
							},
							placeholder: '请输入',
						},
					},
					column: {
						width: '200px',
						align: 'center'
					}
				},
				icon: {
					title: '流程图标',
					column: {
						width: '100px',
						align: 'center'
					}
				},
				model_type:{
					title:"流程类型",
					column: {
						minWidth: '120px',
						align: 'center'
					}
				},
				status: {
					title: '状态',
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '待发布', value: 0 },
							{ label: '启用', value: 1 },
							{ label: '停用', value: 2 },
						],
					}),
					column:{
						width:120
					}
				},
				...commonCrudConfig({
                    create_datetime: {
                        search: false,
                        table: true,
                    },
                    update_datetime: {
                        table: true,
                    },
                    dept_belong_id: {
                        table: false,
                    }
                })
			},
		},
	};
};
