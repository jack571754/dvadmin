/**
 * 图书借阅管理 - 常量定义
 */

// 借阅状态配置
export const BORROW_STATUS_DICT = {
	0: { label: '借阅中', color: 'primary' },
	1: { label: '已归还', color: 'success' },
	2: { label: '逾期未还', color: 'danger' },
	3: { label: '已续借', color: 'warning' },
} as const;

// 借阅状态选项列表（用于下拉选择）
export const BORROW_STATUS_OPTIONS = [
	{ label: '借阅中', value: 0, color: 'primary' },
	{ label: '已归还', value: 1, color: 'success' },
	{ label: '逾期未还', value: 2, color: 'danger' },
	{ label: '已续借', value: 3, color: 'warning' },
];

// 借阅状态类型
export type BorrowStatus = 0 | 1 | 2 | 3;

// 续借相关常量
export const DEFAULT_RENEW_DAYS = 30; // 每次续借天数
export const DEFAULT_MAX_RENEW_COUNT = 3; // 最大续借次数
