<template>
	<div class="image-uploader">
		<div class="image-list">
			<div v-for="(image, index) in modelValue" :key="image.file_id" class="image-card">
				<el-image
					:src="image.url"
					:preview-src-list="modelValue.map((item) => item.url)"
					:initial-index="index"
					preview-teleported
					fit="contain"
				/>
				<div class="image-actions">
					<el-button link :disabled="index === 0" @click="move(index, -1)">前移</el-button>
					<el-button link :disabled="index === modelValue.length - 1" @click="move(index, 1)">
						后移
					</el-button>
					<el-button link type="danger" @click="remove(index)">移除</el-button>
				</div>
				<el-tag v-if="index === 0" class="cover-tag" size="small">默认图</el-tag>
			</div>
			<div
				v-if="modelValue.length < MAX_ICON_IMAGES"
				class="upload-trigger"
				:class="{ 'drag-over': isDragOver }"
				tabindex="0"
				@dblclick="triggerFileInput"
				@dragover.prevent="onDragOver"
				@dragenter.prevent="onDragOver"
				@dragleave.prevent="onDragLeave"
				@drop.prevent="onDrop"
			>
				<input
					ref="fileInputRef"
					type="file"
					:accept="IMAGE_ACCEPT"
					multiple
					class="file-input-hidden"
					@change="onFileInputChange"
				/>
				<el-icon v-if="!uploading"><Plus /></el-icon>
				<el-icon v-else class="is-loading"><Loading /></el-icon>
				<span>{{ uploading ? '上传中' : '选择/拖拽/粘贴' }}</span>
			</div>
		</div>
		<div class="tip">
			支持 JPG、PNG、WEBP，最多 5 张；第一张为默认展示图。双击选择文件，也可拖拽或 Ctrl+V 粘贴上传。
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading, Plus } from '@element-plus/icons-vue';

import { UploadImage } from '/@/api/design_order/icon_library';
import { MAX_ICON_IMAGES } from '../constants';
import type { IconImage } from '../types';

const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

const props = defineProps<{ modelValue: IconImage[] }>();
const emit = defineEmits<{
	(event: 'update:modelValue', value: IconImage[]): void;
	(event: 'uploading-change', value: boolean): void;
}>();
const uploading = ref(false);
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement>();

function update(value: IconImage[]) {
	emit(
		'update:modelValue',
		value.map((item, index) => ({ ...item, sort: index + 1 }))
	);
}

function move(index: number, offset: number) {
	const target = index + offset;
	if (target < 0 || target >= props.modelValue.length) return;
	const images = [...props.modelValue];
	[images[index], images[target]] = [images[target], images[index]];
	update(images);
}

function remove(index: number) {
	update(props.modelValue.filter((_, itemIndex) => itemIndex !== index));
}

function triggerFileInput() {
	fileInputRef.value?.click();
}

function onFileInputChange(e: Event) {
	const input = e.target as HTMLInputElement;
	const files = Array.from(input.files || []);
	handleFiles(files);
	input.value = '';
}

function onDragOver() {
	isDragOver.value = true;
}
function onDragLeave() {
	isDragOver.value = false;
}
function onDrop(e: DragEvent) {
	isDragOver.value = false;
	const files = Array.from(e.dataTransfer?.files || []);
	handleFiles(files);
}

function onPaste(e: ClipboardEvent) {
	// 当焦点在输入框/文本域时不拦截粘贴
	const target = e.target as HTMLElement;
	if (
		target &&
		(target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.isContentEditable)
	) {
		return;
	}
	const files = Array.from(e.clipboardData?.files || []);
	if (files.length) {
		e.preventDefault();
		handleFiles(files);
	}
}

async function handleFiles(files: File[]) {
	if (uploading.value) return;
	const imageFiles = files.filter((f) => f.type.startsWith('image/'));
	if (!imageFiles.length) {
		ElMessage.warning('请选择图片文件');
		return;
	}
	const remaining = MAX_ICON_IMAGES - props.modelValue.length;
	if (remaining <= 0) {
		ElMessage.warning(`最多 ${MAX_ICON_IMAGES} 张图片`);
		return;
	}
	const toUpload = imageFiles.slice(0, remaining);
	if (imageFiles.length > remaining) {
		ElMessage.warning(`最多 ${MAX_ICON_IMAGES} 张，已截取前 ${remaining} 张`);
	}
	uploading.value = true;
	emit('uploading-change', true);
	try {
		for (const file of toUpload) {
			if (props.modelValue.length >= MAX_ICON_IMAGES) break;
			const response: any = await UploadImage(file);
			update([...props.modelValue, response.data]);
		}
		ElMessage.success('图片上传成功');
	} catch {
		ElMessage.error('图片上传失败');
	} finally {
		uploading.value = false;
		emit('uploading-change', false);
	}
}

onMounted(() => {
	window.addEventListener('paste', onPaste);
});
onUnmounted(() => {
	window.removeEventListener('paste', onPaste);
});
</script>

<style scoped>
.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.image-card,
.upload-trigger {
	position: relative;
	width: 132px;
	height: 164px;
	box-sizing: border-box;
	border: 1px solid var(--el-border-color);
	border-radius: 8px;
	overflow: hidden;
}

.image-card :deep(.el-image) {
	display: block;
	width: 100%;
	height: 116px;
	background: var(--el-fill-color-blank);
}

.image-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 46px;
	box-sizing: border-box;
	padding: 7px 2px;
	background: var(--el-fill-color-lighter);
	gap: 4px;
}

.image-actions :deep(.el-button) {
	margin-left: 0 !important;
	height: 30px;
	min-height: 30px;
	padding: 4px;
	line-height: 20px;
}

.cover-tag {
	position: absolute;
	top: 6px;
	left: 6px;
}

.upload-trigger {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	color: var(--el-text-color-secondary);
	cursor: pointer;
	border-style: dashed;
	outline: none;
	transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.upload-trigger:hover,
.upload-trigger:focus {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary);
}

.upload-trigger.drag-over {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary);
	background-color: var(--el-color-primary-light-9);
}

.file-input-hidden {
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	pointer-events: none;
}

.tip {
	margin-top: 8px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}
</style>
