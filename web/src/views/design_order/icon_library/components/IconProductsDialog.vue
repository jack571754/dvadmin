<template>
	<el-dialog
		v-model="visible"
		:title="`${icon?.short_name || ''} · 适用商品`"
		width="900px"
		append-to-body
	>
		<div class="toolbar">
			<el-input
				v-model="keyword"
				clearable
				placeholder="搜索已关联商品的编码、名称或昵称"
				@keyup.enter="searchProducts"
				@clear="searchProducts"
			/>
			<el-button type="primary" @click="searchProducts">查询</el-button>
			<el-button
				v-if="canAdd"
				type="success"
				@click="productDialogRef?.open(icon?.brand)"
			>
				选择添加
			</el-button>
			<el-button v-if="canRemove" type="danger" plain @click="removeSelected">
				移出选中
			</el-button>
		</div>
		<el-input
			v-if="canAdd"
			v-model="batchText"
			type="textarea"
			:rows="3"
			placeholder="也可以批量粘贴商品编码，支持换行、空格、中英文逗号或分号分隔"
		/>
		<div v-if="canAdd" class="batch-actions">
			<el-button type="primary" plain @click="addByText">批量添加</el-button>
		</div>
		<el-table
			v-loading="loading"
			:data="rows"
			border
			height="390"
			@selection-change="selectedRows = $event"
		>
			<el-table-column v-if="canRemove" type="selection" width="48" />
			<el-table-column prop="product_code" label="商品编码" min-width="140" />
			<el-table-column prop="product_name" label="商品名称" min-width="220" />
			<el-table-column prop="nickname" label="昵称" min-width="130" />
			<el-table-column prop="series" label="系列" min-width="110" />
			<el-table-column prop="specification" label="规格" min-width="110" />
			<el-table-column v-if="canRemove" label="操作" width="80" fixed="right">
				<template #default="{ row }">
					<el-button link type="danger" @click="removeCodes([row.product_code])">
						移出
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			v-model:current-page="page"
			class="pagination"
			layout="total, prev, pager, next"
			:page-size="limit"
			:total="total"
			@current-change="loadProducts"
		/>
		<ProductSelectDialog ref="productDialogRef" @confirm="addCodes" />
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import * as api from '/@/api/design_order/icon_library';
import { auth } from '/@/utils/authFunction';
import { PERMISSION_PREFIX } from '../constants';
import type { IconItem, ProductItem } from '../types';
import ProductSelectDialog from './ProductSelectDialog.vue';

const emit = defineEmits<{ (event: 'changed', iconId: number): void }>();
const visible = ref(false);
const loading = ref(false);
const icon = ref<IconItem | null>(null);
const keyword = ref('');
const batchText = ref('');
const page = ref(1);
const limit = 20;
const total = ref(0);
const rows = ref<ProductItem[]>([]);
const selectedRows = ref<ProductItem[]>([]);
const productDialogRef = ref();
const canAdd = computed(() => auth(`${PERMISSION_PREFIX}:ProductAdd`));
const canRemove = computed(() => auth(`${PERMISSION_PREFIX}:ProductRemove`));

function searchProducts() {
	page.value = 1;
	loadProducts();
}

async function loadProducts() {
	if (!icon.value) return;
	loading.value = true;
	try {
		const response: any = await api.GetProducts(icon.value.id, {
			keyword: keyword.value,
			page: page.value,
			limit,
		});
		rows.value = response.data || [];
		total.value = response.total || 0;
	} finally {
		loading.value = false;
	}
}

function parseCodes(text: string) {
	return [
		...new Set(
			text
				.split(/[\s,，、;；]+/)
				.map((item) => item.trim())
				.filter(Boolean)
		),
	];
}

async function addCodes(codes: string[]) {
	if (!icon.value) return;
	const response: any = await api.BatchAddProducts(icon.value.id, codes);
	const added = response.data?.added?.length || 0;
	const existing = response.data?.existing?.length || 0;
	ElMessage.success(`新增 ${added} 个，已关联 ${existing} 个`);
	batchText.value = '';
	await loadProducts();
	emit('changed', icon.value.id);
}

async function addByText() {
	const codes = parseCodes(batchText.value);
	if (!codes.length) {
		ElMessage.warning('请填写商品编码');
		return;
	}
	await addCodes(codes);
}

async function removeCodes(codes: string[]) {
	if (!icon.value) return;
	await ElMessageBox.confirm(`确定移出 ${codes.length} 个商品吗？`, '移出商品', {
		type: 'warning',
	});
	await api.BatchRemoveProducts(icon.value.id, codes);
	ElMessage.success('商品已移出');
	await loadProducts();
	emit('changed', icon.value.id);
}

async function removeSelected() {
	const codes = selectedRows.value.map((item) => item.product_code);
	if (!codes.length) {
		ElMessage.warning('请选择要移出的商品');
		return;
	}
	await removeCodes(codes);
}

async function open(row: IconItem) {
	icon.value = row;
	keyword.value = '';
	batchText.value = '';
	page.value = 1;
	visible.value = true;
	await loadProducts();
}

defineExpose({ open });
</script>

<style scoped>
.toolbar {
	display: grid;
	grid-template-columns: 1fr auto auto auto;
	gap: 10px;
	margin-bottom: 12px;
}

.batch-actions {
	display: flex;
	justify-content: flex-end;
	margin: 8px 0 12px;
}

.pagination {
	justify-content: flex-end;
	margin-top: 14px;
}
</style>
