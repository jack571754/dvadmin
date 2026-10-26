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
const resolveDeps = (specifier) => {
	if (specifier === './utils') return utils;
	throw new Error(`Unexpected module: ${specifier}`);
};
const validation = transpile(`${base}submissionValidation.ts`, resolveDeps);
const exportCsv = transpile(`${base}exportCsv.ts`, resolveDeps);

const ROWS_PER_BLOCK = 14;
const COLS_PER_BLOCK = 6;

const FIELDS = [
	{ row: 1, key: 'nickname', label: '商品昵称', style: 'editableCenter', kind: 'text' },
	{ row: 2, key: 'brand', label: '品牌', style: 'contentCenter', kind: 'text' },
	{ row: 3, key: 'efficacy', label: '功效', style: 'contentLeft', kind: 'longtext' },
	{ row: 4, key: 'gifts', label: '赠品', style: 'contentLeft', kind: 'gifts' },
	{ row: 5, key: 'price', label: '零售价', style: 'editableCenter', kind: 'price' },
	{ row: 6, key: 'dateRange', label: '活动时间', style: 'editableDate', kind: 'dateRange' },
];

const SCHEMA = {
	templateType: 'main_image',
	label: '主图',
	rowsPerBlock: ROWS_PER_BLOCK,
	columnsPerBlock: COLS_PER_BLOCK,
	fields: FIELDS,
	validation: {
		requiredSubmissionFields: ['name', 'shop'],
		requiredProductFields: ['brand'],
		priceFieldKey: 'price',
		dateRangeFieldKey: 'dateRange',
	},
};

/** 用 `块起始行:列` 作为键铺一张假表，方便按字段名精确定位单元格。 */
const buildSheet = (products) => {
	const cells = new Map();
	products.forEach((product, index) => {
		const { blockCol, blockStartRow } = utils.getProductCoords(
			index,
			ROWS_PER_BLOCK,
			COLS_PER_BLOCK,
		);
		for (const [key, value] of Object.entries(product)) {
			const field = FIELDS.find((item) => item.key === key);
			if (!field) throw new Error(`测试数据里的字段不存在：${key}`);
			cells.set(`${blockStartRow + field.row}:${blockCol}`, value);
		}
	});
	return (row, col) => cells.get(`${row}:${col}`) ?? '';
};

const createValidator = (products, overrides = {}) =>
	validation.createSubmissionValidator({
		submissionName: () => '双十一提报',
		submissionShop: () => '天猫旗舰店',
		formCount: () => products.length,
		schema: () => SCHEMA,
		fields: () => FIELDS,
		rowsPerBlock: () => ROWS_PER_BLOCK,
		colsPerBlock: () => COLS_PER_BLOCK,
		nicknameRow: () => 1,
		readCellValue: buildSheet(products),
		cleanNickname: (raw) => String(raw || '').trim(),
		productLabel: (index) => `商品提报 ${index + 1}`,
		...overrides,
	});

const FULL_PRODUCT = {
	nickname: '弹润面霜',
	brand: '珀莱雅',
	efficacy: '紧致提亮',
	gifts: '🎁 小样×2',
	price: 199,
	dateRange: '2026-08-04 20:00 ~ 2026-08-08 00:00',
};

// 完整填写的单个商品：无错误无警告
{
	const result = createValidator([FULL_PRODUCT]).validateBeforeSubmit();
	assert.equal(result.valid, true);
	assert.deepEqual(result.errors, []);
	assert.deepEqual(result.warnings, []);
}

// 提报名称与店铺为空：报两条提报级错误，productIndex 为 -1
{
	const result = createValidator([FULL_PRODUCT], {
		submissionName: () => '   ',
		submissionShop: () => '',
	}).validateBeforeSubmit();
	assert.equal(result.valid, false);
	assert.deepEqual(
		result.errors.map((error) => error.field),
		['name', 'shop'],
	);
	assert.ok(result.errors.every((error) => error.productIndex === -1));
}

// 没有任何填写了昵称的商品：报"至少1个有效产品"，且不产生逐字段错误
{
	const result = createValidator([{ brand: '珀莱雅' }, {}]).validateBeforeSubmit();
	assert.equal(result.valid, false);
	assert.deepEqual(
		result.errors.map((error) => error.field),
		['products'],
	);
	assert.deepEqual(result.warnings, []);
}

// 空白列被跳过：只校验填了昵称的那一列
{
	const result = createValidator([{}, FULL_PRODUCT]).validateBeforeSubmit();
	assert.equal(result.valid, true);
}

// 必填字段缺失 / *** 无查看权限：都算未填写
{
	const missing = createValidator([{ ...FULL_PRODUCT, brand: '' }]).validateBeforeSubmit();
	assert.deepEqual(
		missing.errors.map((error) => [error.field, error.rule]),
		[['brand', 'required']],
	);
	assert.equal(missing.errors[0].message, '商品提报 1 的「品牌」不能为空');

	const masked = createValidator([{ ...FULL_PRODUCT, brand: '***' }]).validateBeforeSubmit();
	assert.deepEqual(
		masked.errors.map((error) => error.field),
		['brand'],
	);
}

// 价格：空 → 不再阻断（非必填）；非正数或非数字 → format；带货币符号的正数合法
{
	const empty = createValidator([{ ...FULL_PRODUCT, price: '' }]).validateBeforeSubmit();
	assert.equal(empty.valid, true);
	assert.deepEqual(empty.errors, []);

	for (const badPrice of ['0', '待定', '-5', '1.2.3', 'abc199', '￥199.90', 'Infinity', 'NaN']) {
		const bad = createValidator([{ ...FULL_PRODUCT, price: badPrice }]).validateBeforeSubmit();
		assert.deepEqual(
			bad.errors.map((error) => [error.field, error.rule]),
			[['price', 'format']],
			`price=${badPrice}`,
		);
		assert.equal(bad.errors[0].message, '商品提报 1 的「零售价」必须为大于0的数值');
	}

	for (const price of ['199.90', '1,299.90', '+5', '1e3']) {
		assert.equal(createValidator([{ ...FULL_PRODUCT, price }]).validateBeforeSubmit().valid, true);
	}

}

// 活动时间：格式错误 / 起晚于止 / 不含分隔符时沿用历史行为不校验格式
{
	const badFormat = createValidator([
		{ ...FULL_PRODUCT, dateRange: '2026/08/04 ~ 2026/08/08' },
	]).validateBeforeSubmit();
	assert.deepEqual(
		badFormat.errors.map((error) => [error.field, error.rule]),
		[['dateRange', 'format']],
	);

	const reversed = createValidator([
		{ ...FULL_PRODUCT, dateRange: '2026-08-08 00:00 ~ 2026-08-04 20:00' },
	]).validateBeforeSubmit();
	assert.deepEqual(
		reversed.errors.map((error) => [error.field, error.rule]),
		[['dateRange', 'range']],
	);
	assert.equal(reversed.errors[0].message, '商品提报 1 的活动开始时间不能晚于结束时间');

	// 仅日期（无时分）也符合格式
	assert.equal(
		createValidator([
			{ ...FULL_PRODUCT, dateRange: '2026-08-04 ~ 2026-08-08' },
		]).validateBeforeSubmit().valid,
		true,
	);

	// 没有 ~ 的单个日期不做格式校验
	assert.equal(
		createValidator([{ ...FULL_PRODUCT, dateRange: '长期有效' }]).validateBeforeSubmit().valid,
		true,
	);

	// 活动时间非必填：留空不再阻断提交
	assert.equal(
		createValidator([{ ...FULL_PRODUCT, dateRange: '' }]).validateBeforeSubmit().valid,
		true,
	);
}

// longtext / gifts 为空只给警告，不阻断（valid 仍为 true）
{
	const result = createValidator([
		{ ...FULL_PRODUCT, efficacy: '', gifts: '***' },
	]).validateBeforeSubmit();
	assert.equal(result.valid, true);
	assert.deepEqual(
		result.warnings.map((warning) => warning.field),
		['efficacy', 'gifts'],
	);
	assert.equal(result.warnings[0].message, '商品提报 1 的「功效」为空，建议补充');
}

// 模板 requiredProductFields 配置了不存在的字段：作为配置错误上报，不静默忽略
{
	const result = validation
		.createSubmissionValidator({
			submissionName: () => '提报',
			submissionShop: () => '店铺',
			formCount: () => 1,
			schema: () => ({
				...SCHEMA,
				validation: { ...SCHEMA.validation, requiredProductFields: ['brand', 'notExist'] },
			}),
			fields: () => FIELDS,
			rowsPerBlock: () => ROWS_PER_BLOCK,
			colsPerBlock: () => COLS_PER_BLOCK,
			nicknameRow: () => 1,
			readCellValue: buildSheet([FULL_PRODUCT]),
			cleanNickname: (raw) => String(raw || '').trim(),
			productLabel: (index) => `商品提报 ${index + 1}`,
		})
		.validateBeforeSubmit();
	assert.equal(result.valid, false);
	assert.deepEqual(
		result.errors.map((error) => error.field),
		['notExist'],
	);
	assert.equal(result.errors[0].message, '模板缺少必填字段配置：notExist');
}

// 跨块：第 7 个商品落到第二块，行偏移仍能正确定位
{
	const products = Array.from({ length: 7 }, () => FULL_PRODUCT);
	products[6] = { ...FULL_PRODUCT, brand: '' };
	const result = createValidator(products).validateBeforeSubmit();
	assert.deepEqual(
		result.errors.map((error) => [error.productIndex, error.field]),
		[[6, 'brand']],
	);
}

// 未配置价格 / 日期字段键时跳过这两项校验
{
	const result = validation
		.createSubmissionValidator({
			submissionName: () => '提报',
			submissionShop: () => '店铺',
			formCount: () => 1,
			schema: () => ({
				...SCHEMA,
				validation: { requiredSubmissionFields: [], requiredProductFields: [] },
			}),
			fields: () => FIELDS,
			rowsPerBlock: () => ROWS_PER_BLOCK,
			colsPerBlock: () => COLS_PER_BLOCK,
			nicknameRow: () => 1,
			readCellValue: buildSheet([{ nickname: '弹润面霜', efficacy: 'x', gifts: 'y' }]),
			cleanNickname: (raw) => String(raw || '').trim(),
			productLabel: (index) => `商品提报 ${index + 1}`,
		})
		.validateBeforeSubmit();
	assert.equal(result.valid, true);
}

// ========== CSV 导出 ==========

// escapeCsvValue：只有含分隔符、引号、换行的字段才加引号
{
	assert.equal(exportCsv.escapeCsvValue('普通文本'), '普通文本');
	assert.equal(exportCsv.escapeCsvValue('含,逗号'), '"含,逗号"');
	assert.equal(exportCsv.escapeCsvValue('含"引号'), '"含""引号"');
	assert.equal(exportCsv.escapeCsvValue('第一行\n第二行'), '"第一行\n第二行"');
	assert.equal(exportCsv.escapeCsvValue(null), '');
	assert.equal(exportCsv.escapeCsvValue(undefined), '');
	assert.equal(exportCsv.escapeCsvValue(0), '0');
}

const createCsvDeps = (products) => ({
	formCount: () => products.length,
	fields: () => FIELDS,
	rowsPerBlock: () => ROWS_PER_BLOCK,
	colsPerBlock: () => COLS_PER_BLOCK,
	nicknameRow: () => 1,
	readCellValue: buildSheet(products),
	productLabel: (index) => `商品提报 ${index + 1}`,
});

// buildSpecCsvRows：表头 + 每个已填写商品一行，赠品图标前缀被剥掉
{
	const rows = exportCsv.buildSpecCsvRows(createCsvDeps([FULL_PRODUCT]));
	assert.deepEqual(rows[0], ['商品ID', '商品昵称', '品牌', '功效', '赠品', '零售价', '活动时间']);
	assert.deepEqual(rows[1], [
		'商品提报 1',
		'弹润面霜',
		'珀莱雅',
		'紧致提亮',
		'小样×2',
		'199',
		'2026-08-04 20:00 ~ 2026-08-08 00:00',
	]);
	assert.equal(rows.length, 2);
}

// buildSpecCsvRows：没填昵称的列不导出，序号沿用原始下标
{
	const rows = exportCsv.buildSpecCsvRows(
		createCsvDeps([{}, FULL_PRODUCT, { brand: '只有品牌' }]),
	);
	assert.equal(rows.length, 2);
	assert.equal(rows[1][0], '商品提报 2');
}

// buildSpecCsvText：逐行拼接并按 CSV 规则转义
{
	const text = exportCsv.buildSpecCsvText(
		createCsvDeps([{ ...FULL_PRODUCT, efficacy: '提亮,紧致' }]),
	);
	const lines = text.split('\n');
	assert.equal(lines.length, 2);
	assert.ok(lines[1].includes('"提亮,紧致"'), lines[1]);
	assert.equal(lines[0], '商品ID,商品昵称,品牌,功效,赠品,零售价,活动时间');
}

// buildSpecCsvText：全空表只剩表头
{
	assert.equal(
		exportCsv.buildSpecCsvText(createCsvDeps([{}, {}])),
		'商品ID,商品昵称,品牌,功效,赠品,零售价,活动时间',
	);
}

console.log('product-spec submission validation & csv export passed');
