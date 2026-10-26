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

const utils = transpile('../src/views/design_order/product_spec/utils.ts');
const schema = transpile('../src/views/design_order/product_spec/schema/index.ts', (specifier) => {
	if (specifier === './types') return {};
	throw new Error(`Unexpected module: ${specifier}`);
});

const batchApply = transpile('../src/views/design_order/product_spec/batchApply.ts', (specifier) => {
	if (specifier === './utils') return utils;
	if (specifier === './schema') return schema;
	throw new Error(`Unexpected module: ${specifier}`);
});

/** 与 main_image 模板一致的字段集合，覆盖全部 kind 分支。 */
const ALL_FIELDS = [
	{ key: 'brand', label: '品牌', kind: 'text', row: 1, style: 'contentCenter' },
	{ key: 'nickname', label: '产品昵称', kind: 'mention', row: 2, style: 'contentLeft' },
	{ key: 'fullName', label: '官方全称', kind: 'text', row: 3, style: 'contentLeft' },
	{ key: 'efficacy', label: '功效', kind: 'longtext', row: 4, style: 'contentLeft' },
	{ key: 'gifts', label: '赠品', kind: 'gifts', row: 5, style: 'contentLeft' },
	{ key: 'thresholdA', label: '阶梯', kind: 'tier', row: 6, style: 'contentLeft' },
	{ key: 'price', label: '价格', kind: 'price', row: 8, style: 'editableCenter' },
	{ key: 'dateRange', label: '活动时间', kind: 'dateRange', row: 9, style: 'editableDate' },
	{ key: 'remarks', label: '运营备注说明', kind: 'longtext', row: 12, style: 'editableCenter' },
];

const createDeps = (overrides = {}) => {
	const writes = [];
	const restores = [];
	const cells = new Map();
	const cellKey = (row, col) => `${row}:${col}`;
	return {
		writes,
		restores,
		cells,
		deps: {
			fields: () => ALL_FIELDS,
			rowsPerBlock: () => 15,
			colsPerBlock: () => 6,
			theme: () => 'proya',
			canEditField: () => true,
			readCellData: (row, col) => cells.get(cellKey(row, col)) ?? null,
			restoreCellData: (row, col, data) => {
				restores.push({ row, col, data });
				cells.set(cellKey(row, col), data);
			},
			writeText: (row, col, text, styleName) => {
				writes.push({ type: 'text', row, col, text, styleName });
				cells.set(cellKey(row, col), { v: text });
			},
			writeNumeric: (row, col, value, styleName) => {
				writes.push({ type: 'numeric', row, col, value, styleName });
				cells.set(cellKey(row, col), { v: value });
			},
			...overrides,
		},
	};
};

// listBatchApplyFields：排除产品身份字段与结构化 kind，并按行号排序
{
	const { deps } = createDeps();
	const fields = batchApply.listBatchApplyFields(deps);
	assert.deepEqual(
		fields.map((field) => field.key),
		['brand', 'efficacy', 'price', 'dateRange'],
	);
	assert.deepEqual(
		fields.map((field) => field.row),
		[1, 4, 8, 9],
	);
}

// listBatchApplyFields：无编辑权限的字段被过滤掉
{
	const { deps } = createDeps({ canEditField: (field) => field.key !== 'price' });
	const keys = batchApply.listBatchApplyFields(deps).map((field) => field.key);
	assert.deepEqual(keys, ['brand', 'efficacy', 'dateRange']);
}

// 日期区间文本格式化与解析可往返，空区间落成空串
{
	const range = ['2026-08-04 20:00', '2026-08-08 00:00'];
	const text = batchApply.formatDateRangeCellText(range);
	assert.equal(text, '2026-08-04 20:00 ~ 2026-08-08 00:00');
	assert.deepEqual(batchApply.parseDateRangeCellText(text), range);

	assert.equal(batchApply.formatDateRangeCellText([]), '');
	assert.equal(batchApply.formatDateRangeCellText(['2026-08-04 20:00', '']), '');
	assert.equal(batchApply.formatDateRangeCellText(null), '');
	assert.deepEqual(batchApply.parseDateRangeCellText(''), []);
	assert.deepEqual(batchApply.parseDateRangeCellText('2026-08-04 20:00'), []);
}

// resolveBatchTargetIndexes：默认返回全部商品，部分模式过滤无效项并保持商品顺序。
{
	const allTargets = [0, 1, 2, 3];
	assert.deepEqual(
		batchApply.resolveBatchTargetIndexes(allTargets, [3, 1, 99], 'all'),
		allTargets,
	);
	assert.deepEqual(
		batchApply.resolveBatchTargetIndexes(allTargets, [3, 1, 99], 'partial'),
		[1, 3],
	);
	assert.deepEqual(batchApply.resolveBatchTargetIndexes(allTargets, [], 'partial'), []);
}

// applyBatchFields：支持把字段写入任意部分商品，并返回正确的单元格计数
{
	const { deps, writes } = createDeps();
	const result = batchApply.applyBatchFields(deps, {
		fieldKeys: ['price', 'dateRange'],
		values: { price: '199', dateRange: '2026-08-04 20:00 ~ 2026-08-08 00:00' },
		targetIndexes: [0, 1, 6],
	});

	assert.equal(result.targetCount, 3);
	assert.equal(result.fieldCount, 2);
	assert.equal(result.cellCount, 6);
	assert.equal(result.undoEntries.length, 6);
	assert.equal(writes.length, 6);

	assert.deepEqual(
		writes.map((write) => write.type),
		['numeric', 'text', 'numeric', 'text', 'numeric', 'text'],
	);
	// 索引 0/1 在第一块，索引 6 换行到第二块起始行 15。
	assert.deepEqual(
		writes.map((write) => `${write.row}:${write.col}`),
		['8:1', '9:1', '8:2', '9:2', '23:1', '24:1'],
	);
	assert.equal(writes[0].styleName, 'editableCenterStyle_proya');
	assert.equal(writes[1].styleName, 'editableDateStyle_proya');
}

// applyBatchFields：缺值字段写入空串以清空目标；不可编辑字段被跳过
{
	const { deps, writes } = createDeps({ canEditField: (field) => field.key !== 'brand' });
	const result = batchApply.applyBatchFields(deps, {
		fieldKeys: ['brand', 'efficacy'],
		values: {},
		targetIndexes: [0],
	});
	assert.equal(result.fieldCount, 1);
	assert.equal(writes.length, 1);
	assert.equal(writes[0].text, '');
}

// revertBatchApply：倒序还原，重复写入的单元格回到最早快照
{
	const { deps, cells, restores } = createDeps();
	cells.set('8:1', { v: 99 });

	const first = batchApply.applyBatchFields(deps, {
		fieldKeys: ['price'],
		values: { price: '150' },
		targetIndexes: [0],
	});
	const second = batchApply.applyBatchFields(deps, {
		fieldKeys: ['price'],
		values: { price: '199' },
		targetIndexes: [0],
	});

	const entries = [...first.undoEntries, ...second.undoEntries];
	assert.equal(batchApply.revertBatchApply(deps, entries), 2);
	assert.deepEqual(
		restores.map((restore) => restore.data),
		[{ v: '150' }, { v: 99 }],
	);
	assert.deepEqual(cells.get('8:1'), { v: 99 });
}

// revertBatchApply：原本为空的单元格还原为 null，交由调用方清空
{
	const { deps, cells } = createDeps();
	const result = batchApply.applyBatchFields(deps, {
		fieldKeys: ['efficacy'],
		values: { efficacy: '保湿' },
		targetIndexes: [2],
	});
	assert.equal(result.undoEntries[0].data, null);
	batchApply.revertBatchApply(deps, result.undoEntries);
	assert.equal(cells.get('4:3'), null);
}


// A write failure rolls every captured cell back to its original value.
{
	const context = createDeps();
	context.cells.set('4:1', { v: 'old-1' });
	context.cells.set('4:2', { v: 'old-2' });
	const originalWriteText = context.deps.writeText;
	let writeCount = 0;
	context.deps.writeText = (...args) => {
		writeCount += 1;
		if (writeCount === 2) throw new Error('write failed');
		originalWriteText(...args);
	};

	assert.throws(
		() => batchApply.applyBatchFields(context.deps, {
			fieldKeys: ['efficacy'],
			values: { efficacy: 'new-value' },
			targetIndexes: [0, 1],
		}),
		/write failed/,
	);
	assert.deepEqual(context.cells.get('4:1'), { v: 'old-1' });
	assert.deepEqual(context.cells.get('4:2'), { v: 'old-2' });
	assert.deepEqual(
		context.restores.map(({ row, col }) => `${row}:${col}`),
		['4:2', '4:1'],
	);
}

// runBatchApplyTransaction：后处理失败时回滚已完成的批量写入。
{
	const undoEntries = [{ row: 4, col: 1, data: { v: 'old' } }];
	let rolledBackEntries = null;
	assert.throws(
		() => batchApply.runBatchApplyTransaction({
			apply: () => ({ targetCount: 1, fieldCount: 1, cellCount: 1, undoEntries }),
			postProcess: () => { throw new Error('post process failed'); },
			rollback: (entries) => { rolledBackEntries = entries; },
		}),
		/post process failed/,
	);
	assert.equal(rolledBackEntries, undoEntries);
}

// runBatchApplyTransaction：回滚也失败时同时暴露两个错误。
{
	assert.throws(
		() => batchApply.runBatchApplyTransaction({
			apply: () => ({
				targetCount: 1,
				fieldCount: 1,
				cellCount: 1,
				undoEntries: [{ row: 4, col: 1, data: null }],
			}),
			postProcess: () => { throw new Error('post process failed'); },
			rollback: () => { throw new Error('rollback failed'); },
		}),
		(error) => error instanceof AggregateError
			&& error.errors.some((item) => item.message === 'post process failed')
			&& error.errors.some((item) => item.message === 'rollback failed'),
	);
}
console.log('product-spec batch apply passed');
