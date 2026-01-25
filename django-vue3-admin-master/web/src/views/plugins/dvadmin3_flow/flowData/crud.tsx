import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import { shallowRef } from 'vue';
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
		return await api.AddObj(form);
	};

	// 提交审批
	const submitApproval = async ({ row }: any) => {
		try {
			await ElMessageBox.confirm('确认提交审批吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			});
			await api.SubmitApproval(row.id);
			ElMessage.success('提交成功');
			crudExpose.doRefresh();
		} catch (error) {
			// 用户取消
		}
	};

	// 审批通过
	const approve = async ({ row }: any) => {
		try {
			await ElMessageBox.confirm('确认审批通过吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			});
			await api.Approve(row.id, { remark: '审批通过' });
			ElMessage.success('审批通过');
			crudExpose.doRefresh();
		} catch (error) {
			// 用户取消
		}
	};

	// 审批拒绝
	const reject = async ({ row }: any) => {
		try {
			const { value } = await ElMessageBox.prompt('请输入拒绝原因', '审批拒绝', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /\S+/,
				inputErrorMessage: '请输入拒绝原因',
			});
			await api.Reject(row.id, { remark: value });
			ElMessage.success('已拒绝');
			crudExpose.doRefresh();
		} catch (error) {
			// 用户取消
		}
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
						show: auth('flowData:Create'),
					},
				},
			},
			rowHandle: {
				//固定右侧
				fixed: 'right',
				width: 280,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('flowData:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('flowData:Delete'),
					},
					submit: {
						text: '提交',
						type: 'text',
						show: auth('flowData:Submit'),
						click: submitApproval,
					},
					approveBtn: {
						text: '通过',
						type: 'text',
						show: auth('flowData:Approve'),
						click: approve,
					},
					rejectBtn: {
						text: '拒绝',
						type: 'text',
						show: auth('flowData:Reject'),
						click: reject,
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
					title: '名称',
					type: 'input',
					column: {
						minWidth: 150,
					},
					form: {
						show: true,
						rules: [{ required: true, message: '请输入名称' }],
					},
				},
				flow: {
					title: '流程名称',
					type: 'input',
					column: {
						minWidth: 150,
					},
					form: {
						rules: [{ required: true, message: '请选择流程' }],
					},
				},
				procurator: {
					title: '申请人',
					type: 'input',
					column: {
						minWidth: 120,
					},
					form: {
						show: false,
					},
				},
				current_node: {
					title: '当前节点',
					type: 'input',
					column: {
						minWidth: 150,
					},
					form: {
						show: false,
					},
				},
				flow_status: {
					title: '审批状态',
					search: {
						show: true,
					},
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: '待提交', value: 0, color: 'info' },
							{ label: '审批中', value: 1, color: 'warning' },
							{ label: '已通过', value: 2, color: 'success' },
							{ label: '已拒绝', value: 3, color: 'danger' },
						],
					}),
					column: {
						minWidth: 120,
						component: {
							color: 'auto',
						},
					},
					form: {
						show: false,
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
