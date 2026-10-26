<template>
	<section class="target-section">
		<header class="target-header">
			<span class="target-title">1. 应用范围</span>
			<el-radio-group :model-value="scope" @update:model-value="handleScopeChange">
				<el-radio value="all">全部商品（{{ targetIndexes.length }}）</el-radio>
				<el-radio value="partial">部分商品</el-radio>
			</el-radio-group>
		</header>
		<div v-if="scope === 'partial'" class="target-panel">
			<header class="target-selection-header">
				<span>已选 {{ selectedIndexes.length }} / {{ targetIndexes.length }}</span>
				<div>
					<el-button link type="primary" size="small" @click="emit('select-all')">全选</el-button>
					<el-button link size="small" @click="emit('clear')">清空选择</el-button>
				</div>
			</header>
			<div class="target-grid">
				<el-checkbox
					v-for="targetIndex in targetIndexes"
					:key="targetIndex"
					:model-value="selectedIndexes.includes(targetIndex)"
					@change="handleTargetToggle(targetIndex, $event)"
				>
					商品 {{ targetIndex + 1 }}
				</el-checkbox>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
type ApplyScope = 'all' | 'partial';

const _props = defineProps<{
	scope: ApplyScope;
	targetIndexes: number[];
	selectedIndexes: number[];
}>();

const emit = defineEmits<{
	(event: 'update:scope', value: ApplyScope): void;
	(event: 'toggle-target', targetIndex: number, checked: boolean): void;
	(event: 'select-all'): void;
	(event: 'clear'): void;
}>();

const handleScopeChange = (value: string | number | boolean | undefined) => {
	emit('update:scope', value as ApplyScope);
};

const handleTargetToggle = (targetIndex: number, value: unknown) => {
	emit('toggle-target', targetIndex, Boolean(value));
};
</script>

<style scoped>
.target-header,
.target-selection-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.target-title {
	font-size: 14px;
	font-weight: 600;
}

.target-panel {
	margin-top: 10px;
	padding: 10px 12px;
	border-radius: 4px;
	background: var(--el-fill-color-light);
}

.target-selection-header {
	margin-bottom: 8px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.target-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 6px 12px;
	max-height: 130px;
	overflow-y: auto;
}
</style>