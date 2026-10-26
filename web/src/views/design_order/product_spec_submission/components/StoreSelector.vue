<template>
	<el-select
		:model-value="modelValue"
		clearable
		filterable
		remote
		remote-show-suffix
		:loading="loading"
		:placeholder="placeholder"
		:remote-method="searchStores"
		@visible-change="handleVisibleChange"
		@update:model-value="updateValue"
	>
		<el-option
			v-for="store in stores"
			:key="store.id"
			:label="store.store_name"
			:value="store.store_name"
		>
			<span>{{ store.store_name }}</span>
			<span class="store-code">{{ store.store_code }}</span>
		</el-option>
	</el-select>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { GetList } from '/@/api/design_order/store';

const STORE_PAGE_LIMIT = 50;

interface StoreOption {
	id: number;
	store_code: string;
	store_name: string;
}

const props = withDefaults(defineProps<{
	modelValue?: string;
	platform?: string;
	placeholder?: string;
}>(), {
	modelValue: '',
	platform: '',
	placeholder: '搜索并选择店铺',
});

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void;
}>();

const loading = ref(false);
const stores = ref<StoreOption[]>([]);

const loadStores = async (search = '') => {
	loading.value = true;
	try {
		const result: any = await GetList({
			page: 1,
			limit: STORE_PAGE_LIMIT,
			search: search || undefined,
			status: true,
			platform: props.platform || undefined,
		});
		stores.value = result.data || [];
	} finally {
		loading.value = false;
	}
};

const searchStores = (search: string) => loadStores(search);

const handleVisibleChange = (visible: boolean) => {
	if (visible) loadStores();
};

const updateValue = (value: string) => emit('update:modelValue', value);

watch(() => props.platform, () => {
	if (props.modelValue) emit('update:modelValue', '');
	loadStores();
});

onMounted(() => loadStores());
</script>

<style scoped>
.store-code {
	float: right;
	color: var(--el-text-color-secondary);
	font-size: 12px;
}
</style>
