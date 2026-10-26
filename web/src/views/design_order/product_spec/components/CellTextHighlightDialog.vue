<template>
	<el-dialog
		:model-value="modelValue"
		title="文字突出显示"
		width="680px"
		:close-on-click-modal="false"
		@close="closeDialog"
	>
		<div class="highlight-editor">
			<div class="highlight-editor__hint">
				请在下方文字中拖动选中需要突出的部分。这里只能调整颜色，不能修改文字内容。
			</div>
			<div
				ref="previewRef"
				class="highlight-editor__preview"
				contenteditable="true"
				spellcheck="false"
				@beforeinput.prevent
				@cut.prevent
				@drop.prevent
				@paste.prevent
				@keydown="blockTextMutation"
				@keyup="captureSelection"
				@mouseup="captureSelection"
			>
				<span
					v-for="segment in segments"
					:key="`${segment.start}-${segment.end}`"
					:style="segmentStyle(segment.style)"
				>{{ segment.text }}</span>
			</div>
			<div class="highlight-editor__selection">
				<span v-if="selectedText">已选择：{{ selectedText }}</span>
				<span v-else>尚未选择文字</span>
			</div>
			<div class="highlight-editor__toolbar">
				<div class="highlight-editor__tool">
					<span>字体颜色</span>
					<el-color-picker v-model="fontColor" :predefine="fontColors" />
					<el-button type="primary" plain @click="applyFontColor">应用</el-button>
				</div>
				<div class="highlight-editor__tool">
					<span>文字高亮</span>
					<el-color-picker v-model="highlightColor" :predefine="highlightColors" />
					<el-button type="warning" plain @click="applyHighlight">应用</el-button>
				</div>
				<el-button @click="clearHighlight">清除所选突出样式</el-button>
			</div>
		</div>
		<template #footer>
			<el-button type="primary" @click="closeDialog">完成</el-button>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
	buildRichTextSegments,
	type RichTextFormatChange,
	type RichTextRun,
	type RichTextStyle,
} from '../richTextFormatting';

const props = defineProps<{
	modelValue: boolean;
	text: string;
	runs: RichTextRun[];
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void;
	(event: 'apply', change: RichTextFormatChange): void;
}>();

const DEFAULT_FONT_COLOR = '#D03050';
const DEFAULT_HIGHLIGHT_COLOR = '#FFF3A3';
const previewRef = ref<HTMLElement | null>(null);
const selectionStart = ref(0);
const selectionEnd = ref(0);
const fontColor = ref(DEFAULT_FONT_COLOR);
const highlightColor = ref(DEFAULT_HIGHLIGHT_COLOR);
const fontColors = ['#D03050', '#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#000000'];
const highlightColors = ['#FFF3A3', '#FFD8A8', '#FFC9C9', '#D0EBFF', '#D3F9D8', '#E5DBFF'];

const segments = computed(() => buildRichTextSegments(props.text, props.runs));
const selectedText = computed(() =>
	props.text.slice(selectionStart.value, selectionEnd.value)
);

const segmentStyle = (style: RichTextStyle) => ({
	color: style.cl?.rgb || undefined,
	backgroundColor: style.bg?.rgb || undefined,
});

const getTextOffset = (range: Range, container: Node, offset: number): number => {
	const measuringRange = range.cloneRange();
	measuringRange.selectNodeContents(previewRef.value!);
	measuringRange.setEnd(container, offset);
	return measuringRange.toString().length;
};

const getTextPosition = (
	root: HTMLElement,
	targetOffset: number,
): { node: Node; offset: number } | null => {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let remaining = targetOffset;
	let node = walker.nextNode();
	while (node) {
		const length = node.textContent?.length ?? 0;
		if (remaining <= length) return { node, offset: remaining };
		remaining -= length;
		node = walker.nextNode();
	}
	return null;
};

const restoreSelection = () => {
	const root = previewRef.value;
	if (!root || selectionStart.value === selectionEnd.value) return;
	const start = getTextPosition(root, selectionStart.value);
	const end = getTextPosition(root, selectionEnd.value);
	const selection = window.getSelection();
	if (!start || !end || !selection) return;
	const range = document.createRange();
	range.setStart(start.node, start.offset);
	range.setEnd(end.node, end.offset);
	selection.removeAllRanges();
	selection.addRange(range);
};

const captureSelection = () => {
	const root = previewRef.value;
	const selection = window.getSelection();
	if (!root || !selection || selection.rangeCount === 0) return;
	const range = selection.getRangeAt(0);
	if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;
	const start = getTextOffset(range, range.startContainer, range.startOffset);
	const end = getTextOffset(range, range.endContainer, range.endOffset);
	selectionStart.value = Math.min(start, end);
	selectionEnd.value = Math.max(start, end);
};

const blockTextMutation = (event: KeyboardEvent) => {
	const modifierPressed = event.ctrlKey || event.metaKey;
	const allowedShortcut = modifierPressed && ['a', 'c'].includes(event.key.toLowerCase());
	const allowedNavigation = [
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
		'PageUp',
		'PageDown',
		'Shift',
	].includes(event.key);
	if (!allowedShortcut && !allowedNavigation) event.preventDefault();
};

const emitStyle = (style: RichTextStyle) => {
	captureSelection();
	if (selectionStart.value === selectionEnd.value) {
		ElMessage.warning('请先选中需要设置样式的文字');
		return;
	}
	emit('apply', {
		start: selectionStart.value,
		end: selectionEnd.value,
		style,
	});
};

const applyFontColor = () => {
	if (!fontColor.value) return;
	emitStyle({ cl: { rgb: fontColor.value } });
};

const applyHighlight = () => {
	if (!highlightColor.value) return;
	emitStyle({ bg: { rgb: highlightColor.value } });
};

const clearHighlight = () => {
	emitStyle({ cl: null, bg: null });
};

const closeDialog = () => {
	emit('update:modelValue', false);
};

watch(() => props.modelValue, async (visible) => {
	if (!visible) return;
	selectionStart.value = 0;
	selectionEnd.value = 0;
	await nextTick();
	previewRef.value?.focus();
});

watch(() => props.runs, async () => {
	await nextTick();
	previewRef.value?.focus();
	restoreSelection();
});
</script>

<style scoped>
.highlight-editor {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.highlight-editor__hint {
	padding: 10px 12px;
	color: #475569;
	font-size: 13px;
	line-height: 1.6;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
}

.highlight-editor__preview {
	min-height: 180px;
	max-height: 360px;
	overflow-y: auto;
	padding: 16px;
	color: #1e293b;
	font-size: 15px;
	line-height: 1.8;
	white-space: pre-wrap;
	word-break: break-word;
	background: #ffffff;
	border: 1px solid #cbd5e1;
	border-radius: 8px;
	outline: none;
	cursor: text;
	caret-color: transparent;
	user-select: text;
}

.highlight-editor__preview:focus {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
}

.highlight-editor__selection {
	min-height: 20px;
	color: #64748b;
	font-size: 13px;
}

.highlight-editor__selection span {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.highlight-editor__toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
	padding-top: 12px;
	border-top: 1px solid #e2e8f0;
}

.highlight-editor__tool {
	display: flex;
	align-items: center;
	gap: 8px;
}

.highlight-editor__tool > span {
	color: #334155;
	font-size: 13px;
	font-weight: 600;
}
</style>
