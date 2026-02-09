import * as api from './api';
import { dict, compute, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { ref } from 'vue';
import { auth } from '/@/utils/authFunction';
import { successMessage } from '/@/utils/message';

// 间隔周期英文转中文映射
const periodMap: Record<string, string> = {
	days: '天',
	hours: '小时',
	minutes: '分钟',
	seconds: '秒',
	microseconds: '微秒',
};

// Crontab 表达式转中文描述
function crontabToLabel(item: any): string {
	const { minute, hour, day_of_week, day_of_month, month_of_year } = item;
	const cron = `${minute} ${hour} ${day_of_month} ${month_of_year} ${day_of_week}`;
	const parts: string[] = [];

	// 解析月份
	if (month_of_year !== '*') {
		parts.push(`${month_of_year}月`);
	}
	// 解析日期
	if (day_of_month !== '*') {
		parts.push(`${day_of_month}日`);
	}
	// 解析星期
	const weekMap: Record<string, string> = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六' };
	if (day_of_week !== '*') {
		const days = day_of_week.split(',').map((d: string) => weekMap[d.trim()] || d).join('、');
		parts.push(`每周${days}`);
	}
	// 解析时间
	if (hour !== '*' && minute !== '*') {
		parts.push(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
	} else if (hour !== '*') {
		parts.push(`${hour}时`);
	} else if (minute !== '*') {
		parts.push(`每小时第${minute}分`);
	}

	if (parts.length === 0) {
		parts.push('每分钟');
	}

	return `${parts.join(' ')} (${cron})`;
}

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		return await api.GetList(query);
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		// 移除虚拟字段
		delete form.schedule_type;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		// 移除虚拟字段
		delete form.schedule_type;
		return await api.AddObj(form);
	};

	// 加载调度选项
	const intervalOptions = ref<any[]>([]);
	const crontabOptions = ref<any[]>([]);

	const loadScheduleOptions = async () => {
		try {
			const [intervals, crontabs] = await Promise.all([
				api.GetIntervalSchedules(),
				api.GetCrontabSchedules(),
			]);
			intervalOptions.value = (intervals.data || intervals || []).map((item: any) => ({
				label: `每 ${item.every} ${periodMap[item.period] || item.period}`,
				value: item.id,
			}));
			crontabOptions.value = (crontabs.data || crontabs || []).map((item: any) => ({
				label: crontabToLabel(item),
				value: item.id,
			}));
		} catch (e) {
			// ignore
		}
	};
	loadScheduleOptions();

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
						show: auth('system:celeryTask:Create'),
					},
				},
			},
			form: {
				group: {
					type: 'tabs',
					groups: {
						basic: {
							header: '基本信息',
							columns: ['name', 'task', 'enabled', 'description'],
						},
						schedule: {
							header: '调度配置',
							columns: ['schedule_type', 'interval', 'crontab'],
						},
						advanced: {
							header: '高级设置',
							columns: ['args', 'kwargs', 'one_off', 'start_time', 'expires'],
						},
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: { show: false },
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('system:celeryTask:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('system:celeryTask:Delete'),
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
				name: {
					title: '任务名称',
					search: { show: true },
					type: 'input',
					column: { minWidth: 180 },
					form: {
						rules: [{ required: true, message: '任务名称为必填项' }],
						helper: '为该定时任务取一个易于识别的名称',
					},
				},
				task: {
					title: '任务路径',
					search: { show: true },
					type: 'input',
					column: { minWidth: 200 },
					form: {
						rules: [{ required: true, message: '任务路径为必填项' }],
						helper: {
							position: 'label',
							tooltip: { placement: 'top-start' },
							text: 'Python 模块路径，格式：app.module.function_name，如：dvadmin.system.tasks.my_task',
						},
					},
				},
				enabled: {
					title: '启用',
					type: 'dict-switch',
					dict: dict({
						data: [
							{ label: '启用', value: true, color: 'success' },
							{ label: '禁用', value: false, color: 'danger' },
						],
					}),
					column: {
						minWidth: 80,
						component: {
							name: 'fs-dict-switch',
							activeText: '',
							inactiveText: '',
							style: '--el-switch-on-color: var(--el-color-primary); --el-switch-off-color: #dcdfe6',
							onChange: compute((context) => {
								return () => {
									api.ToggleTask(context.row.id).then(() => {
										successMessage(context.row.enabled ? '已启用' : '已禁用');
									});
								};
							}),
						},
					},
					form: { value: true },
				},
				description: {
					title: '描述',
					type: 'input',
					column: { minWidth: 150 },
					form: {
						component: { props: { type: 'textarea', rows: 2, placeholder: '可选，描述该任务的用途' } },
					},
				},
				schedule_type: {
					title: '调度类型',
					type: 'dict-radio',
					dict: dict({
						data: [
							{ label: '间隔调度', value: 'interval' },
							{ label: 'Crontab 调度', value: 'crontab' },
						],
					}),
					column: { show: false },
					form: {
						value: 'interval',
						rules: [{ required: true, message: '请选择调度类型' }],
						helper: {
							render() {
								return (
									<el-alert
										type="info"
										show-icon
										closable={false}
										title="间隔调度：按固定时间间隔重复执行（如每 30 秒）。Crontab 调度：按 cron 表达式在指定时间点执行（如每天 8:00）。"
									/>
								);
							},
						},
						valueChange: ({ form, value }: any) => {
							if (value === 'interval') {
								form.crontab = null;
							} else if (value === 'crontab') {
								form.interval = null;
							}
						},
					},
					valueBuilder: ({ row }: any) => {
						row.schedule_type = row.crontab ? 'crontab' : 'interval';
					},
				},
				interval: {
					title: '间隔调度',
					type: 'dict-select',
					column: {
						minWidth: 140,
						formatter: ({ row }) => row.interval_display || '-',
					},
					form: {
						show: compute(({ form }) => form?.schedule_type === 'interval'),
						rules: [{ required: true, message: '请选择间隔调度规则' }],
						component: {
							options: intervalOptions,
							props: { clearable: true, placeholder: '选择间隔调度规则', filterable: true },
						},
						helper: '如果没有合适的选项，请先在间隔调度管理中创建',
					},
				},
				crontab: {
					title: 'Crontab 调度',
					type: 'dict-select',
					column: {
						minWidth: 180,
						formatter: ({ row }) => row.crontab_display || '-',
					},
					form: {
						show: compute(({ form }) => form?.schedule_type === 'crontab'),
						rules: [{ required: true, message: '请选择 Crontab 调度规则' }],
						component: {
							options: crontabOptions,
							props: { clearable: true, placeholder: '选择 Crontab 调度规则', filterable: true },
						},
						helper: '格式：分 时 日 月 周。如果没有合适的选项，请先在 Crontab 调度管理中创建',
					},
				},
				args: {
					title: '位置参数',
					type: 'input',
					column: { show: false },
					form: {
						value: '[]',
						component: {
							props: {
								type: 'textarea',
								rows: 2,
								placeholder: '如：["arg1", "arg2"]',
							},
						},
						helper: 'JSON 数组格式，如：["value1", 123, true]',
					},
				},
				kwargs: {
					title: '关键字参数',
					type: 'input',
					column: { show: false },
					form: {
						value: '{}',
						component: {
							props: {
								type: 'textarea',
								rows: 2,
								placeholder: '如：{"key": "value"}',
							},
						},
						helper: 'JSON 对象格式，如：{"name": "test", "count": 10}',
					},
				},
				one_off: {
					title: '仅执行一次',
					type: 'dict-switch',
					dict: dict({
						data: [
							{ label: '是', value: true },
							{ label: '否', value: false },
						],
					}),
					column: { show: false },
					form: {
						value: false,
						helper: '开启后任务只执行一次，执行完毕后自动禁用',
					},
				},
				start_time: {
					title: '开始时间',
					type: 'datetime',
					column: { show: false },
					form: {
						component: {
							props: { placeholder: '可选，不填则立即生效' },
						},
						helper: '任务调度的生效起始时间，不填则立即开始',
					},
				},
				expires: {
					title: '过期时间',
					type: 'datetime',
					column: { show: false },
					form: {
						component: {
							props: { placeholder: '可选，不填则永不过期' },
						},
						helper: '任务调度的过期时间，超过此时间后不再执行',
					},
				},
				total_run_count: {
					title: '运行次数',
					type: 'number',
					column: { minWidth: 100, align: 'center' },
					form: { show: false },
				},
				last_run_at: {
					title: '上次运行',
					type: 'datetime',
					column: { minWidth: 170 },
					form: { show: false },
				},
			},
		},
	};
};
