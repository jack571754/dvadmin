<template>
	<el-dialog 
		v-model="visible" 
		title="🔍 选择产品昵称进行引用" 
		width="600px" 
		:close-on-click-modal="true"
		@close="handleClose"
		custom-class="product-select-dialog"
	>
		<div class="product-dialog-content">
			<!-- 搜索框 -->
			<el-input
				v-model="searchQuery"
				ref="dialogSearchInputRef"
				placeholder="输入产品昵称、官方全称、品牌或规格进行搜索..."
				clearable
				@keydown="handleDialogKeyDown"
				style="margin-bottom: 16px;"
			>
				<template #prefix>
					<el-icon><Search /></el-icon>
				</template>
			</el-input>

			<!-- 产品列表 -->
			<div class="product-dialog-list" ref="dialogListRef">
				<div 
					v-for="(item, idx) in filteredProducts" 
					:key="idx" 
					class="product-dialog-item"
					:class="{ active: idx === selectedIndex }"
					@click="handleSelect(item)"
					@mouseenter="selectedIndex = idx"
				>
					<div class="product-dialog-item-content">
						<div class="product-dialog-item-name" v-html="highlightText(item.name, searchQuery)"></div>
						<div class="product-dialog-item-brand-spec">
							<span class="product-dialog-item-brand" v-if="item.brand">{{ item.brand }}</span>
							<span class="product-dialog-item-spec" v-if="item.fullName"> | {{ item.fullName }}</span>
						</div>
						<div class="product-dialog-item-desc">{{ item.desc }}</div>
					</div>
				</div>
				<div v-if="filteredProducts.length === 0" class="product-dialog-empty">
					未找到匹配的产品数据
				</div>
			</div>
		</div>
		<template #footer>
			<div class="product-dialog-footer-tip">
				💡 支持键盘 ↑↓ 键移动选择，按 Enter 键快速插入，Esc 键退出
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { SelectableProduct } from '../types';
import { highlightText } from '../utils';

const props = defineProps<{
	modelValue: boolean;
	options: SelectableProduct[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', val: boolean): void;
	(e: 'select', item: SelectableProduct): void;
	(e: 'close'): void;
}>();

const visible = ref(props.modelValue);
const searchQuery = ref('');
const selectedIndex = ref(0);
const dialogSearchInputRef = ref<any>(null);
const dialogListRef = ref<HTMLElement | null>(null);

watch(() => props.modelValue, (newVal) => {
	visible.value = newVal;
	if (newVal) {
		searchQuery.value = '';
		selectedIndex.value = 0;
		nextTick(() => {
			if (dialogSearchInputRef.value) {
				dialogSearchInputRef.value.focus();
			}
		});
	}
});

watch(() => visible.value, (newVal) => {
	emit('update:modelValue', newVal);
});

const filteredProducts = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();
	if (!query) return props.options;
	return props.options.filter(opt => 
		opt.cleanName.toLowerCase().includes(query) || 
		opt.name.toLowerCase().includes(query) ||
		(opt.brand && opt.brand.toLowerCase().includes(query)) ||
		(opt.fullName && opt.fullName.toLowerCase().includes(query)) ||
		(opt.desc && opt.desc.toLowerCase().includes(query))
	);
});

const handleClose = () => {
	visible.value = false;
	emit('close');
};

const handleSelect = (item: SelectableProduct) => {
	emit('select', item);
};

const handleDialogKeyDown = (e: KeyboardEvent) => {
	if (filteredProducts.value.length === 0) return;
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		selectedIndex.value = (selectedIndex.value + 1) % filteredProducts.value.length;
		scrollToSelectedIndex();
	} else if (e.key === 'ArrowUp') {
		e.preventDefault();
		selectedIndex.value = (selectedIndex.value - 1 + filteredProducts.value.length) % filteredProducts.value.length;
		scrollToSelectedIndex();
	} else if (e.key === 'Enter') {
		e.preventDefault();
		if (filteredProducts.value[selectedIndex.value]) {
			handleSelect(filteredProducts.value[selectedIndex.value]);
		}
	}
};

const scrollToSelectedIndex = () => {
	nextTick(() => {
		if (!dialogListRef.value) return;
		const activeItem = dialogListRef.value.querySelector('.product-dialog-item.active') as HTMLElement;
		if (activeItem) {
			activeItem.scrollIntoView({ block: 'nearest' });
		}
	});
};
</script>

<style scoped>
/* 选择商品弹窗样式 */
:deep(.product-select-dialog) {
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.product-select-dialog .el-dialog__header) {
	margin-right: 0;
	padding: 20px 24px;
	border-bottom: 1px solid #f1f5f9;
	background: #fafafa;
}

:deep(.product-select-dialog .el-dialog__title) {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
}

:deep(.product-select-dialog .el-dialog__body) {
	padding: 20px 24px;
}

.product-dialog-content {
	display: flex;
	flex-direction: column;
}

.product-dialog-list {
	max-height: 380px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 2px;
}

.product-dialog-item {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 10px 16px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid transparent;
}

.product-dialog-item:hover,
.product-dialog-item.active {
	background: #f1f5f9;
	border-color: rgba(226, 232, 240, 0.8);
}

.product-dialog-item.active {
	background: #eff6ff;
	border-color: rgba(191, 219, 254, 0.8);
}


.product-dialog-item-content {
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}

.product-dialog-item-name {
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
}

.product-dialog-item-brand-spec {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	color: #64748b;
	margin-top: 2px;
}

.product-dialog-item-brand {
	background: #f1f5f9;
	color: #475569;
	padding: 1px 6px;
	border-radius: 4px;
	font-weight: 600;
}

.product-dialog-item-spec {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	flex: 1;
}

.product-dialog-item-desc {
	font-size: 12px;
	color: #475569;
	margin-top: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.product-dialog-empty {
	padding: 40px 0;
	text-align: center;
	font-size: 13px;
	color: #94a3b8;
}

.product-dialog-footer-tip {
	font-size: 11px;
	color: #64748b;
	background: #f8fafc;
	padding: 8px 16px;
	border-radius: 8px;
	border: 1px solid #f1f5f9;
	text-align: left;
	width: 100%;
}

:deep(.highlight-match) {
	color: #2563eb;
	background: #dbeafe;
	font-weight: 700;
	padding: 0 2px;
	border-radius: 2px;
}
</style>
