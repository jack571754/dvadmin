import * as api from '/@/api/design_order/product_archive';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';
import { request } from '/@/utils/service';

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
					title: '型号规格/净含量',
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
				short_name: {
					title: '货品简称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 120 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入货品简称' } },
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
				product_category: {
					title: '产品类目',
					type: 'input',
					column: { minWidth: 110 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入产品类目' } },
					},
				},
				product_classification: {
					title: '产品分类',
					type: 'input',
					column: { minWidth: 110 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入产品分类' } },
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
					type: 'dict-select',
					dict: dict({
						async getData() {
							return request({
								url: '/api/design_order/product_archives/dict/',
								method: 'get',
							}).then((ret: any) => {
								const uniqueNames = new Set<string>();
								if (ret.code === 2000 && Array.isArray(ret.data)) {
									ret.data.forEach((item: any) => {
										if (item.nickname) {
											uniqueNames.add(item.nickname.trim());
										}
									});
								}
								return Array.from(uniqueNames).map(name => ({
									value: name,
									label: name
								}));
							});
						}
					}),
					column: { minWidth: 120 },
					form: {
						component: {
							props: {
								allowCreate: true,
								filterable: true,
								clearable: true,
								placeholder: '请输入或选择产品市场昵称',
							}
						},
					},
				},
				gifts: {
					title: '标配赠品配置',
					type: 'input',
					column: { minWidth: 200 },
					form: {
						component: { props: { clearable: true, placeholder: '格式: 🎁 赠品A x 1片 | 🎁 赠品B x 2盒' } },
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
				category: {
					title: '类目',
					type: 'input',
					column: { minWidth: 100 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入类目细分' } },
					},
				},
				product_type: {
					title: '正品/小样',
					type: 'dict-select',
					column: { minWidth: 100, align: 'center' },
					dict: dict({
						data: [
							{ value: 'authentic', label: '正品' },
							{ value: 'sample', label: '小样' },
						],
					}),
					form: {
						value: 'authentic',
						component: { props: { clearable: true, placeholder: '请选择' } },
					},
				},
				product_status: {
					title: '商品状态',
					type: 'dict-select',
					column: { minWidth: 100, align: 'center' },
					dict: dict({
						data: [
							{ value: 'on_sale', label: '在售' },
							{ value: 'off_sale', label: '停售' },
							{ value: 'pending', label: '待上市' },
						],
					}),
					form: {
						value: 'on_sale',
						component: { props: { clearable: true, placeholder: '请选择' } },
					},
				},
				box_spec: {
					title: '箱规',
					type: 'input',
					column: { minWidth: 100 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入箱规' } },
					},
				},
				sale_status: {
					title: '在售/新品',
					type: 'dict-select',
					column: { minWidth: 100, align: 'center' },
					dict: dict({
						data: [
							{ value: 'on_sale', label: '在售' },
							{ value: 'new', label: '新品' },
						],
					}),
					form: {
						value: 'on_sale',
						component: { props: { clearable: true, placeholder: '请选择' } },
					},
				},
				auxiliary: {
					title: '辅助',
					type: 'input',
					column: { minWidth: 100 },
					form: {
						component: { props: { clearable: true, placeholder: '请输入辅助信息' } },
					},
				},
				need_maintenance: {
					title: '是否需要维护',
					type: 'dict-switch',
					column: { minWidth: 120, align: 'center' },
					dict: dict({
						data: [
							{ value: true, label: '是' },
							{ value: false, label: '否' },
						],
					}),
					form: {
						value: false,
					},
				},
				create_datetime: {
					title: '创建时间',
					type: 'datetime',
					column: { minWidth: 170, align: 'center' },
					form: { show: false },
				},
				update_datetime: {
					title: '写入日期',
					type: 'datetime',
					column: { minWidth: 170, align: 'center' },
					form: { show: false },
				},
			},
		},
	};
};
