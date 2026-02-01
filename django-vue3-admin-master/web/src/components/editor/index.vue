<template>
	<div class="editor-container">
		<Toolbar :editor="editorRef" :mode="mode" />
		<Editor
			:mode="mode"
			:defaultConfig="state.editorConfig"
			:style="{ height }"
			v-model="state.editorVal"
			@onCreated="handleCreated"
			@onChange="handleChange"
		/>
	</div>
</template>

<script setup lang="ts" name="wngEditor">
import '@wangeditor/editor/dist/css/style.css';
import { reactive, shallowRef, watch, onBeforeUnmount } from 'vue';
import { IDomEditor } from '@wangeditor/editor';
import { Toolbar, Editor } from '@wangeditor/editor-for-vue';

const props = defineProps({
	disable: {
		type: Boolean,
		default: () => false,
	},
	placeholder: {
		type: String,
		default: () => '请输入内容...',
	},
	mode: {
		type: String,
		default: () => 'default',
	},
	height: {
		type: String,
		default: () => 'calc(100vh - 350px)',
	},
	getHtml: String,
	getText: String,
});

const emit = defineEmits(['update:getHtml', 'update:getText']);

const editorRef = shallowRef();
const state = reactive({
	editorConfig: {
		placeholder: props.placeholder,
	},
	editorVal: props.getHtml,
});

const handleCreated = (editor: IDomEditor) => {
	editorRef.value = editor;
};

const handleChange = (editor: IDomEditor) => {
	emit('update:getHtml', editor.getHtml());
	emit('update:getText', editor.getText());
};

onBeforeUnmount(() => {
	const editor = editorRef.value;
	if (editor == null) return;
	editor.destroy();
});

watch(
	() => props.disable,
	(bool) => {
		const editor = editorRef.value;
		if (editor == null) return;
		bool ? editor.disable() : editor.enable();
	},
	{
		deep: true,
	}
);

watch(
	() => props.getHtml,
	(val) => {
		state.editorVal = val;
	},
	{
		deep: true,
	}
);
</script>
