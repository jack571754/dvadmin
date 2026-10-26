import type { Ref } from 'vue';
import {
	getColumnsPerBlock,
	getFieldByRow,
	getFields,
	getRowsPerBlock,
	styleToUniverStyleName,
} from './schema';
import type { FieldDef } from './schema';

export interface FieldPermission {
	is_query: boolean;
	is_create: boolean;
	is_update: boolean;
}

export interface FieldAccessDeps {
	templateType: Ref<string>;
	theme: Ref<string>;
	permissions: Ref<Record<string, FieldPermission>>;
}

export type CellCoordinates = Readonly<{ blockStartRow: number; blockCol: number }>;
export type CellReader = (row: number, col: number) => any;
export type CellWriter = (row: number, col: number, value: any, styleName: string) => void;

/**
 * 行偏移只能通过 Schema 查询，禁止在调用方再写 blockStartRow + N 字面量。
 */
export const createFieldAccess = (deps: FieldAccessDeps) => {
	const fieldByKey = (key: string): FieldDef | undefined =>
		getFields(deps.templateType.value).find((f) => f.key === key);

	const requireField = (key: string): FieldDef => {
		const field = fieldByKey(key);
		if (!field) throw new Error(`模板“${deps.templateType.value}”缺少字段：${key}`);
		return field;
	};

	const optionalRowOf = (key: string): number | undefined => fieldByKey(key)?.row;

	// 块内行偏移 -> 该行的遮罩键
	const maskKeyByRow = (rowInBlock: number): string | undefined =>
		getFieldByRow(deps.templateType.value, rowInBlock)?.maskKey;

	const permissionOfField = (field: FieldDef): FieldPermission | undefined =>
		field.maskKey ? deps.permissions.value[field.maskKey] : undefined;

	return {
		fieldByKey,
		requireField,
		optionalRowOf,
		maskKeyByRow,
		permissionOfField,

		hasField: (key: string): boolean => Boolean(fieldByKey(key)),
		rowOf: (key: string): number => requireField(key).row,
		labelOf: (key: string): string => requireField(key).label,
		rowsPerBlock: () => getRowsPerBlock(deps.templateType.value),
		colsPerBlock: () => getColumnsPerBlock(deps.templateType.value),

		readOptionalFieldValue: (
			readCell: CellReader,
			coordinates: CellCoordinates,
			key: string,
		) => {
			const row = optionalRowOf(key);
			if (row === undefined) return '';
			return readCell(coordinates.blockStartRow + row, coordinates.blockCol);
		},

		writeOptionalFieldValue: (
			writeCell: CellWriter,
			coordinates: CellCoordinates,
			field: Readonly<{ key: string; value: any; styleName: string }>,
		) => {
			const row = optionalRowOf(field.key);
			if (row === undefined) return;
			writeCell(
				coordinates.blockStartRow + row,
				coordinates.blockCol,
				field.value,
				field.styleName,
			);
		},

		/** 无查看权限的字段在表格里一律显示为 ***，不泄露原值。 */
		getPermittedVal: (rowNum: number, defaultVal: string) => {
			const fieldName = maskKeyByRow(rowNum);
			if (fieldName) {
				const perm = deps.permissions.value[fieldName];
				if (perm && !perm.is_query) return '***';
			}
			return defaultVal;
		},

		getProductCellStyleName: (relativeRow: number): string | null => {
			const theme = deps.theme.value;
			if (relativeRow === 0) return `productHeaderStyle_${theme}`;
			const field = getFieldByRow(deps.templateType.value, relativeRow);
			return field ? styleToUniverStyleName(field.style, theme) : null;
		},
	};
};

export type FieldAccess = ReturnType<typeof createFieldAccess>;
