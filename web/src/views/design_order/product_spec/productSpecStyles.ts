import { buildStylesDict as buildBaseStylesDict } from './constants';

export const PRODUCT_DETAIL_THEMES = ['proya', 'collgene', 'luxury'];

export const PRODUCT_HEADER_PREFIX = '商品提报 ';

const PRODUCT_CONTENT_STYLE_PREFIXES = [
	'contentCenterStyle',
	'contentCenterStyle_shaded',
	'contentLeftStyle',
	'contentLeftStyle_shaded',
	'editableCenterStyle',
	'editableDateStyle',
];

const toRegularBlackStyle = (style: Record<string, any>) => {
	const { bl: _bold, ...regularStyle } = style;
	return {
		...regularStyle,
		bg: { rgb: '#FFFFFF' },
		cl: { rgb: '#000000' },
	};
};

const toBoldBlackStyle = (style: Record<string, any>) => ({
	...style,
	bl: 1,
	bg: { rgb: '#FFFFFF' },
	cl: { rgb: '#000000' },
});

// 仅规格详情页使用：配置字段和商品表头加粗，商品列使用白底黑字。
export const buildProductSpecStylesDict = () => {
	const styles = buildBaseStylesDict();
	for (const theme of PRODUCT_DETAIL_THEMES) {
		const labelStyleName = `labelStyle_${theme}`;
		styles[labelStyleName] = {
			...styles[labelStyleName],
			bl: 1,
		};

		styles[`productHeaderStyle_${theme}`] = toBoldBlackStyle(styles[`headerStyle_${theme}`]);
		styles[`productHeaderStyle_highlight_${theme}`] = toBoldBlackStyle(styles[`headerStyle_highlight_${theme}`]);

		for (const prefix of PRODUCT_CONTENT_STYLE_PREFIXES) {
			const styleName = `${prefix}_${theme}`;
			styles[styleName] = toRegularBlackStyle(styles[styleName]);
		}
	}
	return styles;
};
