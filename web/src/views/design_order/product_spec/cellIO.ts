import { CellValueType } from '@univerjs/presets';
import { normalizeNumericCellValue } from './snapshot';
import { remapRichTextRuns } from './richTextFormatting';

/** Univer 富文本文档：换行在 dataStream 中以 \r 表示，段落记录每个 \r 的下标。 */
export const createRichTextDocument = (text: string) => {
	const normalizedText = text.replace(/\r\n?/g, '\n');
	const dataStream = `${normalizedText.replace(/\n/g, '\r')}\r\n`;
	const paragraphs: Array<{ startIndex: number }> = [];

	for (let index = 0; index < dataStream.length; index++) {
		if (dataStream[index] === '\r') {
			paragraphs.push({ startIndex: index });
		}
	}

	return {
		id: 'd',
		documentStyle: {},
		body: {
			dataStream,
			paragraphs,
			textRuns: [],
		},
	};
};

export const readSheetCellValue = (activeSheet: any, row: number, column: number) => {
	const cell = activeSheet.getRange(row, column, 1, 1).getValue() as any;
	return cell && typeof cell === 'object' ? cell.v : cell ?? '';
};

/** 写入文本，并把原有的富文本着色区间按字符差异重映射到新文本上。 */
export const setCellTextPreservingRichText = (
	activeSheet: any,
	row: number,
	col: number,
	text: string,
	styleName: string,
) => {
	const range = activeSheet.getRange(row, col, 1, 1);
	const currentCell = range.getCellData() || {};
	const currentText = String(currentCell.v || '');
	const currentRuns = currentCell.p?.body?.textRuns;
	const textRuns = Array.isArray(currentRuns)
		? remapRichTextRuns(currentText, text, currentRuns)
		: [];
	const nextCell = { ...currentCell, v: text, t: CellValueType.STRING, s: styleName };
	if (currentCell.p?.body) {
		const nextDocument = createRichTextDocument(text);
		nextCell.p = {
			...currentCell.p,
			body: {
				...currentCell.p.body,
				dataStream: nextDocument.body.dataStream,
				paragraphs: nextDocument.body.paragraphs,
				textRuns,
			},
		};
	}
	range.setValueForCell(nextCell);
};

/** 数字字段必须落成 NUMBER 类型，否则导出与提交校验会把它当文本处理。 */
export const setNumericCellValue = (
	activeSheet: any,
	row: number,
	col: number,
	value: unknown,
	styleName: string,
) => {
	const range = activeSheet.getRange(row, col, 1, 1);
	const currentCell = range.getCellData() || {};
	const normalizedValue = normalizeNumericCellValue(value);
	const isNumeric = typeof normalizedValue === 'number';
	const nextCell = {
		...currentCell,
		v: isNumeric ? normalizedValue : String(normalizedValue || ''),
		t: isNumeric ? CellValueType.NUMBER : CellValueType.STRING,
		s: styleName,
		f: null,
	};
	delete nextCell.p;
	range.setValueForCell(nextCell);
};
