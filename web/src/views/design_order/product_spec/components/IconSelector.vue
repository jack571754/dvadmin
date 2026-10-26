<template>
	<section class="icon-selector" data-field-key="icon" tabindex="-1">
		<div class="icon-selector__label">{{ props.label }}</div>
		<div class="icon-selector__value">
			<el-select
				:model-value="selectedIds"
				multiple
				filterable
				collapse-tags
				collapse-tags-tooltip
				:disabled="!props.editable || props.masked"
				placeholder="选择 Icon（仅含主商品适用与品牌全部适用）"
				class="icon-selector__select"
				@change="handleChange"
			>
				<el-option
					v-for="option in mergedOptions"
					:key="option.id"
					:value="option.id"
					:label="option.shortName"
				>
					<span class="icon-selector__option">
						<el-checkbox
							:model-value="selectedIds.includes(option.id)"
							class="icon-selector__checkbox"
							@click.stop
							@change="toggleOption(option.id)"
						/>
						<span class="icon-selector__option-name">{{ option.shortName }}</span>
						<span class="icon-selector__option-scope">{{ scopeLabel(option) }}</span>
					</span>
				</el-option>
			</el-select>

			<div v-if="props.masked" class="icon-selector__hint">无该字段查询权限，内容保持原样</div>
			<div v-else-if="props.loading" class="icon-selector__hint">正在解析可选 Icon...</div>
			<div v-else-if="!props.options.length" class="icon-selector__hint">
				当前主商品没有可用 Icon，请先在 Icon 库维护
			</div>

			<div v-if="props.modelValue.length" class="icon-selector__preview">
				<figure v-for="(ref, index) in props.modelValue" :key="ref.id" class="icon-selector__card">
					<el-image
						v-if="imageUrlOf(ref.id)"
						:src="imageUrlOf(ref.id)"
						:preview-src-list="previewList"
						:initial-index="previewIndexOf(ref.id)"
						preview-teleported
						fit="contain"
						class="icon-selector__image"
					/>
					<div v-else class="icon-selector__image icon-selector__image--empty">无图</div>
					<figcaption class="icon-selector__caption">
						<span v-if="footnoteNumber(index) !== undefined" class="icon-selector__number">
							[{{ footnoteNumber(index) }}]
						</span>
						<span class="icon-selector__name" :title="ref.shortName">{{ ref.shortName }}</span>
					</figcaption>
				</figure>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { hasIconFootnote, orderIconRefs, type IconOption, type IconRef } from '../iconRefs';

const props = defineProps<{
	modelValue: IconRef[];
	options: IconOption[];
	label: string;
	startNumber: number;
	editable: boolean;
	loading?: boolean;
	masked?: boolean;
}>();

const emit = defineEmits<{ (event: 'update:modelValue', value: IconRef[]): void }>();

const selectedIds = computed(() => props.modelValue.map((ref) => ref.id));
const footnoteNumber = (index: number): number | undefined => {
	if (!hasIconFootnote(props.modelValue[index])) return undefined;
	const precedingCount = props.modelValue.slice(0, index).filter(hasIconFootnote).length;
	return props.startNumber + precedingCount;
};

/** 已选但不在候选集里的 Icon（改过主商品或 Icon 库停用）仍要显示，避免静默丢数据。 */
const mergedOptions = computed<IconOption[]>(() => {
	const known = new Set(props.options.map((option) => option.id));
	const orphans = props.modelValue
		.filter((ref) => !known.has(ref.id))
		.map((ref) => ({ ...ref, shortName: `${ref.shortName}（已失效）`, scopeType: '', imageUrl: '' }));
	return [...props.options, ...orphans];
});

const optionMap = computed(() => new Map(mergedOptions.value.map((item) => [item.id, item])));

const imageUrlOf = (id: number): string => optionMap.value.get(id)?.imageUrl || '';

const previewList = computed(() => props.modelValue
	.map((ref) => imageUrlOf(ref.id))
	.filter(Boolean));

const previewIndexOf = (id: number): number => previewList.value.indexOf(imageUrlOf(id));

const scopeLabel = (option: IconOption): string => {
	if (option.scopeType === 'all') return '品牌全部适用';
	if (option.scopeType === 'selected') return '本商品适用';
	return '已失效';
};

const handleChange = (ids: number[]) => {
	const picked = ids
		.map((id) => optionMap.value.get(id))
		.filter((option): option is IconOption => Boolean(option))
		.map((option) => ({
			id: option.id,
			shortName: option.shortName.replace('（已失效）', ''),
			interpretation: option.interpretation,
			fileId: option.fileId,
		}));
	emit('update:modelValue', orderIconRefs(picked, mergedOptions.value));
};

/** 勾选框切换选中：在现有 id 列表上加减，再走 handleChange 统一排序。 */
const toggleOption = (id: number) => {
	const current = selectedIds.value;
	const next = current.includes(id)
		? current.filter((existing) => existing !== id)
		: [...current, id];
	handleChange(next);
};
</script>

<style scoped>
.icon-selector {
	display: grid;
	grid-template-columns: 140px minmax(0, 1fr);
	gap: 16px;
	align-items: start;
	padding: 6px 0;
	border-bottom: 1px solid #f1f5f9;
}
.icon-selector__label {
	font-size: 13px;
	font-weight: 500;
	line-height: 1.4;
	color: #475569;
	padding-top: 3px;
}
.icon-selector__value {
	min-width: 0;
	font-size: 13px;
	color: #0f172a;
}
.icon-selector__hint {
	margin-top: 6px;
	color: #94a3b8;
	font-size: 12px;
}
.icon-selector__select {
	width: 100%;
}
.icon-selector__option {
	display: flex;
	align-items: center;
	gap: 8px;
}
.icon-selector__checkbox {
	flex: none;
	margin-right: 0;
	height: auto;
}
.icon-selector__option-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.icon-selector__option-scope {
	color: #94a3b8;
	font-size: 12px;
	flex: none;
}
.icon-selector__preview {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin: 12px 0 0;
}
.icon-selector__card {
	width: 108px;
	margin: 0;
	border: 1px solid #d7e0ec;
	border-radius: 6px;
	overflow: hidden;
	background: #fbfdff;
}
.icon-selector__image {
	display: block;
	width: 100%;
	height: 88px;
	background: #fff;
}
.icon-selector__image--empty {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #b6c2d2;
	font-size: 12px;
}
.icon-selector__caption {
	display: flex;
	align-items: baseline;
	gap: 4px;
	padding: 5px 6px;
	border-top: 1px solid #e2e8f0;
	font-size: 12px;
}
.icon-selector__number {
	color: #405777;
}
.icon-selector__name {
	color: #1e293b;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
