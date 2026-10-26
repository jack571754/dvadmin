export interface SnapshotCellCompletionOptions {
	productCount: number;
	rowsPerBlock: number;
	columnsPerBlock: number;
	styleByRelativeRow: (row: number) => string | null;
}

export interface SnapshotNumericCellOptions {
	productCount: number;
	rowsPerBlock: number;
	columnsPerBlock: number;
	numericRelativeRows: readonly number[];
	numberCellType: number;
}

export interface SnapshotProductStyleOptions
	extends SnapshotCellCompletionOptions,
		SnapshotNumericCellOptions {
	/** 主题样式字典，覆盖快照里过期的样式定义。 */
	styles: Record<string, any>;
}

export interface SnapshotMaskOptions {
	rowsPerBlock: number;
	/** 相对行 → 权限字段名；返回空表示该行不受字段权限约束。 */
	maskKeyByRow: (relativeRow: number) => string | null | undefined;
	isQueryable: (maskKey: string) => boolean;
	stringCellType: number;
}

export interface SnapshotProductColumnRemapOptions {
	productCount: number;
	rowsPerBlock: number;
	fromColumns: number;
	toColumns: number;
	physicalProductColumns: number;
	productColumnWidth: number;
}

type CellData = Record<string, Record<string, any>>;
const NUMERIC_TEXT_PATTERN =
	/^[+-]?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)$/;

const cloneCellData = (cellData: CellData = {}): CellData =>
	Object.fromEntries(
		Object.entries(cellData).map(([row, cells]) => [
			row,
			Object.fromEntries(
				Object.entries(cells || {}).map(([column, cell]) => [
					column,
					cell && typeof cell === 'object' ? { ...cell } : cell,
				])
			),
		])
	);

export const normalizeNumericCellValue = (value: unknown): unknown => {
	if (typeof value === 'number') return value;
	if (typeof value !== 'string') return value;
	const trimmedValue = value.trim();
	if (!NUMERIC_TEXT_PATTERN.test(trimmedValue)) return value;
	const normalizedText = trimmedValue.replace(/,/g, '');
	const numericValue = Number(normalizedText);
	return Number.isFinite(numericValue) ? numericValue : value;
};

const normalizeNumericCell = (cell: any, numberCellType: number) => {
	if (!cell || typeof cell !== 'object') return cell;
	const numericValue = normalizeNumericCellValue(cell.v);
	if (typeof numericValue !== 'number') return cell;
	const nextCell = { ...cell, v: numericValue, t: numberCellType };
	delete nextCell.p;
	return nextCell;
};

const normalizeSheetNumericCells = (
	sheet: any,
	options: SnapshotNumericCellOptions
) => {
	const cellData = cloneCellData(sheet?.cellData);
	for (let index = 0; index < options.productCount; index++) {
		const blockStartRow =
			Math.floor(index / options.columnsPerBlock) * options.rowsPerBlock;
		const column = String((index % options.columnsPerBlock) + 1);
		for (const relativeRow of options.numericRelativeRows) {
			const row = String(blockStartRow + relativeRow);
			const rowCells = cellData[row];
			if (!rowCells?.[column]) continue;
			rowCells[column] = normalizeNumericCell(
				rowCells[column],
				options.numberCellType
			);
		}
	}
	return { ...sheet, cellData };
};

const completeSheetCells = (
	sheet: any,
	options: SnapshotCellCompletionOptions
) => {
	const cellData = cloneCellData(sheet?.cellData);
	for (let index = 0; index < options.productCount; index++) {
		const blockStartRow =
			Math.floor(index / options.columnsPerBlock) * options.rowsPerBlock;
		const column = String((index % options.columnsPerBlock) + 1);
		for (let relativeRow = 0; relativeRow < options.rowsPerBlock; relativeRow++) {
			const style = options.styleByRelativeRow(relativeRow);
			if (!style) continue;
			const row = String(blockStartRow + relativeRow);
			const rowCells = { ...(cellData[row] || {}) };
			const existingCell = rowCells[column];
			rowCells[column] =
				existingCell && typeof existingCell === 'object'
					? { ...existingCell, s: style }
					: { v: existingCell ?? '', s: style };
			cellData[row] = rowCells;
		}
	}
	return { ...sheet, cellData };
};

export const completeSnapshotProductCells = (
	snapshot: any,
	options: SnapshotCellCompletionOptions
) => {
	if (!snapshot?.sheets || options.productCount <= 0) return snapshot;
	return {
		...snapshot,
		sheets: Object.fromEntries(
			Object.entries(snapshot.sheets).map(([id, sheet]) => [
				id,
				completeSheetCells(sheet, options),
			])
		),
	};
};

export const normalizeSnapshotNumericCells = (
	snapshot: any,
	options: SnapshotNumericCellOptions
) => {
	if (!snapshot?.sheets || options.productCount <= 0) return snapshot;
	return {
		...snapshot,
		sheets: Object.fromEntries(
			Object.entries(snapshot.sheets).map(([id, sheet]) => [
				id,
				normalizeSheetNumericCells(sheet, options),
			])
		),
	};
};

/** 补齐产品单元格样式 + 归一化数字单元格 + 覆盖样式字典，落库与初始化共用同一条链路。 */
export const syncSnapshotProductStyles = (
	snapshot: any,
	options: SnapshotProductStyleOptions
) => {
	if (!snapshot?.sheets) return snapshot;
	const completedSnapshot = completeSnapshotProductCells(snapshot, options);
	const normalizedSnapshot = normalizeSnapshotNumericCells(completedSnapshot, options);
	return {
		...normalizedSnapshot,
		styles: { ...(normalizedSnapshot.styles || {}), ...options.styles },
	};
};

/** 无查看权限的字段整行写成 ***，标签列（第 0 列）保持原样。 */
const maskSheetCells = (sheet: any, options: SnapshotMaskOptions) => {
	const cellData = sheet?.cellData;
	if (!cellData) return;
	for (const rowKey of Object.keys(cellData)) {
		const maskKey = options.maskKeyByRow(Number(rowKey) % options.rowsPerBlock);
		if (!maskKey || options.isQueryable(maskKey)) continue;
		const rowCells = cellData[rowKey];
		for (const columnKey of Object.keys(rowCells)) {
			if (Number(columnKey) <= 0 || !rowCells[columnKey]) continue;
			rowCells[columnKey].v = '***';
			rowCells[columnKey].t = options.stringCellType;
		}
	}
};

/**
 * 就地脱敏：调用方传入的快照必须已由 syncSnapshotProductStyles 克隆过，
 * 否则会直接改写 Univer 持有的原始 cellData。
 */
export const maskSnapshotUnqueryableCells = (snapshot: any, options: SnapshotMaskOptions) => {
	if (!snapshot?.sheets) return snapshot;
	for (const sheetId of Object.keys(snapshot.sheets)) {
		maskSheetCells(snapshot.sheets[sheetId], options);
	}
	return snapshot;
};

const cloneSnapshotValue = <T>(value: T): T => {
	if (value === undefined || value === null || typeof value !== 'object') return value;
	return JSON.parse(JSON.stringify(value));
};

const mergeRowData = (rows: any[]) => {
	const candidates = rows.filter((row) => row && typeof row === 'object');
	if (!candidates.length) return undefined;
	const merged = cloneSnapshotValue(candidates[0]);
	for (const key of ['h', 'ah'] as const) {
		const values = candidates
			.map((row) => Number(row[key]))
			.filter((value) => Number.isFinite(value));
		if (values.length) merged[key] = Math.max(...values);
	}
	if (candidates.some((row) => row.ia === 1)) merged.ia = 1;
	if (candidates.every((row) => row.hd === 1)) merged.hd = 1;
	else delete merged.hd;
	return merged;
};

/** Convert responsive runtime blocks back to the template's stable storage layout. */
export const remapSnapshotProductColumns = (
	snapshot: any,
	options: SnapshotProductColumnRemapOptions,
) => {
	if (!snapshot?.sheets || options.productCount <= 0) return snapshot;
	const fromColumns = Math.max(1, options.fromColumns);
	const toColumns = Math.max(1, options.toColumns);
	const rowsPerBlock = Math.max(1, options.rowsPerBlock);
	const physicalProductColumns = Math.max(
		options.physicalProductColumns,
		fromColumns,
		toColumns,
	);
	const sourceBlockCount = Math.ceil(options.productCount / fromColumns);
	const targetBlockCount = Math.ceil(options.productCount / toColumns);
	const layoutRowLimit = Math.max(sourceBlockCount, targetBlockCount) * rowsPerBlock;

	return {
		...snapshot,
		sheets: Object.fromEntries(
			Object.entries(snapshot.sheets).map(([sheetId, rawSheet]) => {
				const sourceSheet = rawSheet as any;
				const sourceCellData = sourceSheet.cellData || {};
				const cellData: Record<string, Record<string, any>> = {};
				const writeCell = (row: number, column: number, value: any) => {
					if (value === undefined || value === null) return;
					const rowKey = String(row);
					cellData[rowKey] = cellData[rowKey] || {};
					cellData[rowKey][String(column)] = cloneSnapshotValue(value);
				};

				for (const [rowKey, rowCells] of Object.entries(sourceCellData)) {
					for (const [columnKey, value] of Object.entries((rowCells || {}) as Record<string, any>)) {
						const column = Number(columnKey);
						if (column >= 0 && column <= physicalProductColumns) continue;
						writeCell(Number(rowKey), column, value);
					}
				}

				for (let targetBlock = 0; targetBlock < targetBlockCount; targetBlock++) {
					for (let relativeRow = 0; relativeRow < rowsPerBlock; relativeRow++) {
						let labelCell;
						for (let sourceBlock = 0; sourceBlock < sourceBlockCount; sourceBlock++) {
							labelCell = sourceCellData[String(sourceBlock * rowsPerBlock + relativeRow)]?.['0'];
							if (labelCell !== undefined && labelCell !== null) break;
						}
						writeCell(targetBlock * rowsPerBlock + relativeRow, 0, labelCell);
					}
				}

				for (let productIndex = 0; productIndex < options.productCount; productIndex++) {
					const sourceBlockStart = Math.floor(productIndex / fromColumns) * rowsPerBlock;
					const sourceColumn = productIndex % fromColumns + 1;
					const targetBlockStart = Math.floor(productIndex / toColumns) * rowsPerBlock;
					const targetColumn = productIndex % toColumns + 1;
					for (let relativeRow = 0; relativeRow < rowsPerBlock; relativeRow++) {
						const cell = sourceCellData[String(sourceBlockStart + relativeRow)]?.[String(sourceColumn)];
						writeCell(targetBlockStart + relativeRow, targetColumn, cell);
					}
				}

				const sourceRowData = sourceSheet.rowData || {};
				const rowData: Record<string, any> = {};
				for (const [rowKey, value] of Object.entries(sourceRowData)) {
					if (Number(rowKey) >= layoutRowLimit) rowData[rowKey] = cloneSnapshotValue(value);
				}
				for (let targetBlock = 0; targetBlock < targetBlockCount; targetBlock++) {
					const startProduct = targetBlock * toColumns;
					const endProduct = Math.min(options.productCount, startProduct + toColumns);
					for (let relativeRow = 0; relativeRow < rowsPerBlock; relativeRow++) {
						const sourceRows = new Set<number>();
						for (let productIndex = startProduct; productIndex < endProduct; productIndex++) {
							sourceRows.add(Math.floor(productIndex / fromColumns) * rowsPerBlock + relativeRow);
						}
						const merged = mergeRowData(
							Array.from(sourceRows, (row) => sourceRowData[String(row)]),
						);
						if (merged) rowData[String(targetBlock * rowsPerBlock + relativeRow)] = merged;
					}
				}

				const columnData = Object.fromEntries(
					Object.entries(sourceSheet.columnData || {}).map(([column, value]) => [
						column,
						cloneSnapshotValue(value),
					]),
				);
				for (let column = 1; column <= physicalProductColumns; column++) {
					const normalized = columnData[String(column)] || {};
					normalized.w = options.productColumnWidth;
					delete normalized.hd;
					columnData[String(column)] = normalized;
				}

				return [sheetId, { ...sourceSheet, cellData, rowData, columnData }];
			}),
		),
	};
};

// 新格式：`[N]指<备案全称>`；旧格式：`[N]<昵称>为产品昵称，产品备案全称为<全称>`
// 两条都需要在重渲染前被清理掉，否则会与新追加的脚注叠加。
const NEW_FOOTNOTE_LINE_PATTERN = /^\[(?:\d+|undefined)\]指.+$/i;
const LEGACY_FOOTNOTE_LINE_PATTERN =
	/^\[(?:\d+|undefined)\]\s*.+?\s*为\s*产品昵称(?:\s*[，,]\s*产品备案全称为.*)?\s*$/i;
const FOOTNOTE_LINE_PATTERN = new RegExp(
	`${NEW_FOOTNOTE_LINE_PATTERN.source}|${LEGACY_FOOTNOTE_LINE_PATTERN.source}`,
	'i',
);
const DETAIL_HINT_LINE = '*具体说明见产品详情页';

/** 去掉自动生成的脚注与详情页提示，避免重算时把它们当成用户输入再次累积。 */
export const cleanFootnotesAndDetails = (text: string): string => {
	if (!text) return '';
	return text
		.split('\n')
		.filter((line) => {
			const trimmed = line.trim();
			return trimmed !== DETAIL_HINT_LINE && !FOOTNOTE_LINE_PATTERN.test(trimmed);
		})
		.join('\n')
		.trim();
};
