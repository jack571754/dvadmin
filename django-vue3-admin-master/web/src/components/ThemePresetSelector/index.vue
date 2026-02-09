<template>
	<div class="theme-preset-selector">
		<div class="selector-header">
			<h3 class="selector-title">{{ title }}</h3>
			<p class="selector-desc">{{ description }}</p>
		</div>

		<div class="preset-grid">
			<div
				v-for="preset in presets"
				:key="preset.key"
				class="preset-card"
				:class="{ 'is-active': isActive(preset.key), 'is-dark': preset.isDark }"
				@click="handlePresetClick(preset)"
			>
				<div class="preset-preview" :style="{ background: preset.preview }">
					<span v-if="isActive(preset.key)" class="preset-check">
						<el-icon><Check /></el-icon>
					</span>
				</div>
				<div class="preset-info">
					<div class="preset-name">{{ preset.name }}</div>
					<div class="preset-description">{{ preset.description }}</div>
				</div>
			</div>
		</div>

		<!-- 颜色预览条 -->
		<div class="color-preview-bar">
			<div
				v-for="color in currentColors"
				:key="color.name"
				class="color-swatch"
				:style="{ backgroundColor: color.value }"
				:title="color.name"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts" name="ThemePresetSelector">
import { ref, computed, onMounted, watch } from 'vue';
import { Check } from '@element-plus/icons-vue';
import { getThemePresetList, applyThemePreset, getCurrentPresetKey, type ThemePreset } from '@/utils/themePresets';

// ============================================
// Props 定义
// ============================================
interface Props {
	/** 标题 */
	title?: string;
	/** 描述 */
	description?: string;
	/** 当前激活的预设 */
	modelValue?: string;
	/** 是否显示深色模式预设 */
	showDark?: boolean;
	/** 预设过滤 */
	filter?: (preset: ThemePreset) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
	title: '主题预设',
	description: '选择一个预设主题来快速改变整体外观',
	modelValue: '',
	showDark: true,
});

// ============================================
// Emits 定义
// ============================================
interface Emits {
	(e: 'update:modelValue', value: string): void;
	(e: 'change', preset: ThemePreset): void;
}

const emit = defineEmits<Emits>();

// ============================================
// 状态管理
// ============================================
const currentPreset = ref<string>('serenity');
const presets = ref<any[]>([]);

// ============================================
// 计算属性
// ============================================
/** 当前主题的颜色预览 */
const currentColors = computed(() => {
	const preset = presets.value.find((p) => p.key === currentPreset.value);
	if (!preset) return [];
	return [
		{ name: '主色', value: preset.colors.primary },
		{ name: '成功', value: preset.colors.success || '#059669' },
		{ name: '警告', value: preset.colors.warning || '#d97706' },
		{ name: '危险', value: preset.colors.danger || '#dc2626' },
		{ name: '信息', value: preset.colors.info || '#0891b2' },
	];
});

// ============================================
// 方法
// ============================================
/** 初始化预设列表 */
const initPresets = () => {
	let list = getThemePresetList();

	// 过滤深色模式预设
	if (!props.showDark) {
		list = list.filter((p) => p.key !== 'dark');
	}

	// 应用自定义过滤
	if (props.filter) {
		list = list.filter(props.filter);
	}

	presets.value = list;
};

/** 检查是否为当前激活的预设 */
const isActive = (key: string): boolean => {
	return currentPreset.value === key;
};

/** 处理预设点击 */
const handlePresetClick = (preset: any) => {
	applyThemePreset(preset.key, false);
	currentPreset.value = preset.key;
	emit('update:modelValue', preset.key);
	emit('change', preset);
};

// ============================================
// 生命周期
// ============================================
onMounted(() => {
	initPresets();

	// 获取当前应用的主题
	const currentKey = getCurrentPresetKey();
	if (currentKey) {
		currentPreset.value = currentKey;
	} else if (props.modelValue) {
		currentPreset.value = props.modelValue;
	}

	// 监听主题变化事件
	window.addEventListener('theme-preset-applied', ((e: CustomEvent) => {
		if (e.detail?.presetKey) {
			currentPreset.value = e.detail.presetKey;
		}
	}) as EventListener);
});

// ============================================
// 监听 props 变化
// ============================================
watch(
	() => props.modelValue,
	(val) => {
		if (val && val !== currentPreset.value) {
			currentPreset.value = val;
		}
	}
);
</script>

<style scoped lang="scss">
.theme-preset-selector {
	.selector-header {
		margin-bottom: var(--spacing-4);

		.selector-title {
			font-size: var(--text-base);
			font-weight: var(--font-semibold);
			color: var(--text-primary);
			margin: 0 0 var(--spacing-1) 0;
		}

		.selector-desc {
			font-size: var(--text-sm);
			color: var(--text-tertiary);
			margin: 0;
		}
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--spacing-3);
		margin-bottom: var(--spacing-4);

		.preset-card {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: var(--spacing-3);
			background: var(--bg-surface);
			border: 2px solid var(--border-base);
			border-radius: var(--radius-lg);
			cursor: pointer;
			transition: all var(--duration-base) var(--ease-default);
			position: relative;
			overflow: hidden;

			&:hover {
				border-color: var(--primary-base);
				box-shadow: var(--shadow-md);
				transform: translateY(-2px);
			}

			&.is-active {
				border-color: var(--primary-base);
				background: var(--primary-gradient-subtle);
				box-shadow: var(--shadow-focus);
			}

			&.is-dark {
				.preset-preview {
					background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
				}
			}

			.preset-preview {
				width: 48px;
				height: 48px;
				border-radius: var(--radius-lg);
				margin-bottom: var(--spacing-3);
				box-shadow: var(--shadow-sm);
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				transition: all var(--duration-base) var(--ease-default);

				.preset-check {
					color: var(--text-on-primary);
					font-size: var(--text-xl);
					animation: checkIn var(--duration-slow) var(--ease-bounce);
				}
			}

			.preset-info {
				text-align: center;

				.preset-name {
					font-size: var(--text-sm);
					font-weight: var(--font-medium);
					color: var(--text-primary);
					margin-bottom: var(--spacing-1);
				}

				.preset-description {
					font-size: var(--text-xs);
					color: var(--text-muted);
					line-height: var(--leading-snug);
				}
			}
		}
	}

	.color-preview-bar {
		display: flex;
		gap: var(--spacing-2);
		padding: var(--spacing-3);
		background: var(--bg-muted);
		border-radius: var(--radius-md);
		align-items: center;

		.color-swatch {
			width: 32px;
			height: 32px;
			border-radius: var(--radius-md);
			border: 2px solid var(--border-base);
			cursor: pointer;
			transition: all var(--duration-fast) var(--ease-default);

			&:hover {
				transform: scale(1.1);
				border-color: var(--primary-base);
			}
		}
	}
}

@keyframes checkIn {
	0% {
		opacity: 0;
		transform: scale(0);
	}
	50% {
		transform: scale(1.2);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}

// 深色模式适配
[data-theme='dark'] {
	.theme-preset-selector {
		.preset-grid .preset-card {
			background: var(--bg-elevated);

			&.is-active {
				background: var(--primary-gradient-strong);
			}
		}

		.color-preview-bar {
			background: var(--bg-elevated);
		}
	}
}
</style>
