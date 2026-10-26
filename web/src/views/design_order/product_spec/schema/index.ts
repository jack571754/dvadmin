import { FieldDef, FieldStyle } from './types';
import type { TemplateSchema } from './types';

export type { TemplateSchema, FieldDef, FieldStyle, FieldKind } from './types';

const templates = new Map<string, TemplateSchema>();

export function registerTemplate(schema: TemplateSchema): void {
	templates.set(schema.templateType, schema);
}

export function getSchema(templateType?: string) {
	if (!templateType) {
		throw new Error('未指定模板类型');
	}
	const schema = templates.get(templateType);
	if (!schema) {
		throw new Error(`模板“${templateType}”尚未加载`);
	}
	return schema;
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
