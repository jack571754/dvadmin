import * as api from './api';
import { dict, UserPageQuery, DelReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		return await api.GetList(query);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				delRequest,
			},
			actionbar: {
				buttons: {
					add: { show: false },
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 150,
				buttons: {
					view: { show: false },
					edit: { show: false },
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('system:taskResult:Delete'),
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
				task_id: {
					title: '任务ID',
					type: 'input',
					search: { show: true },
					column: {
						minWidth: 280,
						showOverflowTooltip: true,
					},
					form: { show: false },
				},
				periodic_task_name: {
					title: '定时任务名',
					type: 'input',
					search: { show: true },
					column: { minWidth: 150 },
					form: { show: false },
				},
				task_name: {
					title: '任务路径',
					type: 'input',
					search: { show: true },
					column: { minWidth: 200 },
					form: { show: false },
				},
				status: {
					title: '状态',
					type: 'dict-tag',
					search: { show: true },
					dict: dict({
						data: [
							{ label: 'SUCCESS', value: 'SUCCESS', color: 'success' },
							{ label: 'FAILURE', value: 'FAILURE', color: 'danger' },
							{ label: 'PENDING', value: 'PENDING', color: 'warning' },
							{ label: 'STARTED', value: 'STARTED', color: 'primary' },
							{ label: 'RETRY', value: 'RETRY', color: 'warning' },
							{ label: 'REVOKED', value: 'REVOKED', color: 'info' },
						],
					}),
					column: { minWidth: 100 },
					form: { show: false },
				},
				worker: {
					title: 'Worker',
					type: 'input',
					column: { minWidth: 120 },
					form: { show: false },
				},
				result: {
					title: '执行结果',
					type: 'input',
					column: {
						minWidth: 200,
						showOverflowTooltip: true,
					},
					form: { show: false },
				},
				date_created: {
					title: '创建时间',
					type: 'datetime',
					column: { minWidth: 170 },
					form: { show: false },
				},
				date_done: {
					title: '完成时间',
					type: 'datetime',
					column: { minWidth: 170 },
					form: { show: false },
				},
				traceback: {
					title: '异常信息',
					type: 'input',
					column: { show: false },
					form: { show: false },
				},
			},
		},
	};
};
