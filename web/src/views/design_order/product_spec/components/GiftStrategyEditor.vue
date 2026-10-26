<template>
	<div class="gift-strategy-editor">
		<div class="gift-editor-toolbar">
			<div class="gift-editor-title">赠品 <el-tag size="small" type="success" effect="plain">非阶梯</el-tag></div>
		</div>

		<el-empty v-if="!modelValue.length" description="暂无赠品策略" :image-size="56" />

		<div v-for="strategy in modelValue" :key="strategy.id" class="gift-strategy-card">
			<div class="gift-strategy-head">
				<label class="strategy-field">
					<span>策略名称</span>
					<el-input
						:model-value="strategy.name"
						placeholder="例如：直播间下单加赠"
						@update:model-value="updateStrategyField(strategy.id, 'name', $event)"
					/>
				</label>
				<label class="strategy-field">
					<span>策略价值</span>
					<el-input
						:model-value="strategy.value"
						placeholder="填写赠品总价值"
						@update:model-value="updateStrategyField(strategy.id, 'value', $event)"
					/>
				</label>
				<el-button type="danger" text :icon="Delete" @click="removeStrategy(strategy.id)">移除策略</el-button>
			</div>

			<div v-if="strategy.items.length" class="gift-item-list">
				<div v-for="(item, itemIndex) in strategy.items" :key="item.id" class="gift-item-row">
					<span class="gift-item-index">{{ itemIndex + 1 }}</span>
					<div class="gift-item-name"><small>赠品商品</small><strong>{{ item.nickname }}</strong></div>
					<div class="gift-item-meta"><small>品牌</small><span>{{ item.brand || '-' }}</span></div>
					<label class="gift-item-input">
						<span>赠品规格</span>
						<el-input
							:model-value="item.spec"
							@update:model-value="updateItemField(strategy.id, item.id, 'spec', $event)"
						/>
					</label>
					<label class="gift-item-input quantity-field">
						<span>数量</span>
						<div>
							<el-input-number
								:model-value="item.qty"
								:min="1"
								controls-position="right"
								@update:model-value="updateItemField(strategy.id, item.id, 'qty', $event || 1)"
							/>
							<el-input
								:model-value="item.unit"
								@update:model-value="updateItemField(strategy.id, item.id, 'unit', $event)"
							/>
						</div>
					</label>
					<div class="gift-item-meta"><small>零售价</small><span>{{ formatPrice(item.retailPrice) }}</span></div>
					<el-button
						type="danger"
						text
						:icon="Close"
						aria-label="移除赠品"
						@click="removeGift(strategy.id, item.id)"
					/>
				</div>
			</div>

			<div class="gift-add-row">
				<ProductSearchPicker
					v-model="selectedProductKeys[strategy.id]"
					:products="products"
				/>
				<el-button :icon="Plus" @click="addGift(strategy.id)">添加赠品</el-button>
			</div>
		</div>

		<button type="button" class="gift-add-strategy" @click="addStrategy">
			<el-icon><Plus /></el-icon> 添加策略
		</button>
	</div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { Close, Delete, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { getProductSelectionKey } from '../productSearch';
import type { DBProductItem } from '../types';
import ProductSearchPicker from './ProductSearchPicker.vue';
import {
	calculateGiftStrategyValue,
	createGiftStrategy,
	createGiftStrategyItem,
	type GiftStrategy,
	type GiftStrategyItem,
} from '../giftStrategies';

const props = defineProps<{
	modelValue: GiftStrategy[];
	products: DBProductItem[];
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', value: GiftStrategy[]): void;
}>();

const selectedProductKeys = reactive<Record<string, string>>({});
const formatPrice = (price: string): string => price ? `${price} 元` : '待同步';

const addStrategy = () => emit('update:modelValue', [...props.modelValue, createGiftStrategy()]);

const removeStrategy = (strategyId: string) => {
	emit('update:modelValue', props.modelValue.filter((strategy) => strategy.id !== strategyId));
	delete selectedProductKeys[strategyId];
};

const updateStrategyField = (strategyId: string, field: 'name' | 'value', value: string) => {
	emit('update:modelValue', props.modelValue.map((strategy) =>
		strategy.id === strategyId ? { ...strategy, [field]: value } : strategy));
};

const updateItemsWithDefaultValue = (
	strategy: GiftStrategy,
	items: GiftStrategyItem[],
): GiftStrategy => {
	const previousDefault = calculateGiftStrategyValue(strategy);
	const nextStrategy = { ...strategy, items };
	if (strategy.value && strategy.value !== previousDefault) return nextStrategy;
	return { ...nextStrategy, value: calculateGiftStrategyValue(nextStrategy) };
};

const updateItemField = (
	strategyId: string,
	itemId: string,
	field: keyof Pick<GiftStrategyItem, 'spec' | 'qty' | 'unit'>,
	value: string | number,
) => {
	emit('update:modelValue', props.modelValue.map((strategy) => {
		if (strategy.id !== strategyId) return strategy;
		const items = strategy.items.map((item) =>
			item.id === itemId ? { ...item, [field]: value } : item);
		return updateItemsWithDefaultValue(strategy, items);
	}));
};

const addGift = (strategyId: string) => {
	const selectedKey = selectedProductKeys[strategyId];
	const product = props.products.find((item) => getProductSelectionKey(item) === selectedKey);
	if (!product) {
		ElMessage.warning('请先选择赠品商品');
		return;
	}
	emit('update:modelValue', props.modelValue.map((strategy) => strategy.id === strategyId
		? updateItemsWithDefaultValue(strategy, [...strategy.items, createGiftStrategyItem(product)])
		: strategy));
	selectedProductKeys[strategyId] = '';
};

const removeGift = (strategyId: string, itemId: string) => {
	emit('update:modelValue', props.modelValue.map((strategy) => strategy.id === strategyId
		? updateItemsWithDefaultValue(
			strategy,
			strategy.items.filter((item) => item.id !== itemId),
		)
		: strategy));
};
</script>

<style scoped>
.gift-strategy-editor { display: flex; flex-direction: column; gap: 12px; }
.gift-editor-toolbar { display: flex; align-items: center; }
.gift-editor-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #1f2937; }
.gift-strategy-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 18px 14px; background: #f8fafc; }
.gift-strategy-card + .gift-strategy-card { margin-top: 16px; }
.gift-strategy-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 12px; align-items: end; }
.strategy-field, .gift-item-input { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.strategy-field > span, .gift-item-input > span, small { font-size: 11px; color: #64748b; }
.strategy-field > span, .strategy-field :deep(.el-input__inner) { font-size: 13px; }
.gift-item-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.gift-item-row { display: grid; grid-template-columns: 28px minmax(0, 1.3fr) minmax(0, .7fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, .7fr) 32px; gap: 10px; align-items: end; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
.gift-item-index { align-self: center; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #e0e7ff; color: #3730a3; font-size: 12px; font-weight: 700; }
.gift-item-name, .gift-item-meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.gift-item-name strong, .gift-item-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.quantity-field > div { display: grid; grid-template-columns: minmax(96px, 1fr) 64px; gap: 6px; }
.quantity-field :deep(.el-input-number) { width: 100%; }
.gift-add-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.gift-add-strategy { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; color: #64748b; font-size: 12px; font-weight: 500; background: #fff; border: 1px dashed #cbd5e1; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
.gift-add-strategy:hover { color: #4f46e5; background: #f5f3ff; border-color: #4f46e5; }
@media (max-width: 900px) {
	.gift-strategy-head { grid-template-columns: 1fr; }
	.gift-item-row { grid-template-columns: 28px minmax(0, 1fr); }
	.gift-item-row > *:not(.gift-item-index) { grid-column: 2; }
}
</style>
