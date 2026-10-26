import { getProductCoords } from './utils';
import { styleToUniverStyleName } from './schema';
import type { FieldDef, FieldKind, FieldStyle } from './schema';

/** 产品身份与自动脚注字段不参与批量应用，避免破坏产品归属和系统生成的备注内容。 */
export const BATCH_EXCLUDED_FIELD_KEYS: ReadonlySet<string> = new Set([
	'nickname',
	'fullName',
	'remarks',
	// icon 是结构化选择（iconRefsByCard），各商品候选集不同，不参与批量应用。
	'icon',
]);

/**
 * 仅标量字段可批量填写。gifts / tier 是结构化数据（giftStrategiesByCard、
 * tierStrategiesByCard），批量写入必须同时重建编号注册表，交由后续迭代处理。
 */
export const BATCH_SUPPORTED_KINDS: ReadonlySet<FieldKind> = new Set([
	'text',
	'longtext',
	'price',
	'dateRange',
]);

export type BatchApplyScope = 'all' | 'partial';

export const resolveBatchTargetIndexes = (
	allTargetIndexes: readonly number[],
	selectedTargetIndexes: readonly number[],
	scope: BatchApplyScope,
): number[] => {
	if (scope === 'all') return [...allTargetIndexes];
	const selected = new Set(selectedTargetIndexes);
	return allTargetIndexes.filter((index) => selected.has(index));
};

export interface BatchApplyField {
	key: string;
	label: string;
	kind: FieldKind;
	row: number;
	style: FieldStyle;
	required: boolean;
}

export interface BatchApplyDeps {
	fields: () => FieldDef[];
	rowsPerBlock: () => number;
	colsPerBlock: () => number;
	theme: () => string;
	canEditField: (field: FieldDef) => boolean;
	readCellData: (row: number, col: number) => any;
	restoreCellData: (row: number, col: number, data: any) => void;
	writeText: (row: number, col: number, text: string, styleName: string) => void;
	writeNumeric: (row: number, col: number, value: string, styleName: string) => void;
}

export interface BatchApplyRequest {
	fieldKeys: readonly string[];
	values: Readonly<Record<string, string>>;
	targetIndexes: readonly number[];
}

export interface BatchApplyUndoEntry {
	row: number;
	col: number;
	data: any;
}

export interface BatchApplyResult {
	targetCount: number;
	fieldCount: number;
	cellCount: number;
	undoEntries: BatchApplyUndoEntry[];
}
export interface BatchApplyTransactionDeps {
	apply: () => BatchApplyResult;
	postProcess: () => void;
	rollback: (entries: readonly BatchApplyUndoEntry[]) => void;
}

export const listBatchApplyFields = (deps: BatchApplyDeps): BatchApplyField[] =>
	deps
		.fields()
		.filter(
			(field) =>
				!BATCH_EXCLUDED_FIELD_KEYS.has(field.key) &&
				BATCH_SUPPORTED_KINDS.has(field.kind) &&
				deps.canEditField(field),
		)
		.sort((left, right) => left.row - right.row)
		.map((field) => ({
			key: field.key,
			label: field.label,
			kind: field.kind,
			row: field.row,
			style: field.style,
			required: Boolean(field.required),
		}));

const resolveField = (deps: BatchApplyDeps, key: string): FieldDef | undefined =>
	deps.fields().find((field) => field.key === key);

/** 日期区间在单元格里以 `开始 ~ 结束` 存储，空区间写入空串以便清空。 */
export const formatDateRangeCellText = (range: readonly string[] | null | undefined): string => {
	if (!Array.isArray(range) || range.length !== 2) return '';
	const [start, end] = range;
	if (!start || !end) return '';
	return `${start} ~ ${end}`;
};

export const parseDateRangeCellText = (text: string): string[] => {
	const parts = String(text || '').split('~');
	if (parts.length !== 2) return [];
	const start = parts[0].trim();
	const end = parts[1].trim();
	return start && end ? [start, end] : [];
};

export const revertBatchApply = (
	deps: BatchApplyDeps,
	entries: readonly BatchApplyUndoEntry[],
): number => {
	// 倒序还原，保证同一单元格被多次写入时回到最早的状态。
	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index];
		deps.restoreCellData(entry.row, entry.col, entry.data);
	}
	return entries.length;
};

const rollbackFailedBatch = (
	deps: BatchApplyDeps,
	entries: readonly BatchApplyUndoEntry[],
	writeError: unknown,
): never => {
	try {
		revertBatchApply(deps, entries);
	} catch (rollbackError) {
		throw new AggregateError(
			[writeError, rollbackError],
			'批量应用失败，且已写入单元格回滚失败',
		);
	}
	throw writeError;
};

export const runBatchApplyTransaction = (
	deps: BatchApplyTransactionDeps,
): BatchApplyResult => {
	let result: BatchApplyResult | undefined;
	try {
		result = deps.apply();
		deps.postProcess();
		return result;
	} catch (applyError) {
		if (!result) throw applyError;
		try {
			deps.rollback(result.undoEntries);
		} catch (rollbackError) {
			throw new AggregateError(
				[applyError, rollbackError],
				'批量应用后处理失败，且已写入单元格回滚失败',
			);
		}
		throw applyError;
	}
};
/**
 * 把选中字段的统一值写入选中的商品列，并返回可原样还原的旧单元格数据。
 * 任一写入失败时立即倒序回滚，避免留下无法撤销的部分修改。
 */
export const applyBatchFields = (
	deps: BatchApplyDeps,
	request: BatchApplyRequest,
): BatchApplyResult => {
	const rowsPerBlock = deps.rowsPerBlock();
	const colsPerBlock = deps.colsPerBlock();
	const theme = deps.theme();
	const undoEntries: BatchApplyUndoEntry[] = [];
	const appliedFields = request.fieldKeys
		.map((key) => resolveField(deps, key))
		.filter((field): field is FieldDef => Boolean(field) && deps.canEditField(field!));

	try {
		for (const targetIndex of request.targetIndexes) {
			const coords = getProductCoords(targetIndex, rowsPerBlock, colsPerBlock);
			for (const field of appliedFields) {
				const row = coords.blockStartRow + field.row;
				const value = request.values[field.key] ?? '';
				const styleName = styleToUniverStyleName(field.style, theme);
				undoEntries.push({ row, col: coords.blockCol, data: deps.readCellData(row, coords.blockCol) });
				if (field.kind === 'price') deps.writeNumeric(row, coords.blockCol, value, styleName);
				else deps.writeText(row, coords.blockCol, value, styleName);
			}
		}
	} catch (writeError) {
		rollbackFailedBatch(deps, undoEntries, writeError);
	}

	return {
		targetCount: request.targetIndexes.length,
		fieldCount: appliedFields.length,
		cellCount: undoEntries.length,
		undoEntries,
	};
};
