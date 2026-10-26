<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #actionbar-left>
				<el-button type="primary" @click="openAdd">
					<el-icon><Plus /></el-icon>
					添加
				</el-button>
			</template>
			<template #cell_preview="{ row }">
				<div v-if="row.images?.length" class="icon-image-list">
					<el-image
						v-for="(image, index) in row.images.slice(0, MAX_ICON_IMAGES)"
						:key="image.file_id"
						class="icon-preview"
						:src="image.url"
						:preview-src-list="row.images.slice(0, MAX_ICON_IMAGES).map((item: any) => item.url)"
						:initial-index="index"
						preview-teleported
						fit="cover"
					/>
				</div>
				<span v-else class="empty-value">暂无图片</span>
			</template>
			<template #cell_product_count="{ row }">
				<span v-if="row.scope_type === 'all'" class="empty-value">全部适用</span>
				<span
					v-else
					class="product-toggle"
					:class="{ expanded: expandedRows[row.id] }"
					@click="toggleExpand(row)"
				>
					{{ row.product_count }}个商品
					<el-icon class="toggle-arrow"><ArrowDown /></el-icon>
				</span>
			</template>
			<template #cell_expand="{ row }">
				<div v-if="row.scope_type !== 'all'" class="child-panel" @vue:mounted="loadProducts(row)">
					<div class="child-head">
						<strong>适用商品（{{ row.product_count }} 个）</strong>
						<div class="child-actions">
							<el-button
								v-if="canAddProduct"
								type="primary"
								size="small"
								@click="openProductSelector(row)"
							>
								＋ 选择适用商品
							</el-button>
							<el-button
								v-if="canRemoveProduct"
								type="danger"
								size="small"
								plain
								:disabled="!expandedSelected[row.id]?.length"
								@click="removeExpandedProducts(row)"
							>
								移出选中
							</el-button>
						</div>
					</div>
					<div v-if="productLoading[row.id]" class="product-loading">
						<el-icon class="is-loading"><Loading /></el-icon>
						加载中...
					</div>
					<el-table
						v-else
						:data="productCache[row.id] || []"
						size="small"
						max-height="280"
						row-key="product_code"
						border
						@selection-change="(val: any[]) => (expandedSelected[row.id] = val)"
					>
						<el-table-column v-if="canRemoveProduct" type="selection" width="42" />
						<el-table-column prop="product_code" label="商品编码" width="120" />
						<el-table-column prop="product_name" label="商品名称" min-width="160" />
						<el-table-column prop="nickname" label="昵称" min-width="90" />
						<el-table-column v-if="canRemoveProduct" label="操作" width="80">
							<template #default="{ row: prow }">
								<el-button link type="danger" @click="removeOne(row, prow)">移除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</template>
			<template #cell_status="{ row }">
				<el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
					{{ row.status === 'enabled' ? '启用' : '停用' }}
				</el-tag>
			</template>
		</fs-crud>
		<IconFormDialog ref="formDialogRef" @saved="handleFormSaved" />
		<ProductSelectDialog ref="productSelectDialogRef" @confirm="addSelectedProducts" />
	</fs-page>
</template>

<script lang="ts" setup name="iconLibrary">
import { ref, reactive, computed, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, ArrowDown, Loading } from '@element-plus/icons-vue';

import * as iconApi from '/@/api/design_order/icon_library';
import { ChangeStatus, BatchChangeStatus, BatchDelete, BatchAddProducts, BatchRemoveProducts } from '/@/api/design_order/icon_library';
import { createCrudOptions } from './crud';
import type { IconItem } from './types';
import { auth } from '/@/utils/authFunction';
import { MAX_ICON_IMAGES, PERMISSION_PREFIX } from './constants';
import IconFormDialog from './components/IconFormDialog.vue';
import ProductSelectDialog from './components/ProductSelectDialog.vue';

const formDialogRef = ref();
const productSelectDialogRef = ref();
const productSelectorIconId = ref<number | null>(null);
const productCache = reactive<Record<number, any[]>>({});
const productLoading = reactive<Record<number, boolean>>({});
const expandedSelected = reactive<Record<number, any[]>>({});
const expandedRows = reactive<Record<number, boolean>>({});
const canAddProduct = computed(() => auth(`${PERMISSION_PREFIX}:ProductAdd`));
const canRemoveProduct = computed(() => auth(`${PERMISSION_PREFIX}:ProductRemove`));

function toggleExpand(row: IconItem) {
	const table = crudExpose.getBaseTableRef();
	if (!table) return;
	const next = !expandedRows[row.id];
	expandedRows[row.id] = next;
	table.toggleRowExpansion(row, next);
}

function refresh() {
	return crudExpose.doRefresh();
}

async function handleFormSaved(iconId?: number) {
	if (!iconId) {
		await refresh();
		return;
	}
	delete productCache[iconId];
	expandedSelected[iconId] = [];
	await Promise.all([
		loadProducts({ id: iconId } as IconItem),
		refresh(),
	]);
}


function openProductSelector(row: IconItem) {
	productSelectorIconId.value = row.id;
	productSelectDialogRef.value?.open(row.brand, row.id);
}

async function addSelectedProducts(codes: string[]) {
	const iconId = productSelectorIconId.value;
	if (!iconId) return;
	await BatchAddProducts(iconId, codes);
	ElMessage.success(`已添加 ${codes.length} 个商品`);
	delete productCache[iconId];
	await loadProducts({ id: iconId } as IconItem);
	refresh();
}
function openAdd() {
	formDialogRef.value?.openAdd();
}

function openEdit(row: IconItem) {
	formDialogRef.value?.openEdit(row);
}


async function changeStatus(row: IconItem) {
	const target = row.status === 'enabled' ? 'disabled' : 'enabled';
	const label = target === 'enabled' ? '启用' : '停用';
	await ElMessageBox.confirm(`确定${label} Icon「${row.short_name}」吗？`, `${label} Icon`, {
		type: 'warning',
	});
	await ChangeStatus(row.id, target);
	ElMessage.success(`Icon 已${label}`);
	refresh();
}

async function batchChangeStatus(target: 'enabled' | 'disabled') {
	const rows = crudExpose.getBaseTableRef().getSelectionRows() as IconItem[];
	if (!rows?.length) {
		ElMessage.warning('请先勾选要操作的 Icon');
		return;
	}
	const label = target === 'enabled' ? '启用' : '停用';
	await ElMessageBox.confirm(`确定批量${label}选中的 ${rows.length} 个 Icon 吗？`, `批量${label}`, {
		type: 'warning',
	});
	await BatchChangeStatus(rows.map((r) => r.id), target);
	ElMessage.success(`已批量${label} ${rows.length} 个 Icon`);
	crudExpose.getBaseTableRef().clearSelection();
	refresh();
}

async function batchRemove() {
	const rows = crudExpose.getBaseTableRef().getSelectionRows() as IconItem[];
	if (!rows?.length) {
		ElMessage.warning('请先勾选要删除的 Icon');
		return;
	}
	const enabledRows = rows.filter((row) => row.status !== 'disabled');
	if (enabledRows.length) {
		ElMessage.warning('只有停用状态的 Icon 可以删除，请先停用后再操作');
		return;
	}
	await ElMessageBox.confirm(
		`确定批量删除选中的 ${rows.length} 个 Icon 吗？删除后不可恢复。`,
		'批量删除',
		{ type: 'error' }
	);
	await BatchDelete(rows.map((r) => r.id));
	ElMessage.success(`已批量删除 ${rows.length} 个 Icon`);
	crudExpose.getBaseTableRef().clearSelection();
	refresh();
}

async function loadProducts(row: IconItem) {
	if (productCache[row.id]) return;
	productLoading[row.id] = true;
	try {
		const res: any = await iconApi.GetProducts(row.id, { page: 1, limit: 100 });
		productCache[row.id] = res.data || [];
	} finally {
		productLoading[row.id] = false;
	}
}

async function removeExpandedProducts(row: IconItem) {
	const selected = expandedSelected[row.id] || [];
	if (!selected.length) return;
	const codes = selected.map((item: any) => item.product_code);
	await ElMessageBox.confirm(`确定移出 ${codes.length} 个商品吗？`, '移出商品', {
		type: 'warning',
	});
	await BatchRemoveProducts(row.id, codes);
	ElMessage.success('商品已移出');
	delete productCache[row.id];
	expandedSelected[row.id] = [];
	await loadProducts(row);
	refresh();
}

async function removeOne(row: IconItem, product: any) {
	await ElMessageBox.confirm(`确定移出商品「${product.product_name || product.product_code}」吗？`, '移出商品', {
		type: 'warning',
	});
	await BatchRemoveProducts(row.id, [product.product_code]);
	ElMessage.success('商品已移出');
	delete productCache[row.id];
	expandedSelected[row.id] = [];
	await loadProducts(row);
	refresh();
}

const context = { openAdd, openEdit, changeStatus, batchChangeStatus, batchRemove };
(window as any).__iconContext = context;
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

onMounted(() => {
	refresh();
});
</script>

<style scoped>
.icon-image-list {
	display: flex;
	align-items: center;
	gap: 6px;
	max-width: 300px;
	overflow: hidden;
}

.icon-preview {
	width: 52px;
	height: 52px;
	flex: 0 0 52px;
	border-radius: 6px;
}

.empty-value {
	color: var(--el-text-color-placeholder);
}

.product-toggle {
	color: var(--el-color-primary);
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	user-select: none;
}

.toggle-arrow {
	transition: transform 0.2s;
	font-size: 12px;
}

.product-toggle.expanded .toggle-arrow {
	transform: rotate(180deg);
}

/* expand 列仅作为子表结构载体，展开入口由“适用商品”列提供。 */
:deep(.icon-expand-column) {
	width: 1px !important;
	padding: 0 !important;
}

:deep(.icon-expand-column .cell) {
	display: none !important;
}

.child-panel {
	padding: 14px 18px 16px 52px;
	background: #f8fbff;
}

.child-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 10px;
}

.child-head strong {
	font-size: 13px;
}

.child-actions {
	display: flex;
	gap: 8px;
}

.product-loading {
	display: flex;
	align-items: center;
	gap: 6px;
	justify-content: center;
	padding: 20px;
	color: var(--el-text-color-secondary);
}

/* 隐藏 FastCRUD 的默认添加按钮 */
:deep(.fs-actionbar-btn-add) {
	display: none !important;
}
</style>
