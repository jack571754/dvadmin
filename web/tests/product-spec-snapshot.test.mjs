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

const base = '../src/views/design_order/product_spec/';
const { completeSnapshotProductCells, normalizeSnapshotNumericCells } = transpile(
	`${base}snapshot.ts`,
);
const { remapRichTextRuns } = transpile(`${base}richTextFormatting.ts`);

const snapshot = {
	styles: {},
	sheets: {
		sheet1: {
			cellData: {
				'0': {
					'1': { v: '商品提报 1', s: 'oldHeader' },
					'2': { v: '商品提报 2', s: 'oldHeader' },
				},
				'10': {
					'0': { v: 'icon', s: 'labelStyle_proya' },
					'2': { v: '已有 icon', s: 'oldStyle' },
				},
				'11': {
					'0': { v: '标注', s: 'labelStyle_proya' },
					'2': { v: '', s: 'oldStyle' },
				},
			},
		},
	},
};

const completed = completeSnapshotProductCells(snapshot, {
	productCount: 2,
	rowsPerBlock: 14,
	columnsPerBlock: 6,
	styleByRelativeRow: (row) => {
		if (row === 0) return 'headerStyle_proya';
		if (row === 10 || row === 11) return 'editableCenterStyle_proya';
		return null;
	},
});

const cells = completed.sheets.sheet1.cellData;
assert.deepEqual(cells['10']['1'], { v: '', s: 'editableCenterStyle_proya' });
assert.deepEqual(cells['11']['1'], { v: '', s: 'editableCenterStyle_proya' });
assert.deepEqual(cells['10']['2'], { v: '已有 icon', s: 'editableCenterStyle_proya' });
assert.equal(cells['10']['3'], undefined);
assert.equal(snapshot.sheets.sheet1.cellData['10']['1'], undefined);

console.log('product-spec snapshot cell completion passed');

const NUMBER_CELL_TYPE = 2;
const historicalSnapshot = {
	sheets: {
		sheet1: {
			cellData: {
				'8': {
					'1': { v: '196', t: 1, s: 'editableCenterStyle_proya' },
					'2': { v: '1,234.50', t: 4, p: { body: {} } },
					'3': { v: '1,2,3', t: 1 },
				},
			},
		},
	},
};
const normalized = normalizeSnapshotNumericCells(historicalSnapshot, {
	productCount: 3,
	rowsPerBlock: 14,
	columnsPerBlock: 6,
	numericRelativeRows: [8],
	numberCellType: NUMBER_CELL_TYPE,
});
assert.deepEqual(normalized.sheets.sheet1.cellData['8']['1'], {
	v: 196,
	t: NUMBER_CELL_TYPE,
	s: 'editableCenterStyle_proya',
});
assert.deepEqual(normalized.sheets.sheet1.cellData['8']['2'], {
	v: 1234.5,
	t: NUMBER_CELL_TYPE,
});
assert.deepEqual(normalized.sheets.sheet1.cellData['8']['3'], {
	v: '1,2,3',
	t: 1,
});
assert.equal(historicalSnapshot.sheets.sheet1.cellData['8']['1'].v, '196');

console.log('product-spec numeric snapshot normalization passed');

const remapped = remapRichTextRuns(
	'胶原蛋白说明',
	'胶原蛋白说明[1]',
	[{ st: 0, ed: 4, ts: { cl: { rgb: '#D03050' }, bg: { rgb: '#FFF3A3' } } }],
);
assert.deepEqual(remapped, [{
	st: 0,
	ed: 4,
	ts: { cl: { rgb: '#D03050' }, bg: { rgb: '#FFF3A3' } },
}]);

console.log('product-spec rich text remapping passed');
