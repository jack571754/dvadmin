import { ProductInfo } from './types';

export const PRODUCT_DATABASE: Record<string, ProductInfo> = {};

export const PRODUCT_KEYWORDS: Record<string, string[]> = {};

export const LABEL_DATA: Record<number, string> = {
	0: '配置字段',
	1: '品牌与标志',
	2: '产品昵称',
	3: '官方全称',
	4: '商品规格',
	5: '主打功效',
	6: '标配赠品配置',
	7: '满赠档位配置',
	8: '会员专享礼门槛',
	9: '会员专享礼价值',
	10: '商品卖点',
	11: '提报价格说明',
	12: '活动时间范围',
	13: '运营备注说明',
};

export const TEMPLATE_TYPES = [
	{ value: 'main_image', label: '主图模板' },
	{ value: 'live_stream', label: '直播间模板' },
	{ value: 'detail_page', label: '详情页模板' },
];

export const TEMPLATE_LABELS: Record<string, Record<number, string>> = {
	main_image: {
		0: '配置字段',
		1: '品牌与标志',
		2: '产品昵称',
		3: '官方全称',
		4: '商品规格',
		5: '主打功效',
		6: '标配赠品配置',
		7: '满赠档位配置',
		8: '会员专享礼门槛',
		9: '会员专享礼价值',
		10: '商品卖点',
		11: '提报价格说明',
		12: '活动时间范围',
		13: '运营备注说明',
	},
	live_stream: {
		0: '配置字段',
		1: '品牌与标志',
		2: '产品昵称',
		3: '官方全称',
		4: '商品规格',
		5: '主播/讲解话术',
		6: '直播标配赠品',
		7: '核心机制/买赠',
		8: '机制价值计算',
		9: '专享券/叠加优惠',
		10: '讲解卖点',
		11: '直播提报价',
		12: '计划上播时间',
		13: '直播备注说明',
	},
	detail_page: {
		0: '配置字段',
		1: '品牌与标志',
		2: '产品昵称',
		3: '官方全称',
		4: '商品规格',
		5: '主要宣称功效',
		6: '买即赠详情',
		7: '满额赠配置',
		8: '会员专享权益',
		9: '加购引导利益点',
		10: '核心视觉卖点',
		11: '页面显示价格',
		12: '首发/起止日期',
		13: '视觉设计备注',
	},
};

export const BORDER_DICT: Record<string, any> = {
	collgene: { b: { s: 1, cl: { rgb: '#D8E3FF' } } },
	proya: { b: { s: 1, cl: { rgb: '#E5E7EB' } } },
	luxury: { b: { s: 1, cl: { rgb: '#E2E8F0' } } },
};

export const buildStylesDict = () => {
	const styles: Record<string, any> = {};
	const themes = ['proya', 'collgene', 'luxury'];
	const configs: Record<string, { bg: string; cl: string; labelBg: string; labelCl: string; editableBg: string; editableCl: string; headerBg: string }> = {
		proya: { bg: '#FFFFFF', cl: '#374151', labelBg: '#F8FAFC', labelCl: '#6B7280', editableBg: '#F5F7FF', editableCl: '#4E6EF2', headerBg: '#EEF4FF' },
		collgene: { bg: '#FFFFFF', cl: '#1E293B', labelBg: '#EEF4FF', labelCl: '#2F6BFF', editableBg: '#F0F4FF', editableCl: '#2F6BFF', headerBg: '#EEF4FF' },
		luxury: { bg: '#FFFFFF', cl: '#1D3557', labelBg: '#FAFAFA', labelCl: '#9A7836', editableBg: '#FFFDF5', editableCl: '#9A7836', headerBg: '#FFFDF5' },
	};
	for (const theme of themes) {
		const c = configs[theme];
		const bd = BORDER_DICT[theme];
		styles[`headerStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 2, vt: 2, tb: 3, bg: { rgb: c.headerBg }, cl: { rgb: '#111827' }, bd };
		styles[`headerStyle_highlight_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 2, vt: 2, tb: 3, bg: { rgb: '#FEF08A' }, cl: { rgb: '#111827' }, bd };
		styles[`labelStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.labelCl }, bd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`contentCenterStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 2, vt: 2, tb: 3, bg: { rgb: c.bg }, cl: { rgb: c.cl }, bd };
		styles[`contentCenterStyle_shaded_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 2, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.cl }, bd };
		styles[`contentLeftStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.bg }, cl: { rgb: c.cl }, bd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`contentLeftStyle_shaded_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.cl }, bd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`editableCenterStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 2, vt: 2, tb: 3, bg: { rgb: c.editableBg }, cl: { rgb: c.editableCl }, bd };
		styles[`editableDateStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 2, vt: 2, tb: 3, bg: { rgb: c.editableBg }, cl: { rgb: c.editableCl }, bd, n: { pattern: 'yyyy-mm-dd hh:mm:ss' } };
	}
	return styles;
};
