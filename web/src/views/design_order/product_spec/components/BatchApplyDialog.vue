<template>
	<el-dialog
		:model-value="modelValue"
		title="批量应用"
		width="760px"
		:close-on-click-modal="false"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<div class="batch-apply-body">
			<el-alert
				:title="sourceSummary"
				type="info"
				:closable="false"
				show-icon
			/>

			<BatchApplyTargetSelector
				:scope="applyScope"
				:target-indexes="targetIndexes"
				:selected-indexes="selectedTargetIndexes"
				@update:scope="applyScope = $event"
				@toggle-target="toggleTarget"
				@select-all="selectAllTargets"
				@clear="clearTargetSelection"
			/>

			<section class="batch-apply-section">
				<header class="batch-apply-header">
					<span class="batch-apply-title">
						2. 选择字段（已选 {{ selectedFieldKeys.length }} / {{ fields.length }}）
					</span>
					<div class="batch-apply-actions">
						<el-button link type="primary" size="small" @click="selectAllFields">全选</el-button>
						<el-button link size="small" @click="clearSelectedFields">清空选择</el-button>
					</div>
				</header>
				<p class="batch-apply-hint">产品昵称、官方全称和运营备注说明不支持批量覆盖</p>
				<div v-if="!fields.length" class="batch-apply-empty">当前模板没有可批量应用的字段</div>
				<div v-else class="batch-apply-fields">
					<div v-for="field in fields" :key="field.key" class="batch-apply-field">
						<el-checkbox
							:model-value="selectedFieldKeys.includes(field.key)"
							@change="toggleField(field.key, $event as boolean)"
						>
							{{ field.label }}<span v-if="field.required" class="batch-apply-required">*</span>
						</el-checkbox>
						<el-select
							v-model="fieldActions[field.key]"
							:disabled="!selectedFieldKeys.includes(field.key)"
						>
							<el-option label="统一填写" value="fill" />
							<el-option label="清空字段" value="clear" :disabled="field.required" />
						</el-select>
						<div class="batch-apply-field-input">
							<span
								v-if="fieldActions[field.key] === 'clear'"
								class="batch-apply-clear-preview"
							>
								将清空应用范围内商品的现有内容
							</span>
							<el-date-picker
								v-else-if="field.kind === 'dateRange'"
								v-model="dateRangeDrafts[field.key]"
								type="datetimerange"
								range-separator="~"
								start-placeholder="开始时间"
								end-placeholder="结束时间"
								format="YYYY-MM-DD HH:mm"
								value-format="YYYY-MM-DD HH:mm"
								:disabled="!selectedFieldKeys.includes(field.key)"
								style="width: 100%"
							/>
							<el-input
								v-else-if="field.kind === 'price'"
								v-model="valueDrafts[field.key]"
								type="number"
								:min="0"
								placeholder="统一价格"
								:disabled="!selectedFieldKeys.includes(field.key)"
							/>
							<el-input
								v-else
								v-model="valueDrafts[field.key]"
								:type="field.kind === 'longtext' ? 'textarea' : 'text'"
								:rows="field.kind === 'longtext' ? 2 : undefined"
								:placeholder="`统一填写${field.label}`"
								:disabled="!selectedFieldKeys.includes(field.key)"
							/>
						</div>
					</div>
				</div>
			</section>

			<p v-if="validationMessage" class="batch-apply-validation">{{ validationMessage }}</p>

			<section v-if="summaryItems.length" class="batch-apply-summary">
				<header class="batch-apply-summary-header">
					<span class="batch-apply-title">3. 确认变更</span>
					<span>预计修改 {{ estimatedCellCount }} 个单元格</span>
				</header>
				<div v-for="item in summaryItems" :key="item.key" class="batch-apply-summary-item">
					<span class="batch-apply-summary-label">{{ item.label }}</span>
					<span :class="{ 'is-clear': item.isClear }">{{ item.value }}</span>
				</div>
			</section>
		</div>

		<template #footer>
			<el-button @click="emit('update:modelValue', false)">取消</el-button>
			<el-button type="primary" :disabled="!canSubmit" @click="handleConfirm">
				{{ applyButtonText }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import type { BatchApplyField } from '../batchApply';
import BatchApplyTargetSelector from './BatchApplyTargetSelector.vue';
import { useBatchApplyDialog } from './useBatchApplyDialog';

interface DialogProps {
	modelValue: boolean;
	fields: BatchApplyField[];
	targetIndexes: number[];
	sourceLabel: string;
	initialValues?: Record<string, string>;
}

const props = defineProps<DialogProps>();
const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void;
	(event: 'apply', payload: {
		fieldKeys: string[];
		values: Record<string, string>;
		targetIndexes: number[];
	}): void;
}>();

const {
	applyButtonText,
	applyScope,
	canSubmit,
	clearSelectedFields,
	clearTargetSelection,
	dateRangeDrafts,
	estimatedCellCount,
	fieldActions,
	handleConfirm,
	selectAllFields,
	selectAllTargets,
	selectedFieldKeys,
	selectedTargetIndexes,
	sourceSummary,
	summaryItems,
	toggleField,
	toggleTarget,
	validationMessage,
	valueDrafts,
} = useBatchApplyDialog(props, emit);
</script>

<style scoped>
.batch-apply-body {
	display: flex;
	flex-direction: column;
	gap: 18px;
}

.batch-apply-header,
.batch-apply-summary-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 10px;
}

.batch-apply-title {
	font-weight: 600;
	font-size: 14px;
}

.batch-apply-hint,
.batch-apply-empty {
	margin: 0 0 10px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.batch-apply-fields {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.batch-apply-field {
	display: grid;
	grid-template-columns: 150px 110px minmax(0, 1fr);
	align-items: start;
	gap: 12px;
}

.batch-apply-field-input {
	min-width: 0;
}

.batch-apply-clear-preview {
	display: flex;
	align-items: center;
	min-height: 32px;
	padding: 0 10px;
	border-radius: 4px;
	background: var(--el-color-warning-light-9);
	color: var(--el-color-warning-dark-2);
	font-size: 12px;
}

.batch-apply-required,
.batch-apply-validation,
.batch-apply-summary-item .is-clear {
	color: var(--el-color-danger);
}

.batch-apply-validation {
	margin: 0;
	padding: 8px 12px;
	border-radius: 4px;
	background: var(--el-color-danger-light-9);
	font-size: 12px;
}

.batch-apply-summary {
	padding: 10px 12px;
	border-radius: 4px;
	background: var(--el-fill-color-light);
	font-size: 12px;
	color: var(--el-text-color-regular);
}

.batch-apply-summary-header {
	margin-bottom: 8px;
}

.batch-apply-summary-item {
	display: grid;
	grid-template-columns: 140px minmax(0, 1fr);
	gap: 12px;
	padding: 4px 0;
}

.batch-apply-summary-label {
	font-weight: 600;
}
</style>