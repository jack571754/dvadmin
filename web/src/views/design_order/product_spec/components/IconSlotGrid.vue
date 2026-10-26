<template>
	<div class="icon-slot-grid">
		<div
			v-for="(slot, index) in fixedSlots"
			:key="slot?.iconId ?? `empty-${index}`"
			class="icon-slot"
			:class="{ 'is-empty': !slot }"
		>
			<template v-if="slot">
				<button
					v-if="slot.imageUrl"
					type="button"
					class="icon-image-frame is-clickable"
					:aria-label="`放大查看 ${slot.label}`"
					@pointerdown.stop
					@mousedown.stop
					@click.stop="openPreview(slot)"
					@dblclick.stop
				>
					<img
						:src="slot.imageUrl"
						:alt="slot.label"
						class="icon-image"
						draggable="false"
						@dragstart.prevent
					/>
				</button>
				<div v-else class="icon-image-frame">
					<span class="icon-image-missing">无图</span>
				</div>
				<div class="icon-short-name" :title="slot.label">{{ slot.label }}</div>
			</template>
		</div>
	</div>
	<Teleport to="body">
		<div
			v-if="previewSlot"
			class="icon-preview-overlay"
			role="dialog"
			aria-modal="true"
			:aria-label="`${previewSlot.label}图片预览`"
			@click.self="closePreview"
		>
			<button type="button" class="icon-preview-close" aria-label="关闭图片预览" @click="closePreview">
				×
			</button>
			<div class="icon-preview-content">
				<img
					:src="previewSlot.imageUrl"
					:alt="previewSlot.label"
					class="icon-preview-image"
					draggable="false"
					@dragstart.prevent
				/>
				<div class="icon-preview-label">{{ previewSlot.label }}</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface IconSlotView {
	iconId: number;
	label: string;
	imageUrl: string;
}

const SLOT_COUNT = 5;
const props = defineProps<{
	data?: {
		slots?: IconSlotView[];
	};
}>();

const fixedSlots = computed<Array<IconSlotView | null>>(() => (
	Array.from({ length: SLOT_COUNT }, (_, index) => props.data?.slots?.[index] || null)
));

const previewSlot = ref<IconSlotView | null>(null);

const openPreview = (slot: IconSlotView): void => {
	if (!slot.imageUrl) return;
	previewSlot.value = slot;
};

const closePreview = (): void => {
	previewSlot.value = null;
};
</script>

<style scoped>
.icon-slot-grid {
	position: absolute;
	inset: 0;
	width: 100%;
	box-sizing: border-box;
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 4px;
	padding: 10px 5px 8px;
	background: #fff;
	pointer-events: none;
	overflow: hidden;
}

.icon-slot {
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	gap: 4px;
}

.icon-slot.is-empty {
	visibility: hidden;
}

.icon-image-frame {
	width: min(44px, calc(100% - 2px));
	aspect-ratio: 1;
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	overflow: hidden;
	border: 1px solid #dbe3ee;
	border-radius: 5px;
	background: #f8fafc;
	padding: 0;
	cursor: default;
	pointer-events: none;
}

.icon-image-frame.is-clickable {
	cursor: zoom-in;
	pointer-events: auto;
}

.icon-image {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: contain;
	user-select: none;
}

.icon-image-missing {
	color: #94a3b8;
	font-size: 10px;
	line-height: 1;
}

.icon-short-name {
	width: 100%;
	max-height: 28px;
	overflow: hidden;
	color: #334155;
	font-size: 10px;
	font-weight: 500;
	line-height: 14px;
	text-align: left;
	word-break: break-all;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.icon-preview-overlay {
	position: fixed;
	inset: 0;
	z-index: 30000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
	background: rgb(15 23 42 / 82%);
	pointer-events: auto;
}

.icon-preview-content {
	display: flex;
	max-width: 90vw;
	max-height: 90vh;
	flex-direction: column;
	align-items: center;
	gap: 14px;
}

.icon-preview-image {
	max-width: 86vw;
	max-height: 80vh;
	object-fit: contain;
	border-radius: 8px;
	background: #fff;
	box-shadow: 0 20px 60px rgb(0 0 0 / 35%);
	user-select: none;
}

.icon-preview-label {
	color: #fff;
	font-size: 15px;
	line-height: 22px;
	text-align: center;
}

.icon-preview-close {
	position: fixed;
	top: 22px;
	right: 28px;
	width: 42px;
	height: 42px;
	padding: 0;
	border: 0;
	border-radius: 50%;
	color: #fff;
	background: rgb(255 255 255 / 16%);
	font-size: 32px;
	line-height: 38px;
	cursor: pointer;
}
</style>
