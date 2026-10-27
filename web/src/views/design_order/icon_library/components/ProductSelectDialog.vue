<template>
	<el-dialog v-model="visible" title="选择适用商品" width="860px" append-to-body>
		<div class="toolbar">
			<el-input
				v-model="keyword"
				clearable
				placeholder="搜索可添加商品的编码、名称或昵称"
				@keyup.enter="loadProducts"
			/>
			<el-button type="primary" @click="loadProducts">查询</el-button>
		</div>
		<el-table
			ref="tableRef"
			v-loading="loading"
			:data="rows"
			border
			height="420"
			@selection-change="handleSelection"
		>
			<el-table-column type="selection" width="48" />
			<el-table-column prop="product_code" label="商品编码" min-width="140" />
			<el-table-column prop="product_name" label="商品名称" min-width="210" />
			<el-table-column prop="nickname" label="昵称" min-width="130" />
			<el-table-column prop="series" label="系列" min-width="110" />
			<el-table-column prop="specification" label="规格" min-width="110" />
		</el-table>
		<el-pagination
			v-model:current-page="page"
			v-model:page-size="limit"
			class="pagination"
			layout="total, prev, pager, next"
			:total="total"
			@current-change="loadProducts"
		/>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="confirmSelection">
				添加选中商品
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { warningMessage } from '/@/utils/message';


import { GetProductOptions } from '/@/api/design_order/icon_library';
import type { ProductItem } from '../types';

const emit = defineEmits<{
	(event: 'confirm', productCodes: string[]): void;
}>();

const visible = ref(false);
const loading = ref(false);
const keyword = ref('');
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const rows = ref<ProductItem[]>([]);
const selectedRows = ref<ProductItem[]>([]);
const tableRef = ref();
const brand = ref('');
const iconId = ref<number>();

async function loadProducts() {
	loading.value = true;
	try {
		const params: Record<string, unknown> = {
			brand: brand.value,
			keyword: keyword.value,
			page: page.value,
			limit: limit.value,
		};
		if (iconId.value !== undefined) params.icon_id = iconId.value;
		const response: any = await GetProductOptions(params);
		rows.value = response.data || [];
		total.value = response.total || 0;
	} finally {
		loading.value = false;
	}
}

function handleSelection(selection: ProductItem[]) {
	selectedRows.value = selection;
}

function confirmSelection() {
	const codes = selectedRows.value.map((item) => item.product_code);
	if (!codes.length) {
		warningMessage('请至少选择一个商品');
		return;
	}
	emit('confirm', codes);
	visible.value = false;
}

async function open(nextBrand = "", nextIconId?: number) {
	brand.value = nextBrand;
	iconId.value = nextIconId;
	keyword.value = '';
	page.value = 1;
	selectedRows.value = [];
	visible.value = true;
	await loadProducts();
	await nextTick();
	tableRef.value?.clearSelection();
}

defineExpose({ open });
</script>

<style scoped>
.toolbar {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 12px;
	margin-bottom: 12px;
}

.pagination {
	justify-content: flex-end;
	margin-top: 14px;
}
</style>
