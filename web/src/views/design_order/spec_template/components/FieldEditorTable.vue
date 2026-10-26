<template>
	<div class="field-editor">
		<el-table :data="fields" border size="small">
			<el-table-column label="行号" width="76">
				<template #default="{ row, $index }">
					<el-input-number
						:model-value="row.row"
						:min="1"
						:max="maxRow"
						:controls="false"
						@update:model-value="updateField($index, 'row', $event)"
					/>
				</template>
			</el-table-column>
			<el-table-column label="字段键名" min-width="130">
				<template #default="{ row, $index }">
					<el-input :model-value="row.key" @update:model-value="updateField($index, 'key', $event)" />
				</template>
			</el-table-column>
			<el-table-column label="字段标签" min-width="140">
				<template #default="{ row, $index }">
					<el-input :model-value="row.label" @update:model-value="updateField($index, 'label', $event)" />
				</template>
			</el-table-column>
			<el-table-column label="样式" min-width="150">
				<template #default="{ row, $index }">
					<el-select :model-value="row.style" @update:model-value="updateField($index, 'style', $event)">
						<el-option v-for="style in styles" :key="style" :label="style" :value="style" />
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="类型" min-width="120">
				<template #default="{ row, $index }">
					<el-select :model-value="row.kind" @update:model-value="updateField($index, 'kind', $event)">
						<el-option v-for="kind in kinds" :key="kind" :label="kind" :value="kind" />
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="遮罩字段" min-width="130">
				<template #default="{ row, $index }">
					<el-input :model-value="row.maskKey" @update:model-value="updateField($index, 'maskKey', $event)" />
				</template>
			</el-table-column>
			<el-table-column width="56" fixed="right">
				<template #default="{ $index }">
					<el-button link type="danger" :icon="Delete" title="删除字段" @click="removeField($index)" />
				</template>
			</el-table-column>
		</el-table>
		<el-button class="add-field" plain type="primary" :icon="Plus" @click="addField">新增字段</el-button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';

import type { FieldDef } from '../../product_spec/schema';

const styles = ['contentCenter', 'contentLeft', 'contentLeftShaded', 'editableCenter', 'editableDate'];
const kinds = ['text', 'longtext', 'mention', 'gifts', 'tier', 'dateRange', 'price'];

const props = withDefaults(defineProps<{
	modelValue?: FieldDef[];
	rowsPerBlock?: number;
}>(), {
	modelValue: () => [],
	rowsPerBlock: 15,
});

const emit = defineEmits<{
	(event: 'update:modelValue', value: FieldDef[]): void;
}>();

const fields = computed(() => props.modelValue || []);
const maxRow = computed(() => Math.max(1, props.rowsPerBlock - 2));

const updateField = (index: number, key: keyof FieldDef, value: string | number) => {
	const next = fields.value.map((field, fieldIndex) =>
		fieldIndex === index ? { ...field, [key]: value } : { ...field },
	);
	emit('update:modelValue', next);
};

const removeField = (index: number) => {
	emit('update:modelValue', fields.value.filter((_, fieldIndex) => fieldIndex !== index));
};

const addField = () => {
	const usedRows = new Set(fields.value.map((field) => field.row));
	const row = Array.from({ length: maxRow.value }, (_, index) => index + 1)
		.find((candidate) => !usedRows.has(candidate));
	if (!row) return;
	emit('update:modelValue', [
		...fields.value.map((field) => ({ ...field })),
		{
			row,
			key: `field${row}`,
			label: '新字段',
			style: 'editableCenter',
			kind: 'text',
			maskKey: '',
		},
	]);
};
</script>

<style scoped>
.field-editor {
	width: 100%;
}

.add-field {
	margin-top: 12px;
}
</style>
