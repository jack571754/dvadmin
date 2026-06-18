<template>
	<div class="validation-editor">
		<el-form label-width="160px" size="small">
			<el-form-item label="提报级必填字段">
				<el-input v-model="submissionFieldsStr" placeholder="逗号分隔，如 name,shop" />
			</el-form-item>
			<el-form-item label="产品级必填字段">
				<el-input v-model="productFieldsStr" placeholder="逗号分隔，字段 key，如 brand,fullName,spec" />
			</el-form-item>
			<el-form-item label="价格字段键">
				<el-input v-model="local.priceFieldKey" placeholder="通常为 price" />
			</el-form-item>
			<el-form-item label="日期字段键">
				<el-input v-model="local.dateRangeFieldKey" placeholder="通常为 dateRange" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const local = reactive<any>({
	requiredSubmissionFields: [],
	requiredProductFields: [],
	priceFieldKey: 'price',
	dateRangeFieldKey: 'dateRange',
	...(props.modelValue || {}),
});

const splitStr = (arr: any[]) => (Array.isArray(arr) ? arr.join(',') : '');
const submissionFieldsStr = computed({
	get: () => splitStr(local.requiredSubmissionFields),
	set: (v) => { local.requiredSubmissionFields = v.split(',').map((s) => s.trim()).filter(Boolean); sync(); },
});
const productFieldsStr = computed({
	get: () => splitStr(local.requiredProductFields),
	set: (v) => { local.requiredProductFields = v.split(',').map((s) => s.trim()).filter(Boolean); sync(); },
});

watch(() => local.priceFieldKey, sync);
watch(() => local.dateRangeFieldKey, sync);

function sync() {
	emit('update:modelValue', {
		requiredSubmissionFields: local.requiredSubmissionFields,
		requiredProductFields: local.requiredProductFields,
		priceFieldKey: local.priceFieldKey,
		dateRangeFieldKey: local.dateRangeFieldKey,
	});
}
</script>
