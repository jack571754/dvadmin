export const BORDER_DICT: Record<string, any> = {
	collgene: { b: { s: 1, cl: { rgb: '#D8E3FF' } } },
	proya: { b: { s: 1, cl: { rgb: '#E5E7EB' } } },
	luxury: { b: { s: 1, cl: { rgb: '#E2E8F0' } } },
};

const PRODUCT_SEPARATOR_BORDER = {
	r: { s: 2, cl: { rgb: '#94A3B8' } },
};

const withProductSeparator = (bd: Record<string, any>) => ({
	...bd,
	...PRODUCT_SEPARATOR_BORDER,
});

const PRODUCT_BLOCK_TOP_BORDER = {
	t: { s: 1, cl: { rgb: '#CBD5E1' } },
};

const withProductBlockHeaderBorder = (bd: Record<string, any>) => ({
	...bd,
	...PRODUCT_BLOCK_TOP_BORDER,
});

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
		const productBd = withProductSeparator(bd);
		const productHeaderBd = withProductBlockHeaderBorder(productBd);
		styles[`headerStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 1, vt: 2, tb: 3, bg: { rgb: c.headerBg }, cl: { rgb: '#111827' }, bd: productHeaderBd, pd: { l: 8, r: 30, t: 6, b: 6 } };
		styles[`headerStyle_highlight_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 1, vt: 2, tb: 3, bg: { rgb: '#FEF08A' }, cl: { rgb: '#111827' }, bd: productHeaderBd };
		styles[`labelStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.labelCl }, bd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`contentCenterStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.bg }, cl: { rgb: c.cl }, bd: productBd };
		styles[`contentCenterStyle_shaded_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.cl }, bd: productBd };
		styles[`contentLeftStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.bg }, cl: { rgb: c.cl }, bd: productBd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`contentLeftStyle_shaded_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, ht: 1, vt: 2, tb: 3, bg: { rgb: c.labelBg }, cl: { rgb: c.cl }, bd: productBd, pd: { l: 8, r: 8, t: 6, b: 6 } };
		styles[`editableCenterStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 1, vt: 2, tb: 3, bg: { rgb: c.editableBg }, cl: { rgb: c.editableCl }, bd: productBd };
		styles[`editableDateStyle_${theme}`] = { ff: 'Microsoft YaHei', fs: 10, bl: 1, ht: 1, vt: 2, tb: 3, bg: { rgb: c.editableBg }, cl: { rgb: c.editableCl }, bd: productBd, n: { pattern: 'yyyy-mm-dd hh:mm:ss' } };
	}
	return styles;
};
