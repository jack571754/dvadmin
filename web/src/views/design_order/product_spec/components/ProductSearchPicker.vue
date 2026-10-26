<template>
	<div ref="searchRoot" class="product-search-picker">
		<input
			:value="searchQuery"
			class="product-search-input"
			placeholder="搜索产品昵称、名称或编码..."
			autocomplete="off"
			@focus="openDropdown"
			@input="handleInput"
		>
		<div v-if="dropdownVisible && matchedProducts.length" class="product-search-dropdown">
			<div class="product-option-header">
				<span>显示名称</span>
				<span>官方全称</span>
				<span>编码</span>
				<span>规格</span>
			</div>
			<div
				v-for="product in matchedProducts"
				:key="getProductSelectionKey(product)"
				class="product-option-row"
				@mousedown.prevent="selectProduct(product)"
			>
				<div class="product-option-name" :title="product.nickname">{{ product.nickname }}</div>
				<div :title="product.fullName">{{ product.fullName || '-' }}</div>
				<div :title="product.productCode">{{ product.productCode || '-' }}</div>
				<div :title="product.spec">{{ product.spec || '-' }}</div>
			</div>
		</div>
		<div v-else-if="dropdownVisible && searchQuery.trim()" class="product-search-empty">
			没有该产品请先维护
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { getProductSelectionKey } from '../productSearch';
import type { DBProductItem } from '../types';

const props = defineProps<{
	modelValue: string;
	products: DBProductItem[];
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void;
}>();

const searchRoot = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const matchedProducts = ref<DBProductItem[]>([]);
const dropdownVisible = ref(false);
let preserveQueryOnModelClear = false;

const filterProducts = (query: string): DBProductItem[] => {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return props.products;
	return props.products.filter((product) => [
		product.nickname,
		product.fullName,
		product.productCode,
		product.spec,
		product.brand,
	].some((value) => value?.toLowerCase().includes(normalized)));
};

const syncSelectedProduct = (selectedKey: string) => {
	if (!selectedKey) {
		if (preserveQueryOnModelClear) {
			preserveQueryOnModelClear = false;
			return;
		}
		searchQuery.value = '';
		return;
	}
	const product = props.products.find((item) => getProductSelectionKey(item) === selectedKey);
	searchQuery.value = product?.nickname || '';
};

watch(() => props.modelValue, syncSelectedProduct, { immediate: true });

const openDropdown = () => {
	matchedProducts.value = filterProducts(searchQuery.value);
	dropdownVisible.value = true;
};

const handleInput = (event: Event) => {
	searchQuery.value = (event.target as HTMLInputElement).value;
	if (props.modelValue) {
		preserveQueryOnModelClear = true;
		emit('update:modelValue', '');
	}
	matchedProducts.value = filterProducts(searchQuery.value);
	dropdownVisible.value = true;
};

const selectProduct = (product: DBProductItem) => {
	searchQuery.value = product.nickname;
	dropdownVisible.value = false;
	emit('update:modelValue', getProductSelectionKey(product));
};

const closeOnOutsideClick = (event: MouseEvent) => {
	if (!searchRoot.value?.contains(event.target as Node)) dropdownVisible.value = false;
};

onMounted(() => document.addEventListener('click', closeOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick));
</script>

<style scoped>
.product-search-picker { position: relative; min-width: 0; }
.product-search-input {
	width: 100%;
	height: 32px;
	padding: 0 11px;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	background: #fff;
	color: #0f172a;
	font-size: 13px;
	outline: none;
}
.product-search-input:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.product-search-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	z-index: 200;
	max-height: 200px;
	overflow-y: auto;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	background: #fff;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.product-option-header,
.product-option-row {
	display: grid;
	grid-template-columns: minmax(96px, .9fr) minmax(150px, 1.5fr) minmax(110px, .9fr) minmax(100px, .9fr);
	column-gap: 10px;
	align-items: center;
}
.product-option-header {
	position: sticky;
	top: 0;
	z-index: 1;
	padding: 7px 12px;
	border-bottom: 1px solid #cbd5e1;
	background: #f8fafc;
	color: #475569;
	font-size: 11px;
	font-weight: 600;
}
.product-option-row {
	padding: 8px 12px;
	border-bottom: 1px solid #f1f5f9;
	color: #64748b;
	font-size: 11px;
	cursor: pointer;
}
.product-option-row:hover { background: #f1f5f9; }
.product-option-row > div { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-option-name { color: #0f172a; font-size: 13px; font-weight: 600; }
.product-search-empty {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	z-index: 200;
	padding: 8px 12px;
	border: 1px solid #f59e0b;
	border-radius: 6px;
	background: #fffbeb;
	color: #92400e;
	font-size: 13px;
}
</style>
