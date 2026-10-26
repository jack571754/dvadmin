<template>
	<div class="validation-editor">
		<el-form label-width="120px">
			<el-form-item label="提报必填字段">
				<el-checkbox-group :model-value="requiredSubmissionFields" @update:model-value="updateSubmissionFields">
					<el-checkbox label="name">提报名称</el-checkbox>
					<el-checkbox label="shop">提报店铺/渠道</el-checkbox>
				</el-checkbox-group>
			</el-form-item>
			<el-form-item label="产品必填字段">
				<el-select
					multiple
					filterable
					:model-value="requiredProductFields"
					@update:model-value="updateProductFields"
				>
					<el-option v-for="field in fields" :key="field.key" :label="field.label" :value="field.key" />
				</el-select>
			</el-form-item>
			<el-form-item label="价格字段">
				<el-select clearable :model-value="validation.priceFieldKey" @update:model-value="updateRule('priceFieldKey', $event)">
					<el-option v-for="field in priceFields" :key="field.key" :label="field.label" :value="field.key" />
				</el-select>
			</el-form-item>
			<el-form-item label="日期范围字段">
				<el-select clearable :model-value="validation.dateRangeFieldKey" @update:model-value="updateRule('dateRangeFieldKey', $event)">
					<el-option v-for="field in dateFields" :key="field.key" :label="field.label" :value="field.key" />
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { FieldDef, TemplateValidation } from '../../product_spec/schema';

const props = withDefaults(defineProps<{
	modelValue?: TemplateValidation;
	fields?: FieldDef[];
}>(), {
	modelValue: () => ({ requiredSubmissionFields: [] }),
	fields: () => [],
});

const emit = defineEmits<{
	(event: 'update:modelValue', value: TemplateValidation): void;
}>();

const validation = computed(() => props.modelValue || { requiredSubmissionFields: [] });
const requiredSubmissionFields = computed(() => validation.value.requiredSubmissionFields || []);
const requiredProductFields = computed(() => validation.value.requiredProductFields || []);
const priceFields = computed(() => props.fields.filter((field) => field.kind === 'price'));
const dateFields = computed(() => props.fields.filter((field) => field.kind === 'dateRange'));

const emitValidation = (patch: Partial<TemplateValidation>) => {
	emit('update:modelValue', { ...validation.value, ...patch });
};

const updateSubmissionFields = (value: string[]) => emitValidation({ requiredSubmissionFields: value });
const updateProductFields = (value: string[]) => emitValidation({ requiredProductFields: value });
const updateRule = (key: 'priceFieldKey' | 'dateRangeFieldKey', value?: string) =>
	emitValidation({ [key]: value || undefined });
</script>

<style scoped>
.validation-editor {
	max-width: 680px;
}
</style>
