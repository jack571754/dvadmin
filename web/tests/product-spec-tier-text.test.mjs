import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const transpile = (relativePath, requireModule = () => ({})) => {
	const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
	const compiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;
	const moduleExports = {};
	new Function('exports', 'require', compiled)(moduleExports, requireModule);
	return moduleExports;
};

const base = '../src/views/design_order/product_spec/';
const utils = transpile(`${base}utils.ts`);
const productDisplay = transpile(`${base}productDisplay.ts`);
const giftStrategies = transpile(`${base}giftStrategies.ts`, (specifier) => {
	if (specifier === './utils') return utils;
	throw new Error(`Unexpected module: ${specifier}`);
});
const mainProductRefs = transpile(`${base}mainProductRefs.ts`, (specifier) => {
	if (specifier === './utils') return utils;
	if (specifier === './productDisplay') return productDisplay;
	throw new Error(`Unexpected module: ${specifier}`);
});
const formTierText = transpile(`${base}formTierText.ts`, (specifier) => {
	if (specifier === './utils') return utils;
	if (specifier === './productDisplay') return productDisplay;
	if (specifier === './mainProductRefs') return mainProductRefs;
	if (specifier === './giftStrategies') return giftStrategies;
	throw new Error(`Unexpected module: ${specifier}`);
});

// splitMultiProductText：括号内的 + / | 不是分隔符
{
	assert.deepEqual(mainProductRefs.splitMultiProductText('A面霜+B精华'), ['A面霜', 'B精华']);
	assert.deepEqual(mainProductRefs.splitMultiProductText('A面霜（50g+10g赠）+B精华'), [
		'A面霜（50g+10g赠）',
		'B精华',
	]);
	assert.deepEqual(mainProductRefs.splitMultiProductText('A|B|C'), ['A', 'B', 'C']);
	assert.deepEqual(mainProductRefs.splitMultiProductText(''), []);
	assert.deepEqual(mainProductRefs.splitMultiProductText(null), []);
}

// findTopLevelQuantity：只取括号外的 ×N，且取最后一个
{
	assert.equal(mainProductRefs.findTopLevelQuantity('面霜（30ml×2）'), null);
	assert.deepEqual(mainProductRefs.findTopLevelQuantity('面霜50g×3盒'), {
		index: 5,
		qty: 3,
		unit: '盒',
	});
	// 括号内的 ×2 被忽略，只识别外层的 ×4
	assert.equal(mainProductRefs.findTopLevelQuantity('面霜（30ml×2）×4瓶').qty, 4);
}

// parseQtyProductText：剥离编号后缀并切出数量单位
{
	assert.deepEqual(mainProductRefs.parseQtyProductText('面霜[1]50g×2盒'), {
		name: '面霜50g',
		qty: 2,
		unit: '盒',
	});
	assert.deepEqual(mainProductRefs.parseQtyProductText('面霜50g'), {
		name: '面霜50g',
		qty: 1,
		unit: '',
	});
	// 数量非法时回落到 1，而不是 0 或 NaN
	assert.equal(mainProductRefs.parseQtyProductText('面霜×0').qty, 1);
}

// normalizeQty / stripProductSuffixes
{
	assert.equal(mainProductRefs.normalizeQty(0), 1);
	assert.equal(mainProductRefs.normalizeQty(-3), 1);
	assert.equal(mainProductRefs.normalizeQty(Number.NaN), 1);
	assert.equal(mainProductRefs.normalizeQty(5), 5);
	assert.equal(mainProductRefs.stripProductSuffixes('面霜[1][2]'), '面霜');
	assert.equal(mainProductRefs.stripProductSuffixes('面霜[1, 2]'), '面霜');
}

const PRODUCTS = [
	{
		productCode: 'P-1',
		nickname: '弹润面霜',
		shortName: '',
		brand: '珀莱雅',
		fullName: '弹润紧致面霜',
		spec: '50g/瓶',
		unit: '瓶',
		retailPrice: '199',
	},
	{
		productCode: 'P-2',
		nickname: '弹润面霜',
		shortName: '',
		brand: '珀莱雅',
		fullName: '弹润紧致面霜大规格',
		spec: '100g/瓶',
		unit: '瓶',
		retailPrice: '299',
	},
	{
		productCode: 'P-3',
		nickname: '水乳精华',
		shortName: '',
		brand: '珀莱雅',
		fullName: '水乳精华液',
		spec: '30ml/支',
		unit: '支',
		retailPrice: '99',
	},
];

const parser = mainProductRefs.createMainProductRefParser({
	productList: () => PRODUCTS,
	uniqueNicknames: () => ['弹润面霜', '水乳精华'],
});

// findProductByMainRef：昵称+规格优先于昵称单独匹配
{
	assert.equal(parser.findProductByMainRef('弹润面霜', '100g/瓶', '').productCode, 'P-2');
	assert.equal(parser.findProductByMainRef('弹润面霜', '', '弹润紧致面霜').productCode, 'P-1');
	assert.equal(parser.findProductByMainRef('弹润面霜', '', '').productCode, 'P-1');
	assert.equal(parser.findProductByMainRef('不存在', '', ''), null);
}

// parseMainProductRefs：从"昵称+规格"混排文本里切出昵称与规格，并回填单位
{
	const refs = parser.parseMainProductRefs('弹润面霜100g/瓶×2瓶+水乳精华30ml/支');
	assert.equal(refs.length, 2);
	assert.deepEqual(refs[0], {
		cleanNick: '弹润面霜',
		spec: '100g/瓶',
		qty: 2,
		unit: '瓶',
		fullName: '弹润紧致面霜大规格',
	});
	assert.equal(refs[1].cleanNick, '水乳精华');
	assert.equal(refs[1].qty, 1);
	assert.equal(refs[1].unit, '支');
}

// parseMainProductRefs：昵称库外的文本按原样保留（getCleanNickname 回落到整串），空输入返回空数组
{
	const refs = parser.parseMainProductRefs('未知商品×2');
	assert.equal(refs.length, 1);
	assert.equal(refs[0].cleanNick, '未知商品');
	assert.equal(refs[0].qty, 2);
	assert.equal(refs[0].fullName, '');
	assert.deepEqual(parser.parseMainProductRefs(''), []);
}

// formatMainProductRefText / formatNumberedMainProductRefText 往返一致
{
	const [ref] = parser.parseMainProductRefs('弹润面霜100g/瓶×2瓶');
	const text = mainProductRefs.formatMainProductRefText(ref);
	assert.deepEqual(parser.parseMainProductRefs(text), [ref]);

	const numbered = mainProductRefs.formatNumberedMainProductRefText(ref, 3);
	assert.ok(numbered.startsWith('弹润面霜[3]'));
	// 编号后缀会被解析端剥离，不影响回读
	assert.deepEqual(parser.parseMainProductRefs(numbered), [ref]);
	assert.equal(
		mainProductRefs.formatNumberedMainProductRefText(ref, undefined),
		mainProductRefs.formatMainProductRefText(ref),
	);
}

const tierText = formTierText.createFormTierText(() => PRODUCTS);

// isPlaceholderTierValue
{
	assert.equal(formTierText.isPlaceholderTierValue(''), true);
	assert.equal(formTierText.isPlaceholderTierValue('价值 待填写 元'), true);
	assert.equal(formTierText.isPlaceholderTierValue('价值 元'), true);
	assert.equal(formTierText.isPlaceholderTierValue('价值 199 元'), false);
}

// stripTrailingBrandLabel：只剥离结尾括号里的品牌标注
{
	assert.equal(formTierText.stripTrailingBrandLabel('弹润面霜（珀莱雅）'), '弹润面霜');
	assert.equal(formTierText.stripTrailingBrandLabel('弹润面霜（50g）套装'), '弹润面霜（50g）套装');
}

// parseFootnoteProductMap：从备注脚注行还原编号→商品
{
	const map = tierText.parseFootnoteProductMap(
		'[1]指弹润紧致面霜大规格\n无关行',
	);
	assert.equal(map[1].productCode, 'P-2');
	assert.equal(Object.keys(map).length, 1);
}

// findUniqueTierProduct：昵称重复时不猜，返回 undefined
{
	assert.equal(tierText.findUniqueTierProduct('弹润面霜'), undefined);
	assert.equal(tierText.findUniqueTierProduct('水乳精华').productCode, 'P-3');
	assert.equal(tierText.findUniqueTierProduct(''), undefined);
}

// parseQtyItems：按编号脚注精确匹配到具体规格
{
	const footnotes = tierText.parseFootnoteProductMap(
		'[1]指弹润紧致面霜大规格',
	);
	const items = tierText.parseQtyItems('弹润面霜[1]×2瓶', footnotes);
	assert.equal(items.length, 1);
	assert.equal(items[0].productCode, 'P-2');
	assert.equal(items[0].qty, 2);
	assert.equal(items[0].unit, '瓶');

	assert.deepEqual(tierText.parseQtyItems('—'), []);
	assert.deepEqual(tierText.parseQtyItems(''), []);
}

// parseQtyItems：未知商品保留原文，不静默丢弃
{
	const items = tierText.parseQtyItems('神秘赠品×3件');
	assert.equal(items.length, 1);
	assert.equal(items[0].productCode, '');
	assert.equal(items[0].nickname, '神秘赠品');
	assert.equal(items[0].qty, 3);
}

// parseTiersFromText：新格式【门槛｜价值￥N】
{
	const tiers = tierText.parseTiersFromText('【满 369 元赠｜价值￥143】：水乳精华×2支');
	assert.equal(tiers.length, 1);
	assert.equal(tiers[0].threshold, '满 369 元');
	assert.equal(tiers[0].value, '价值 143 元');
	assert.equal(tiers[0].items[0].productCode, 'P-3');
	assert.equal(tiers[0].items[0].qty, 2);
}

// parseTiersFromText：旧格式 A档: 满N元赠 …（价值M元）
{
	const tiers = tierText.parseTiersFromText('A档: 满 369 元赠 水乳精华×1支（价值99元）');
	assert.equal(tiers.length, 1);
	assert.equal(tiers[0].threshold, '满 369 元');
	assert.equal(tiers[0].value, '价值 99 元');
	assert.equal(tiers[0].items.length, 1);
}

// parseTiersFromText：缺少价值时留空，交给零售价自动计算
{
	const [tier] = tierText.parseTiersFromText('A档: 满 369 元赠 水乳精华×1支');
	assert.equal(tier.value, '');
}

// parseTiersFromText：多档拆分与空输入
{
	assert.equal(
		tierText.parseTiersFromText('A档: 满 100 元赠 水乳精华×1支；B档: 满 200 元赠 水乳精华×2支')
			.length,
		2,
	);
	assert.deepEqual(tierText.parseTiersFromText(''), []);
	assert.deepEqual(tierText.parseTiersFromText('***'), []);
}

// formatTiersToText → parseTiersFromText：带脚注编号并附上备注时，能还原到具体商品
{
	const original = tierText.parseTiersFromText('【满 369 元赠｜价值￥143】：水乳精华×2支');
	const remarks = '[1]指水乳精华液';
	const text = formTierText.formatTiersToText(original, () => 1);
	assert.ok(text.includes('水乳精华[1]'), text);

	const roundTripped = tierText.parseTiersFromText(text, remarks);
	assert.equal(roundTripped.length, 1);
	assert.equal(roundTripped[0].threshold, original[0].threshold);
	assert.equal(roundTripped[0].value, original[0].value);
	assert.deepEqual(roundTripped[0].items, original[0].items);

	assert.equal(formTierText.formatTiersToText([]), '');
}

// 无脚注编号时规格会并入名称：这是现有行为，商品编码无法还原
{
	const original = tierText.parseTiersFromText('【满 369 元赠｜价值￥143】：水乳精华×2支');
	const roundTripped = tierText.parseTiersFromText(formTierText.formatTiersToText(original));
	assert.equal(roundTripped[0].threshold, original[0].threshold);
	assert.equal(roundTripped[0].value, original[0].value);
	assert.equal(roundTripped[0].items[0].qty, 2);
	assert.equal(roundTripped[0].items[0].nickname, '水乳精华 30ml/支');
	assert.equal(roundTripped[0].items[0].productCode, '');
}

// cloneTiers 深拷贝：修改副本不影响原对象
{
	const tiers = tierText.parseTiersFromText('【满 369 元赠｜价值￥143】：水乳精华×2支');
	const copy = formTierText.cloneTiers(tiers);
	copy[0].items[0].qty = 99;
	copy[0].threshold = '改了';
	assert.equal(tiers[0].items[0].qty, 2);
	assert.equal(tiers[0].threshold, '满 369 元');
}

// syncTierValue：自动值覆盖占位值，手填值被保留
{
	const [autoTier] = tierText.parseTiersFromText('A档: 满 369 元赠 水乳精华×2支');
	autoTier.value = '';
	formTierText.syncTierValue(autoTier);
	const computedValue = giftStrategies.calculateGiftValue(autoTier.items);
	assert.equal(autoTier.value, computedValue);

	const [manualTier] = tierText.parseTiersFromText('A档: 满 369 元赠 水乳精华×2支');
	manualTier.value = '价值 888 元';
	formTierText.syncTierValue(manualTier);
	assert.equal(manualTier.value, '价值 888 元');
}

console.log('product-spec main product refs & tier text passed');
