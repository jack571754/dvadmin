import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const transpile = (relativePath) => {
	const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
	const compiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;
	const moduleExports = {};
	new Function('exports', 'require', compiled)(moduleExports, () => ({}));
	return moduleExports;
};

const snapshot = transpile('../src/views/design_order/product_spec/snapshot.ts');

const NUMBER_CELL_TYPE = 2;
const STRING_CELL_TYPE = 1;

const buildSnapshot = () => ({
	styles: { staleStyle: { bl: 0 } },
	sheets: {
		sheet1: {
			cellData: {
				8: {
					0: { v: '价格', s: 'labelStyle_proya' },
					1: { v: '1,234.50', t: STRING_CELL_TYPE, p: { body: {} } },
				},
				9: {
					0: { v: '活动时间', s: 'labelStyle_proya' },
					1: { v: '2026-08-04 20:00 ~ 2026-08-08 00:00', t: STRING_CELL_TYPE },
				},
			},
		},
	},
});

const STYLE_OPTIONS = {
	productCount: 1,
	rowsPerBlock: 14,
	columnsPerBlock: 6,
	styleByRelativeRow: (row) => (row === 8 || row === 9 ? 'editableCenterStyle_proya' : null),
	numericRelativeRows: [8],
	numberCellType: NUMBER_CELL_TYPE,
	styles: { headerStyle_proya: { bl: 1 } },
};

// syncSnapshotProductStyles：补样式 + 归一化数字 + 合并样式字典，且不改动入参
{
	const original = buildSnapshot();
	const synced = snapshot.syncSnapshotProductStyles(original, STYLE_OPTIONS);

	assert.deepEqual(synced.sheets.sheet1.cellData['8']['1'], {
		v: 1234.5,
		t: NUMBER_CELL_TYPE,
		s: 'editableCenterStyle_proya',
	});
	// 非数字行保留原类型，只覆盖样式
	assert.equal(synced.sheets.sheet1.cellData['9']['1'].t, STRING_CELL_TYPE);
	assert.equal(synced.sheets.sheet1.cellData['9']['1'].s, 'editableCenterStyle_proya');
	// 样式字典合并而非替换
	assert.deepEqual(synced.styles, { staleStyle: { bl: 0 }, headerStyle_proya: { bl: 1 } });

	assert.equal(original.sheets.sheet1.cellData['8']['1'].v, '1,234.50');
	assert.equal(original.sheets.sheet1.cellData['8']['1'].s, undefined);
}

// syncSnapshotProductStyles：无 sheets 时原样返回
{
	assert.equal(snapshot.syncSnapshotProductStyles(null, STYLE_OPTIONS), null);
	assert.deepEqual(snapshot.syncSnapshotProductStyles({}, STYLE_OPTIONS), {});
}

const MASK_OPTIONS = {
	rowsPerBlock: 14,
	maskKeyByRow: (relativeRow) => (relativeRow === 8 ? 'price' : null),
	isQueryable: (maskKey) => maskKey !== 'price',
	stringCellType: STRING_CELL_TYPE,
};

// maskSnapshotUnqueryableCells：无查看权限的行写成 ***，标签列与其他行不动
{
	const synced = snapshot.syncSnapshotProductStyles(buildSnapshot(), STYLE_OPTIONS);
	const masked = snapshot.maskSnapshotUnqueryableCells(synced, MASK_OPTIONS);

	assert.equal(masked.sheets.sheet1.cellData['8']['1'].v, '***');
	assert.equal(masked.sheets.sheet1.cellData['8']['1'].t, STRING_CELL_TYPE);
	// 第 0 列是字段标签，必须保留
	assert.equal(masked.sheets.sheet1.cellData['8']['0'].v, '价格');
	// 有查看权限的行原样保留
	assert.equal(
		masked.sheets.sheet1.cellData['9']['1'].v,
		'2026-08-04 20:00 ~ 2026-08-08 00:00',
	);
}

// maskSnapshotUnqueryableCells：跨块的同一相对行同样被脱敏
{
	const multiBlock = {
		sheets: {
			sheet1: {
				cellData: {
					8: { 1: { v: '199' } },
					22: { 1: { v: '299' } },
					23: { 1: { v: '不脱敏' } },
				},
			},
		},
	};
	const masked = snapshot.maskSnapshotUnqueryableCells(multiBlock, MASK_OPTIONS);
	assert.equal(masked.sheets.sheet1.cellData['8']['1'].v, '***');
	assert.equal(masked.sheets.sheet1.cellData['22']['1'].v, '***');
	assert.equal(masked.sheets.sheet1.cellData['23']['1'].v, '不脱敏');
}

// maskSnapshotUnqueryableCells：全部可查看时不做任何改动
{
	const untouched = {
		sheets: { sheet1: { cellData: { 8: { 1: { v: '199' } } } } },
	};
	snapshot.maskSnapshotUnqueryableCells(untouched, { ...MASK_OPTIONS, isQueryable: () => true });
	assert.equal(untouched.sheets.sheet1.cellData['8']['1'].v, '199');
	assert.equal(snapshot.maskSnapshotUnqueryableCells(null, MASK_OPTIONS), null);
}

// cleanFootnotesAndDetails：剔除自动脚注与详情页提示，保留用户输入
{
	const text = [
		'用户备注第一行',
		'*具体说明见产品详情页',
		'[1]指弹润紧致面霜',
		'[undefined]指水乳精华',
		'[2]胶原水2.0为产品昵称，产品备案全称为可复美重组胶原蛋白肌御赋活智修精粹水',
		'用户备注第二行',
	].join('\n');
	assert.equal(snapshot.cleanFootnotesAndDetails(text), '用户备注第一行\n用户备注第二行');

	assert.equal(snapshot.cleanFootnotesAndDetails(''), '');
	assert.equal(snapshot.cleanFootnotesAndDetails('  普通备注  '), '普通备注');
	// 形似脚注但不是自动生成格式的行必须保留
	assert.equal(snapshot.cleanFootnotesAndDetails('[1]这是我自己写的编号'), '[1]这是我自己写的编号');
}

console.log('product-spec snapshot styles & masking passed');
