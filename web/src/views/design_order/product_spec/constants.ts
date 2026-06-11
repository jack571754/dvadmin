import { ProductInfo } from './types';

export const PRODUCT_DATABASE: Record<string, ProductInfo> = {
	'可丽金胶卷精华水': {
		nickname: '可丽金胶卷精华水',
		brand: '巨子生物 | 可丽金',
		fullName: '可丽金重组胶原蛋白蕴活光塑紧致抗皱精华水',
		efficacy: '双效充能紧·弹·亮，3天改善垮·纹·暗*',
		spec: '150ml',
		gifts: [
			{ name: '可丽金胶卷精华水', qty: '2 盒' },
			{ name: '可丽金健肤高保湿面膜', qty: '1 片' },
		],
		thresholdA: '满 369 元赠胶原大膜王1盒+面膜2片',
		valueA: '价值 143 元',
		thresholdB: '满 569 元赠大膜王1盒+次抛1盒+面霜2袋',
		valueB: '价值 308 元',
		memberGift: '会员满 869 元赠大膜王1盒+次抛1盒+面膜5片',
		memberValue: '价值 409 元',
		sellingPoint: '拍 1 到手两件正装量 共 300mL',
		price: '309',
		startDate: '2026-05-15',
		endDate: '2026-05-31',
		remarks: '赠品数量有限，赠完即止',
	},
	'可丽金健肤高保湿面膜': {
		nickname: '可丽金健肤高保湿面膜',
		brand: '巨子生物 | 可丽金',
		fullName: '可丽金Human-like重组胶原蛋白健肤高保湿面膜',
		efficacy: '强韧屏障，深层补水，缓解干燥红热',
		spec: '5片/盒',
		gifts: [{ name: '可丽金健肤高保湿面膜', qty: '3 片' }],
		thresholdA: '满 299 元赠同款面膜2片',
		valueA: '价值 58 元',
		thresholdB: '满 499 元赠同款面膜5片/盒',
		valueB: '价值 148 元',
		memberGift: '会员专享额外赠同款面膜1片',
		memberValue: '价值 29 元',
		sellingPoint: '敏感肌专研 舒缓修复',
		price: '138',
		startDate: '2026-05-15',
		endDate: '2026-05-31',
		remarks: '适用于红血丝、角质层薄弱肌肤',
	},
	'可丽金胶原大膜王': {
		nickname: '可丽金胶原大膜王',
		brand: '巨子生物 | 可丽金',
		fullName: '可丽金重组胶原蛋白蕴活光塑紧致驻颜面膜',
		efficacy: '紧致丰盈，淡化细纹，焕亮抗初老',
		spec: '50g',
		gifts: [
			{ name: '可丽金胶卷面霜', qty: '1 盒' },
			{ name: '可丽金胶卷精华水', qty: '1 瓶' },
		],
		thresholdA: '满 399 元赠嘭嘭次抛3支',
		valueA: '价值 99 元',
		thresholdB: '满 699 元赠大膜王同款3杯/盒',
		valueB: '价值 199 元',
		memberGift: '会员专享额外赠次抛1支',
		memberValue: '价值 33 元',
		sellingPoint: '涂抹面膜 抗皱紧致天花板',
		price: '269',
		startDate: '2026-05-15',
		endDate: '2026-05-31',
		remarks: '干皮/油皮皆适用，配合精华水更佳',
	},
	'可丽金嘭嘭次抛': {
		nickname: '可丽金嘭嘭次抛',
		brand: '巨子生物 | 可丽金',
		fullName: '可丽金Human-like重组胶原蛋白赋能珍萃紧致弹润次抛精华',
		efficacy: '嘭弹饱满，深层淡纹，即刻水润高保湿',
		spec: '1.5ml*30支',
		gifts: [{ name: '可丽金嘭嘭次抛', qty: '5 支' }],
		thresholdA: '满 350 元赠高保湿面膜2片',
		valueA: '价值 58 元',
		thresholdB: '满 550 元赠同款次抛5支*2盒',
		valueB: '价值 198 元',
		memberGift: '会员专享额外赠高保湿面膜1片',
		memberValue: '价值 29 元',
		sellingPoint: '独立包装 锁鲜即刻充盈',
		price: '199',
		startDate: '2026-05-15',
		endDate: '2026-05-31',
		remarks: '一日一支，卫生便携，次抛精纯科技',
	},
	'可丽金胶卷面霜': {
		nickname: '可丽金胶卷面霜',
		brand: '巨子生物 | 可丽金',
		fullName: '可丽金重组胶原蛋白蕴活提拉紧塑抗皱精萃霜',
		efficacy: '提拉塑颜，饱满淡纹，淡化动态纹',
		spec: '50g',
		gifts: [{ name: '可丽金胶卷面霜', qty: '2 盒' }],
		thresholdA: '满 459 元赠大膜王3杯/盒',
		valueA: '价值 143 元',
		thresholdB: '满 759 元赠同款面霜15g',
		valueB: '价值 289 元',
		memberGift: '会员专享额外赠次抛2支',
		memberValue: '价值 66 元',
		sellingPoint: '重组胶原蛋白 精雕面部轮廓',
		price: '329',
		startDate: '2026-05-15',
		endDate: '2026-05-31',
		remarks: '滋润不油腻，推荐晚间护肤最后一步',
	},
};

export const PRODUCT_KEYWORDS: Record<string, string[]> = {
	'可丽金胶卷精华水': ['精华水', '胶卷精华水'],
	'可丽金健肤高保湿面膜': ['面膜', '健肤高保湿面膜', '高保湿面膜'],
	'可丽金胶原大膜王': ['大膜王', '胶原大膜王'],
	'可丽金嘭嘭次抛': ['次抛', '嘭嘭次抛'],
	'可丽金胶卷面霜': ['面霜', '胶卷面霜'],
};

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
