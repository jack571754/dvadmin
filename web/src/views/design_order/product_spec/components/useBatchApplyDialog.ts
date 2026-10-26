import { computed, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { formatDateRangeCellText, parseDateRangeCellText, resolveBatchTargetIndexes } from '../batchApply';
import type { BatchApplyField, BatchApplyScope } from '../batchApply';

export type BatchFieldAction = 'fill' | 'clear';

export interface BatchApplyDialogProps {
	modelValue: boolean;
	fields: BatchApplyField[];
	targetIndexes: number[];
	sourceLabel: string;
	initialValues?: Record<string, string>;
}

export interface BatchApplyPayload {
	fieldKeys: string[];
	values: Record<string, string>;
	targetIndexes: number[];
}

export interface BatchApplySummaryItem {
	key: string;
	label: string;
	value: string;
	isClear: boolean;
}

export type BatchApplyDialogEmit = {
	(event: 'update:modelValue', value: boolean): void;
	(event: 'apply', payload: BatchApplyPayload): void;
};

interface DraftState {
	fieldActions: Ref<Record<string, BatchFieldAction>>;
	valueDrafts: Ref<Record<string, string>>;
	dateRangeDrafts: Ref<Record<string, string[]>>;
}

interface ValueStateOptions extends DraftState {
	selectedFields: ComputedRef<BatchApplyField[]>;
}

const createTargetState = (props: Readonly<BatchApplyDialogProps>) => {
	const applyScope = ref<BatchApplyScope>('all');
	const selectedTargetIndexes = ref<number[]>([]);
	const resetTargets = () => {
		applyScope.value = 'all';
		selectedTargetIndexes.value = [...props.targetIndexes];
	};
	watch(() => props.modelValue, (visible) => {
		if (visible) resetTargets();
	}, { immediate: true });
	const effectiveTargetIndexes = computed(() => resolveBatchTargetIndexes(
		props.targetIndexes,
		selectedTargetIndexes.value,
		applyScope.value,
	));
	const toggleTarget = (targetIndex: number, checked: boolean) => {
		const selected = new Set(selectedTargetIndexes.value);
		if (checked) selected.add(targetIndex);
		else selected.delete(targetIndex);
		selectedTargetIndexes.value = props.targetIndexes.filter((index) => selected.has(index));
	};
	const selectAllTargets = () => {
		selectedTargetIndexes.value = [...props.targetIndexes];
	};
	const clearTargetSelection = () => {
		selectedTargetIndexes.value = [];
	};
	const scopeLabel = computed(() => applyScope.value === 'all'
		? `全部 ${props.targetIndexes.length} 个商品`
		: `所选 ${effectiveTargetIndexes.value.length} 个商品`);
	const sourceSummary = computed(
		() => `批量值来源：${props.sourceLabel}。当前应用范围：${scopeLabel.value}。`,
	);
	const applyButtonText = computed(() => `应用到${scopeLabel.value}`);
	const targetValidationMessage = computed(() =>
		applyScope.value === 'partial' && !effectiveTargetIndexes.value.length
			? '请至少选择一个要应用的商品'
			: '',
	);
	return {
		applyButtonText,
		applyScope,
		clearTargetSelection,
		effectiveTargetIndexes,
		selectAllTargets,
		selectedTargetIndexes,
		sourceSummary,
		targetValidationMessage,
		toggleTarget,
	};
};

const createDraftState = (props: Readonly<BatchApplyDialogProps>): DraftState => {
	const fieldActions = ref<Record<string, BatchFieldAction>>({});
	const valueDrafts = ref<Record<string, string>>({});
	const dateRangeDrafts = ref<Record<string, string[]>>({});
	const resetDrafts = () => {
		fieldActions.value = {};
		valueDrafts.value = {};
		dateRangeDrafts.value = {};
		for (const field of props.fields) {
			const initialValue = String(props.initialValues?.[field.key] ?? '');
			fieldActions.value[field.key] = 'fill';
			if (field.kind === 'dateRange') {
				dateRangeDrafts.value[field.key] = parseDateRangeCellText(initialValue);
				continue;
			}
			valueDrafts.value[field.key] = initialValue;
		}
	};
	watch(() => props.modelValue, (visible) => {
		if (visible) resetDrafts();
	}, { immediate: true });
	return { fieldActions, valueDrafts, dateRangeDrafts };
};

const createFieldSelectionState = (props: Readonly<BatchApplyDialogProps>) => {
	const selectedFieldKeys = ref<string[]>([]);
	const selectedFields = computed(() =>
		props.fields.filter((field) => selectedFieldKeys.value.includes(field.key)),
	);
	const toggleField = (key: string, checked: boolean) => {
		const selectedKeys = new Set(selectedFieldKeys.value);
		if (checked) selectedKeys.add(key);
		else selectedKeys.delete(key);
		selectedFieldKeys.value = props.fields
			.filter((field) => selectedKeys.has(field.key))
			.map((field) => field.key);
	};
	const selectAllFields = () => {
		selectedFieldKeys.value = props.fields.map((field) => field.key);
	};
	const clearSelectedFields = () => {
		selectedFieldKeys.value = [];
	};
	watch(() => props.modelValue, (visible) => {
		if (visible) clearSelectedFields();
	}, { immediate: true });
	return { clearSelectedFields, selectAllFields, selectedFieldKeys, selectedFields, toggleField };
};

const createValueState = (options: ValueStateOptions) => {
	const resolveFieldValue = (field: BatchApplyField): string => {
		if (options.fieldActions.value[field.key] === 'clear') return '';
		if (field.kind === 'dateRange') {
			return formatDateRangeCellText(options.dateRangeDrafts.value[field.key]);
		}
		return String(options.valueDrafts.value[field.key] ?? '');
	};
	const resolvedValues = computed<Record<string, string>>(() =>
		Object.fromEntries(
			options.selectedFields.value.map((field) => [field.key, resolveFieldValue(field)]),
		),
	);
	return { resolvedValues };
};

const createFieldValidation = (
	options: ValueStateOptions,
	resolvedValues: ComputedRef<Record<string, string>>,
) => {
	const emptyFillFields = computed(() =>
		options.selectedFields.value.filter((field) =>
			options.fieldActions.value[field.key] === 'fill'
			&& !resolvedValues.value[field.key]?.trim(),
		),
	);
	const invalidPriceFields = computed(() =>
		options.selectedFields.value.filter((field) => {
			if (field.kind !== 'price' || options.fieldActions.value[field.key] !== 'fill') return false;
			const value = Number(resolvedValues.value[field.key]);
			return !Number.isFinite(value) || value < 0;
		}),
	);
	return computed(() => {
		if (emptyFillFields.value.length) {
			const labels = emptyFillFields.value.map((field) => field.label).join('、');
			return `请填写“${labels}”，或明确选择“清空字段”`;
		}
		if (!invalidPriceFields.value.length) return '';
		const labels = invalidPriceFields.value.map((field) => field.label).join('、');
		return `“${labels}”必须是大于等于 0 的数字`;
	});
};

const createSummaryState = (
	options: ValueStateOptions,
	resolvedValues: ComputedRef<Record<string, string>>,
	effectiveTargetIndexes: ComputedRef<number[]>,
) => {
	const estimatedCellCount = computed(
		() => options.selectedFields.value.length * effectiveTargetIndexes.value.length,
	);
	const summaryItems = computed<BatchApplySummaryItem[]>(() =>
		options.selectedFields.value.map((field) => {
			const isClear = options.fieldActions.value[field.key] === 'clear';
			return {
				key: field.key,
				label: field.label,
				value: isClear ? '清空应用范围内商品的现有内容' : resolvedValues.value[field.key],
				isClear,
			};
		}),
	);
	return { estimatedCellCount, summaryItems };
};

export const useBatchApplyDialog = (
	props: Readonly<BatchApplyDialogProps>,
	emit: BatchApplyDialogEmit,
) => {
	const targets = createTargetState(props);
	const selection = createFieldSelectionState(props);
	const drafts = createDraftState(props);
	const valueOptions = { ...drafts, selectedFields: selection.selectedFields };
	const { resolvedValues } = createValueState(valueOptions);
	const fieldValidation = createFieldValidation(valueOptions, resolvedValues);
	const validationMessage = computed(
		() => targets.targetValidationMessage.value || fieldValidation.value,
	);
	const summary = createSummaryState(
		valueOptions,
		resolvedValues,
		targets.effectiveTargetIndexes,
	);
	const canSubmit = computed(
		() => selection.selectedFieldKeys.value.length > 0 && !validationMessage.value,
	);
	const handleConfirm = () => {
		if (!canSubmit.value) return;
		emit('apply', {
			fieldKeys: [...selection.selectedFieldKeys.value],
			values: { ...resolvedValues.value },
			targetIndexes: [...targets.effectiveTargetIndexes.value],
		});
	};
	return {
		...drafts,
		...selection,
		...summary,
		...targets,
		canSubmit,
		handleConfirm,
		validationMessage,
	};
};