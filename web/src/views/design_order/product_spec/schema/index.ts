import { FieldDef, FieldStyle } from './types';
import { ALL_TEMPLATES } from './templates';

export type { TemplateSchema, FieldDef, FieldStyle, FieldKind } from './types';

const DEFAULT_TYPE = 'main_image';

export function getSchema(templateType?: string) {
	return ALL_TEMPLATES[templateType || DEFAULT_TYPE] || ALL_TEMPLATES[DEFAULT_TYPE];
}

export function getRowsPerBlock(templateType?: string): number {
	return getSchema(templateType).rowsPerBlock;
}

export function getColumnsPerBlock(templateType?: string): number {
	return getSchema(templateType).columnsPerBlock;
}

export function getFields(templateType?: string): FieldDef[] {
	return getSchema(templateType).fields;
}

export function getFieldByRow(templateType: string, rowInBlock: number): FieldDef | undefined {
	return getFields(templateType).find((f) => f.row === rowInBlock);
}

// 样式枚举 -> Univer stylesDict 中的样式名（与 constants.ts buildStylesDict 对齐）
export function styleToUniverStyleName(style: FieldStyle, theme: string): string {
	const map: Record<FieldStyle, string> = {
		contentCenter: `contentCenterStyle_${theme}`,
		contentLeft: `contentLeftStyle_${theme}`,
		contentLeftShaded: `contentLeftStyle_shaded_${theme}`,
		editableCenter: `editableCenterStyle_${theme}`,
		editableDate: `editableDateStyle_${theme}`,
	};
	return map[style];
}

// 兼容：旧代码用 TEMPLATE_LABELS[type][row] 取标签，改为 Schema 派生
export function getLabelByRow(templateType: string, rowInBlock: number): string {
	return getFieldByRow(templateType, rowInBlock)?.label || '';
}
