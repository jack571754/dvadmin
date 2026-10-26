<template>
	<el-dialog v-model="visible" title="商品编码校验" width="920px" append-to-body>
		<el-alert
			v-if="report"
			:title="resultTitle"
			:type="allValid ? 'success' : 'error'"
			:closable="false"
			show-icon
		/>
		<div v-if="report" class="summary">
			<el-tag type="success">有效 {{ report.valid_codes.length }}</el-tag>
			<el-tag :type="report.missing.length ? 'danger' : 'info'">
				不存在 {{ report.missing.length }}
			</el-tag>
			<el-tag :type="report.brand_mismatches.length ? 'warning' : 'info'">
				品牌不一致 {{ report.brand_mismatches.length }}
			</el-tag>
			<el-tag :type="report.duplicates.length ? 'warning' : 'info'">
				重复 {{ report.duplicates.length }}
			</el-tag>
		</div>
		<el-table v-loading="loading" :data="report?.items || []" border height="420">
			<el-table-column prop="product_code" label="商品编码" min-width="150" />
			<el-table-column prop="product_name" label="商品名称" min-width="220" show-overflow-tooltip />
			<el-table-column prop="nickname" label="昵称" min-width="130" show-overflow-tooltip />
			<el-table-column prop="brand" label="实际品牌" min-width="110" />
			<el-table-column prop="series" label="系列" min-width="110" />
			<el-table-column prop="specification" label="规格" min-width="110" />
			<el-table-column label="校验结果" width="120" fixed="right">
				<template #default="{ row }">
					<el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
				</template>
			</el-table-column>
		</el-table>
		<div v-if="report?.duplicates.length" class="duplicate-line">
			重复编码（将自动去重）：{{ report.duplicates.join('、') }}
		</div>
		<template #footer>
			<el-button @click="visible = false">返回修改</el-button>
			<el-button type="primary" :disabled="!allValid" @click="confirmProducts">
				确认使用
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { ValidateProductCodes } from '/@/api/design_order/icon_library';
import type { ProductCodeValidationReport } from '../types';

const emit = defineEmits<{ (event: 'confirm', productCodes: string[]): void }>();
const visible = ref(false);
const loading = ref(false);
const report = ref<ProductCodeValidationReport | null>(null);
const allValid = computed(
	() =>
		Boolean(report.value?.valid_codes.length) &&
		!report.value?.missing.length &&
		!report.value?.brand_mismatches.length
);
const resultTitle = computed(() =>
	allValid.value
		? `校验通过，共 ${report.value?.valid_codes.length || 0} 个商品`
		: '校验未通过，请返回修改无效编码'
);

function statusType(status: string) {
	if (status === 'valid') return 'success';
	if (status === 'brand_mismatch') return 'warning';
	return 'danger';
}

function statusLabel(status: string) {
	if (status === 'valid') return '有效';
	if (status === 'brand_mismatch') return '品牌不一致';
	return '编码不存在';
}

function confirmProducts() {
	if (!allValid.value || !report.value) return;
	emit('confirm', report.value.valid_codes);
	visible.value = false;
}

async function open(productCodes: string[], brand: string) {
	visible.value = true;
	report.value = null;
	loading.value = true;
	try {
		const response: any = await ValidateProductCodes(productCodes, brand);
		report.value = response.data;
	} finally {
		loading.value = false;
	}
}

defineExpose({ open });
</script>

<style scoped>
.summary {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin: 12px 0;
}

.duplicate-line {
	margin-top: 10px;
	color: var(--el-color-warning-dark-2);
	line-height: 24px;
}
</style>
