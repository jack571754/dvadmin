<template>
	<div class="field-editor">
		<el-alert type="info" :closable="false" style="margin-bottom: 8px;">
			字段数必须 = 每块行数 - 2；行号 1..N 连续唯一；倒数第二行 key='price'+kind='price'；倒数第三行 key='dateRange'+kind='dateRange'。
		</el-alert>
		<el-table :data="fields" border size="small" style="width:100%">
			<el-table-column label="行号" width="70">
				<template #default="{ row }">
					<el-input-number v-model="row.row" :min="1" :controls="false" style="width:100%" size="small" />
				</template>
			</el-table-column>
			<el-table-column label="字段键 (key)" width="150">
				<template #default="{ row }"><el-input v-model="row.key" size="small" placeholder="如 brand" /></template>
			</el-table-column>
			<el-table-column label="标签" width="150">
				<template #default="{ row }"><el-input v-model="row.label" size="small" placeholder="如 品牌" /></template>
			</el-table-column>
			<el-table-column label="类型 (kind)" width="140">
				<template #default="{ row }">
					<el-select v-model="row.kind" size="small" style="width:100%">
						<el-option v-for="k in KIND_OPTIONS" :key="k" :label="k" :value="k" />
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="样式 (style)" width="160">
				<template #default="{ row }">
					<el-select v-model="row.style" size="small" style="width:100%">
						<el-option v-for="s in STYLE_OPTIONS" :key="s" :label="s" :value="s" />
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="必填" width="60">
				<template #default="{ row }"><el-switch v-model="row.required" size="small" /></template>
			</el-table-column>
			<el-table-column label="遮罩键 (maskKey)" width="150">
				<template #default="{ row }"><el-input v-model="row.maskKey" size="small" placeholder="snake_case" /></template>
			</el-table-column>
			<el-table-column label="操作" width="80">
				<template #default="{ $index }">
					<el-button type="danger" size="small" link @click="removeRow($index)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-button size="small" style="margin-top: 8px" @click="addRow">+ 添加字段</el-button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

const KIND_OPTIONS = ['text', 'longtext', 'mention', 'gifts', 'tier', 'dateRange', 'price'];
const STYLE_OPTIONS = ['contentCenter', 'contentLeft', 'contentLeftShaded', 'editableCenter', 'editableDate'];

const props = defineProps<{ modelValue: any[]; rowsPerBlock?: number }>();
const emit = defineEmits(['update:modelValue']);

const fields = computed({
	get: () => props.modelValue || [],
	set: (v) => emit('update:modelValue', v),
});

const addRow = () => {
	fields.value.push({ row: fields.value.length + 1, key: '', label: '', style: 'contentCenter', kind: 'text', required: false, maskKey: '' });
};

const removeRow = (index: number) => {
	fields.value.splice(index, 1);
};

// 供父组件提交前调用，返回错误消息数组
defineExpose({
	validate: (rpb: number): string[] => {
		const errs: string[] = [];
		const fs = fields.value;
		if (fs.length !== rpb - 2) {
			errs.push(`字段数必须 = 每块行数-2 = ${rpb - 2}，当前 ${fs.length}`);
		}
		const rows = fs.map((f) => Number(f.row)).sort((a, b) => a - b);
		const expected = Array.from({ length: rpb - 2 }, (_, i) => i + 1);
		if (JSON.stringify(rows) !== JSON.stringify(expected)) {
			errs.push(`行号必须为 1..${rpb - 2} 连续唯一`);
		}
		const priceF = fs.find((f) => f.kind === 'price');
		if (!priceF || Number(priceF.row) !== rpb - 2 || priceF.key !== 'price') {
			errs.push(`第 ${rpb - 2} 行必须为 key='price', kind='price'`);
		}
		const dateF = fs.find((f) => f.kind === 'dateRange');
		if (!dateF || Number(dateF.row) !== rpb - 3 || dateF.key !== 'dateRange') {
			errs.push(`第 ${rpb - 3} 行必须为 key='dateRange', kind='dateRange'`);
		}
		fs.forEach((f, i) => {
			if (!f.key) errs.push(`第 ${i + 1} 行 key 必填`);
			if (!f.label) errs.push(`第 ${i + 1} 行 label 必填`);
		});
		return errs;
	},
});
</script>
