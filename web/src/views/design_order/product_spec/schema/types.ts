export type FieldStyle =
	| 'contentCenter'
	| 'contentLeft'
	| 'contentLeftShaded'
	| 'editableCenter'
	| 'editableDate';

export type FieldKind =
	| 'text'
	| 'longtext'
	| 'mention'
	| 'gifts'
	| 'tier'
	| 'dateRange'
	| 'price';

export interface FieldDef {
	row: number;
	key: string;
	label: string;
	style: FieldStyle;
	kind: FieldKind;
	required?: boolean;
	maskKey?: string;
}

export interface TemplateValidation {
	requiredSubmissionFields: string[];
	requiredProductFields?: string[];
	priceFieldKey?: string;
	dateRangeFieldKey?: string;
}

export interface TemplateSchema {
	templateType: string;
	label: string;
	rowsPerBlock: number;
	columnsPerBlock: number;
	fields: FieldDef[];
	validation: TemplateValidation;
}
