<template>
	<el-select
		:model-value="modelValue"
		clearable
		:disabled="!platform"
		:loading="loading"
		:placeholder="platform ? placeholder : '请先选择平台'"
		@visible-change="handleVisibleChange"
		@update:model-value="updateValue"
	>
		<el-option
			v-for="template in templates"
			:key="template.templateType"
			:label="template.label"
			:value="template.templateType"
		>
			<div class="template-option">
				<span class="template-title">
					<el-icon v-if="getIcon(template.icon)">
						<component :is="getIcon(template.icon)" />
					</el-icon>
					<span>{{ template.label }}</span>
				</span>
				<span v-if="template.remark" class="template-remark">{{ template.remark }}</span>
			</div>
		</el-option>
	</el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import { GetAvailableTemplates } from '/@/api/design_order/spec_template';

interface TemplateOption {
	templateType: string;
	label: string;
	icon?: string;
	remark?: string;
}

const props = withDefaults(defineProps<{
	modelValue?: string;
	platform?: string;
	placeholder?: string;
}>(), {
	modelValue: '',
	platform: '',
	placeholder: '请选择模板类型',
});

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void;
}>();

const loading = ref(false);
const templates = ref<TemplateOption[]>([]);

const getIcon = (iconName?: string) => {
	if (!iconName) return null;
	return ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue] || null;
};

const loadTemplates = async () => {
	if (!props.platform) {
		templates.value = [];
		return;
	}
	loading.value = true;
	try {
		const result: any = await GetAvailableTemplates(props.platform);
		templates.value = result.data || [];
	} finally {
		loading.value = false;
	}
};

const updateValue = (value: string) => emit('update:modelValue', value);

const handleVisibleChange = (visible: boolean) => {
	if (visible) loadTemplates();
};

watch(() => props.platform, async () => {
	if (props.modelValue) emit('update:modelValue', '');
	await loadTemplates();
}, { immediate: true });
</script>

<style scoped>
.template-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.template-title {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-width: 0;
}

.template-remark {
	overflow: hidden;
	color: var(--el-text-color-secondary);
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
