import { getProductCoords } from './utils';
import type { FieldDef } from './schema';

/** 赠品单元格带图标前缀，导出时去掉首个前缀，保持与页面显示一致。 */
const GIFT_ICON_PREFIX = '🎁 ';
const CSV_BOM = '﻿';
const ID_COLUMN_HEADER = '商品ID';

export interface SpecCsvExportDeps {
	formCount: () => number;
	fields: () => FieldDef[];
	rowsPerBlock: () => number;
	colsPerBlock: () => number;
	nicknameRow: () => number;
	readCellValue: (row: number, col: number) => any;
	productLabel: (index: number) => string;
}

/** RFC 4180：含分隔符、引号或换行的字段需要整体加引号，内部引号翻倍。 */
export const escapeCsvValue = (value: unknown): string => {
	const text = String(value ?? '').replace(/"/g, '""');
	return /[,\n"]/.test(text) ? `"${text}"` : text;
};

export const formatCsvContent = (rows: readonly (readonly unknown[])[]): string =>
	rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');

/** 一维表：每行一个商品，每列一个字段；未填写昵称的列视为空位，不导出。 */
export const buildSpecCsvRows = (deps: SpecCsvExportDeps): string[][] => {
	const fields = deps.fields();
	const rowsPerBlock = deps.rowsPerBlock();
	const colsPerBlock = deps.colsPerBlock();
	const nicknameRow = deps.nicknameRow();
	const rows: string[][] = [[ID_COLUMN_HEADER, ...fields.map((field) => field.label)]];

	for (let index = 0; index < deps.formCount(); index++) {
		const { blockCol, blockStartRow } = getProductCoords(index, rowsPerBlock, colsPerBlock);
		const readField = (row: number) => deps.readCellValue(blockStartRow + row, blockCol);
		if (!readField(nicknameRow)) continue;
		rows.push([
			deps.productLabel(index),
			...fields.map((field) => {
				const value = String(readField(field.row) ?? '');
				return field.kind === 'gifts' ? value.replace(GIFT_ICON_PREFIX, '') : value;
			}),
		]);
	}
	return rows;
};

export const buildSpecCsvText = (deps: SpecCsvExportDeps): string =>
	formatCsvContent(buildSpecCsvRows(deps));

/** 带 BOM 落盘，避免 Excel 用 GBK 解码导致中文乱码。 */
export const downloadCsvFile = (fileName: string, csvContent: string): void => {
	const blob = new Blob([CSV_BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('download', fileName);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
