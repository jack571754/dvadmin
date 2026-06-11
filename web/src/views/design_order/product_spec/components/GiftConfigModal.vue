<template>
	<el-dialog v-model="visible" title="配置标配赠品" width="540px" :close-on-click-modal="false" @close="handleClose">
		<div class="gift-body">
			<div v-for="(gift, index) in localGiftList" :key="index" class="gift-row">
				<span class="gift-row-index">{{ index + 1 }}</span>
				<el-select v-model="gift.name" placeholder="-- 请选择赠品 --" style="flex: 2.5" clearable>
					<el-option v-for="prod in productNames" :key="prod" :label="prod" :value="prod" />
				</el-select>
				<el-input v-model="gift.qty" placeholder="数量 (如: 1片 / 2盒)" style="flex: 1" />
				<el-button type="danger" :icon="Delete" circle size="small" @click="localGiftList.splice(index, 1)" />
			</div>
		</div>
		<el-button class="gift-add-btn" @click="localGiftList.push({ name: '', qty: '' })">
			<span>＋</span> 添加新赠品
		</el-button>
		<template #footer>
			<el-button @click="handleClose">取消</el-button>
			<el-button type="primary" @click="handleConfirm">✓ 确定保存</el-button>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { GiftInfo } from '../types';

const props = defineProps<{
	modelValue: boolean;
	gifts: GiftInfo[];
	productNames: string[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', val: boolean): void;
	(e: 'confirm', gifts: GiftInfo[]): void;
}>();

const visible = ref(props.modelValue);
const localGiftList = ref<GiftInfo[]>([]);

watch(() => props.modelValue, (newVal) => {
	visible.value = newVal;
});

watch(() => visible.value, (newVal) => {
	emit('update:modelValue', newVal);
});

watch(() => props.gifts, (newGifts) => {
	localGiftList.value = newGifts.length > 0 ? newGifts.map(g => ({ ...g })) : [{ name: '', qty: '' }];
}, { immediate: true, deep: true });

const handleClose = () => {
	visible.value = false;
};

const handleConfirm = () => {
	emit('confirm', localGiftList.value);
};
</script>

<style scoped>
.gift-body {
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: 340px;
	overflow-y: auto;
}

.gift-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 14px;
	background: #f9fafb;
	border: 1px solid #f3f4f6;
	border-radius: 14px;
}

.gift-row-index {
	width: 24px;
	height: 24px;
	border-radius: 8px;
	background: linear-gradient(135deg, #4e6ef2, #7c3aed);
	color: white;
	font-size: 11px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.gift-add-btn {
	width: 100%;
	padding: 10px;
	border: 2px dashed #e5e7eb;
	background: transparent;
	border-radius: 14px;
	font-size: 13px;
	font-weight: 600;
	color: #6b7280;
	cursor: pointer;
	margin-top: 8px;
}

.gift-add-btn:hover {
	border-color: #4e6ef2;
	color: #4e6ef2;
	background: #f5f7ff;
}
</style>
