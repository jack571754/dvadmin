<template>
	<section class="efficacy-editor" data-field-key="efficacy" tabindex="-1">
		<header class="efficacy-editor__header">
			<span class="efficacy-editor__title">{{ props.label }}</span>
			<el-button v-if="props.editable" size="small" :icon="Plus" @click="addItem">新增功效</el-button>
		</header>

		<div v-if="props.modelValue.length" class="efficacy-editor__list">
			<div v-for="(item, index) in props.modelValue" :key="item.id" class="efficacy-editor__item">
				<strong v-if="footnoteNumber(index) !== undefined" class="efficacy-editor__number">
					[{{ footnoteNumber(index) }}]
				</strong>
				<span v-else></span>
				<label class="efficacy-editor__field">
					<span>功效</span>
					<textarea
						:value="item.name"
						:readonly="!props.editable"
						rows="2"
						placeholder="请输入功效"
						@input="updateItem(index, 'name', $event)"
					/>
				</label>
				<label class="efficacy-editor__field">
					<span>功效释义</span>
					<textarea
						:value="item.definition"
						:readonly="!props.editable"
						rows="2"
						placeholder="该释义会写入运营备注说明"
						@input="updateItem(index, 'definition', $event)"
					/>
				</label>
				<el-button v-if="props.editable" link type="danger" @click="removeItem(index)">移出</el-button>
			</div>
		</div>
		<div v-else class="efficacy-editor__empty">暂无主打功效</div>

		<div class="efficacy-assistant">
			<header class="efficacy-assistant__header">
				<span>产品档案功效辅助信息</span>
				<div class="efficacy-assistant__actions">
					<el-button size="small" :disabled="!props.assistantText" @click="emit('copy-assistant')">复制</el-button>
					<el-button size="small" @click="assistantCollapsed = !assistantCollapsed">
						{{ assistantCollapsed ? '展开' : '收起' }}
					</el-button>
				</div>
			</header>
			<textarea
				v-if="!assistantCollapsed"
				class="efficacy-assistant__content"
				:value="props.assistantText"
				readonly
				rows="3"
				placeholder="选择产品后自动带出档案功效信息"
			/>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import {
	createEmptyEfficacyItem,
	hasEfficacyFootnote,
	type EfficacyItem,
} from '../efficacyItems';

const props = defineProps<{
	modelValue: EfficacyItem[];
	label: string;
	startNumber: number;
	assistantText: string;
	editable: boolean;
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', value: EfficacyItem[]): void;
	(event: 'copy-assistant'): void;
}>();

const assistantCollapsed = ref(false);
const footnoteNumber = (index: number): number | undefined => {
	if (!hasEfficacyFootnote(props.modelValue[index])) return undefined;
	const precedingCount = props.modelValue.slice(0, index).filter(hasEfficacyFootnote).length;
	return props.startNumber + precedingCount;
};
const addItem = () => emit('update:modelValue', [...props.modelValue, createEmptyEfficacyItem()]);
const removeItem = (index: number) => emit(
	'update:modelValue',
	props.modelValue.filter((_, itemIndex) => itemIndex !== index),
);
const updateItem = (
	index: number,
	key: 'name' | 'definition',
	event: Event,
) => {
	const value = (event.target as HTMLTextAreaElement).value;
	emit('update:modelValue', props.modelValue.map((item, itemIndex) => (
		itemIndex === index ? { ...item, [key]: value } : item
	)));
};
</script>

<style scoped>
.efficacy-editor {
	padding: 12px 16px;
	border: 1px solid #d7e0ec;
	border-radius: 6px;
	background: #fff;
}
.efficacy-editor__header,
.efficacy-assistant__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}
.efficacy-editor__title,
.efficacy-assistant__header > span {
	font-size: 13px;
	font-weight: 600;
	color: #334155;
}
.efficacy-editor__list { margin-top: 10px; }
.efficacy-editor__item {
	display: grid;
	grid-template-columns: 34px minmax(180px, .8fr) minmax(260px, 1.2fr) 44px;
	gap: 10px;
	align-items: start;
	padding: 10px 12px;
	border: 1px solid #d7e0ec;
	border-radius: 6px;
	background: #fbfdff;
}
.efficacy-editor__item + .efficacy-editor__item { margin-top: 10px; }
.efficacy-editor__number { padding-top: 24px; color: #405777; font-size: 13px; }
.efficacy-editor__field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.efficacy-editor__field > span { color: #64748b; font-size: 12px; }
.efficacy-editor__field textarea,
.efficacy-assistant__content {
	width: 100%;
	box-sizing: border-box;
	resize: vertical;
	padding: 8px 10px;
	border: 1px solid #cbd5e1;
	border-radius: 5px;
	background: #fff;
	color: #1e293b;
	font: inherit;
	line-height: 1.5;
}
.efficacy-editor__field textarea:focus { border-color: #409eff; outline: none; }
.efficacy-editor__empty { padding: 16px 0 6px; color: #94a3b8; font-size: 12px; text-align: center; }
.efficacy-assistant { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.efficacy-assistant__actions { display: flex; gap: 6px; }
.efficacy-assistant__content { margin-top: 8px; min-height: 78px; background: #f8fafc; }
@media (max-width: 760px) {
	.efficacy-editor__item { grid-template-columns: 30px minmax(0, 1fr); }
	.efficacy-editor__item > :nth-child(3) { grid-column: 2; }
	.efficacy-editor__item > :last-child { grid-column: 2; justify-self: end; }
}
</style>
