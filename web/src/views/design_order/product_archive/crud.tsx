import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { confirmDelete } from '/@/shared/ui/confirm';
import * as api from '/@/api/design_order/product_archive';
import {
	AddReq,
	CreateCrudOptionsProps,
	CreateCrudOptionsRet,
	DelReq,
	EditReq,
	UserPageQuery,
	dict,
} from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';

const REGULATORY_CATEGORY_OPTIONS = [
	{ value: 'medical_device', label: '械品' },
	{ value: 'cosmetic', label: '妆品' },
];

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const selectedRowKeys = ref<any[]>([]);

	const onSelectionChange = (changed: any) => {
		selectedRowKeys.value = changed.map((item: any) => item.id);
	};

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
	const readOnlyDetailForm = {
		component: { props: { disabled: true } },
	};

	return {
		selectedRowKeys,
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			actionbar: {
				buttons: {
					batchDelete: {
						type: 'danger',
						text: '批量删除',
						icon: 'Delete',
						show: auth('design_order:product_archive:Delete'),
						click: async () => {
							if (selectedRowKeys.value.length === 0) {
								ElMessage.warning('请选择要删除的数据！');
								return;
							}
							confirmDelete(selectedRowKeys.value.length).then(async (confirmed) => {
								if (!confirmed) return;
								const res = await api.BatchDelete(selectedRowKeys.value);
								if (res.code === 2000) {
									ElMessage.success('批量删除成功！');
									selectedRowKeys.value = [];
									crudExpose.doRefresh();
								} else {
									ElMessage.error(res.msg || '批量删除失败');
								}
							});
						},
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						iconRight: 'View',
						type: 'text',
						show: auth('design_order:product_archive:View'),
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('design_order:product_archive:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('design_order:product_archive:Delete'),
					},
				},
			},
			table: {
				rowKey: 'id',
				onSelectionChange,
			},
			columns: {
				$checked: {
					title: '选择',
					form: { show: false },
					column: {
						type: 'selection',
						align: 'center',
						width: '50px',
						columnSetDisabled: true,
						// 配合 table.rowKey：翻页后前面勾过的行不会丢
						reserveSelection: true,
					},
				},
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
				product_code: {
					title: '货品编号',
					search: { show: true },
					type: 'input',
					column: { minWidth: 130 },
					form: {
						rules: [{ required: true, message: '货品编号为必填项' }],
						component: { props: { clearable: true, placeholder: '请输入货品编号' } },
					},
				},
				product_name: {
					title: '货品名称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 180 },
					form: {
						rules: [{ required: true, message: '货品名称为必填项' }],
						component: { props: { clearable: true, placeholder: '请输入货品名称' } },
					},
				},
				specification: {
					title: '型号规格',
					type: 'input',
					column: { minWidth: 150 },
					form: {
						component: { props: { clearable: true, placeholder: '如 150ml、5片/盒' } },
					},
				},
				unit: {
					title: '基本单位',
					type: 'input',
					column: { minWidth: 80, align: 'center' },
					form: {
						component: { props: { clearable: true, placeholder: '如 瓶、盒、支' } },
					},
				},
				brand: {
					title: '品牌',
					search: { show: true },
					type: 'input',
					column: { minWidth: 120 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入品牌名称' } },
					},
				},
				regulatory_category: {
					title: '类别',
					type: 'dict-select',
					dict: dict({ data: REGULATORY_CATEGORY_OPTIONS }),
					search: { show: true },
					column: { minWidth: 90, align: 'center' },
					form: {
						rules: [{ required: true, message: '请选择类别' }],
						component: {
							props: {
								clearable: true,
								placeholder: '请选择械品或妆品',
							},
						},
					},
				},
				retail_price: {
					title: '零售价',
					type: 'number',
					column: { minWidth: 100, align: 'right' },
					form: {
						component: { props: { clearable: true, placeholder: '请输入零售价（元）', min: 0, precision: 2 } },
					},
				},
				nickname: {
					title: '昵称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 120 },
					form: {
						component: {
							props: {
								clearable: true,
								placeholder: '请输入产品市场昵称',
							}
						},
					},
				},
				efficacy_scope: {
					title: '妆品功效/ 械品适应症、适用范围',
					type: 'textarea',
					column: {
						minWidth: 260,
						showOverflowTooltip: true,
					},
					form: {
						col: { span: 24 },
						component: {
							props: {
								type: 'textarea',
								rows: 5,
								clearable: true,
								placeholder: '请输入妆品功效或械品适应症、适用范围',
							},
						},
					},
				},
				series: {
					title: '系列',
					type: 'input',
					column: { minWidth: 100 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入产品系列' } },
					},
				},
				create_datetime: {
					title: '创建时间',
					type: 'datetime',
					column: { minWidth: 170, align: 'center' },
					form: readOnlyDetailForm,
					addForm: { show: false },
				},
				update_datetime: {
					title: '写入日期',
					type: 'datetime',
					column: { minWidth: 170, align: 'center' },
					form: readOnlyDetailForm,
					addForm: { show: false },
				},
			},
		},
	};
};
