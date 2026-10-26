import { getProductCoords } from './utils';
import type { FieldDef, FieldKind, TemplateSchema } from './schema';
import type { ValidationError, ValidationResult } from './types';

const SUBMISSION_LABEL = '提报信息';
const MASKED_VALUE = '***';
const DATE_RANGE_SEPARATOR = '~';
const DATE_TEXT_PATTERN = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2})?$/;
/** 这两类字段缺失只给建议，不阻断提交。 */
const WARNING_FIELD_KINDS: ReadonlySet<FieldKind> = new Set(['longtext', 'gifts']);

export interface SubmissionValidationDeps {
	submissionName: () => string;
	submissionShop: () => string;
	formCount: () => number;
	schema: () => TemplateSchema;
	fields: () => FieldDef[];
	rowsPerBlock: () => number;
	colsPerBlock: () => number;
	nicknameRow: () => number;
	/** 读取单元格原值；无查看权限的字段会读到 ***。 */
	readCellValue: (row: number, col: number) => any;
	/** 从昵称单元格文本里剥离编号后缀，空值表示该列未填写商品。 */
	cleanNickname: (raw: any) => string;
	productLabel: (index: number) => string;
}

type FieldRef = Pick<FieldDef, 'key' | 'label'>;

/** *** 表示无查看权限，既不能当成已填写，也不能当成用户主动留空。 */
const isBlankValue = (value: unknown): boolean => {
	if (value === null || value === undefined) return true;
	const text = typeof value === 'string' ? value.trim() : String(value);
	return !text || text === MASKED_VALUE;
};

export interface ValidationTarget {
	productIndex: number;
	productLabel: string;
}

const toError = (
	target: ValidationTarget,
	field: FieldRef,
	detail: Readonly<{ rule: ValidationError['rule']; message: string }>,
): ValidationError => ({
	productIndex: target.productIndex,
	productLabel: target.productLabel,
	field: field.key,
	fieldLabel: field.label,
	rule: detail.rule,
	message: detail.message,
});

const submissionError = (field: FieldRef, message: string): ValidationError => ({
	productIndex: -1,
	productLabel: SUBMISSION_LABEL,
	field: field.key,
	fieldLabel: field.label,
	rule: 'required',
	message,
});

export const validateRequiredField = (
	target: ValidationTarget,
	field: FieldRef,
	value: unknown,
): ValidationError[] =>
	isBlankValue(value)
		? [
				toError(target, field, {
					rule: 'required',
					message: `${target.productLabel} 的「${field.label}」不能为空`,
				}),
			]
		: [];

export const validatePriceField = (
	target: ValidationTarget,
	field: FieldRef,
	value: unknown,
): ValidationError[] => {
	/** 价格非必填：留空合法，只在填写后校验数值为正。 */
	if (isBlankValue(value)) return [];
	const text = String(value).replaceAll(',', '').trim();
	const priceNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text) ? Number(text) : Number.NaN;
	if (Number.isFinite(priceNumber) && priceNumber > 0) return [];
	return [
		toError(target, field, {
			rule: 'format',
			message: `${target.productLabel} 的「${field.label}」必须为大于0的数值`,
		}),
	];
};

export const validateDateRangeField = (
	target: ValidationTarget,
	field: FieldRef,
	value: unknown,
): ValidationError[] => {
	/** 活动时间非必填：留空合法，只在填写后校验格式与先后顺序。 */
	if (isBlankValue(value)) return [];
	const text = String(value);
	// 不含分隔符时按单个日期看待，沿用历史行为不做格式校验
	if (!text.includes(DATE_RANGE_SEPARATOR)) return [];
	const [start, end] = text.split(DATE_RANGE_SEPARATOR).map((part) => part.trim());
	if (!DATE_TEXT_PATTERN.test(start) || !DATE_TEXT_PATTERN.test(end)) {
		return [
			toError(target, field, {
				rule: 'format',
				message: `${target.productLabel} 的「${field.label}」格式不正确，应为 YYYY-MM-DD HH:MM ~ YYYY-MM-DD HH:MM`,
			}),
		];
	}
	if (new Date(start) > new Date(end)) {
		return [
			toError(target, field, {
				rule: 'range',
				message: `${target.productLabel} 的活动开始时间不能晚于结束时间`,
			}),
		];
	}
	return [];
};

export const validateWarningField = (
	target: ValidationTarget,
	field: FieldRef,
	value: unknown,
): ValidationError[] =>
	isBlankValue(value)
		? [
				toError(target, field, {
					rule: 'required',
					message: `${target.productLabel} 的「${field.label}」为空，建议补充`,
				}),
			]
		: [];

interface ValidationPlan {
	rowsPerBlock: number;
	colsPerBlock: number;
	nicknameRow: number;
	requiredFields: FieldDef[];
	/** requiredProductFields 里在当前模板找不到的键，作为模板配置错误上报。 */
	missingRequiredKeys: string[];
	priceField?: FieldDef;
	dateField?: FieldDef;
	warningFields: FieldDef[];
}

export const createSubmissionValidator = (deps: SubmissionValidationDeps) => {
	const fieldByKey = (key?: string): FieldDef | undefined =>
		key ? deps.fields().find((field) => field.key === key) : undefined;

	const buildPlan = (): ValidationPlan => {
		const { validation } = deps.schema();
		const requiredFields: FieldDef[] = [];
		const missingRequiredKeys: string[] = [];
		for (const key of validation.requiredProductFields || []) {
			const field = fieldByKey(key);
			if (field) requiredFields.push(field);
			else missingRequiredKeys.push(key);
		}
		return {
			rowsPerBlock: deps.rowsPerBlock(),
			colsPerBlock: deps.colsPerBlock(),
			nicknameRow: deps.nicknameRow(),
			requiredFields,
			missingRequiredKeys,
			priceField: fieldByKey(validation.priceFieldKey),
			dateField: fieldByKey(validation.dateRangeFieldKey),
			warningFields: deps.fields().filter((field) => WARNING_FIELD_KINDS.has(field.kind)),
		};
	};

	const validateSubmissionFields = (): ValidationError[] => {
		const errors: ValidationError[] = [];
		if (!deps.submissionName().trim()) {
			errors.push(submissionError({ key: 'name', label: '提报名称' }, '提报名称不能为空'));
		}
		if (!deps.submissionShop().trim()) {
			errors.push(submissionError({ key: 'shop', label: '提报店铺' }, '提报店铺不能为空'));
		}
		return errors;
	};

	const validateProduct = (index: number, plan: ValidationPlan) => {
		const coords = getProductCoords(index, plan.rowsPerBlock, plan.colsPerBlock);
		const readField = (row: number) => deps.readCellValue(coords.blockStartRow + row, coords.blockCol);
		if (!deps.cleanNickname(readField(plan.nicknameRow))) return null;

		const target: ValidationTarget = {
			productIndex: index,
			productLabel: deps.productLabel(index),
		};
		const errors = plan.requiredFields.flatMap((field) =>
			validateRequiredField(target, field, readField(field.row)),
		);
		if (plan.priceField) {
			errors.push(...validatePriceField(target, plan.priceField, readField(plan.priceField.row)));
		}
		if (plan.dateField) {
			errors.push(...validateDateRangeField(target, plan.dateField, readField(plan.dateField.row)));
		}
		const warnings = plan.warningFields.flatMap((field) =>
			validateWarningField(target, field, readField(field.row)),
		);
		return { errors, warnings };
	};

	const validateBeforeSubmit = (): ValidationResult => {
		const plan = buildPlan();
		const errors = validateSubmissionFields();
		const warnings: ValidationError[] = [];
		for (const key of plan.missingRequiredKeys) {
			errors.push(submissionError({ key, label: key }, `模板缺少必填字段配置：${key}`));
		}

		let hasAnyProduct = false;
		for (let index = 0; index < deps.formCount(); index++) {
			const result = validateProduct(index, plan);
			if (!result) continue;
			hasAnyProduct = true;
			errors.push(...result.errors);
			warnings.push(...result.warnings);
		}
		if (!hasAnyProduct) {
			errors.push(
				submissionError({ key: 'products', label: '产品数据' }, '至少需要填写1个有效产品'),
			);
		}
		return { valid: errors.length === 0, errors, warnings };
	};

	return { validateBeforeSubmit };
};

export type SubmissionValidator = ReturnType<typeof createSubmissionValidator>;
