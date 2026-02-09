<template>
	<div class="theme-color-picker">
		<div class="picker-header">
			<h3 class="picker-title">{{ title }}</h3>
			<p class="picker-desc">{{ description }}</p>
		</div>

		<!-- 预设颜色 -->
		<div class="preset-colors">
			<div
				v-for="color in presetColors"
				:key="color.value"
				class="color-item"
				:class="{ 'is-active': isActive(color.value) }"
				:style="{ backgroundColor: color.value }"
				@click="selectColor(color.value)"
			>
				<span v-if="isActive(color.value)" class="color-check">
					<el-icon><Check /></el-icon>
				</span>
			</div>
		</div>

		<!-- 自定义颜色 -->
		<div class="custom-color-section">
			<div class="custom-color-input">
				<el-input
					v-model="customColor"
					placeholder="#2563eb"
					:maxlength="7"
					@change="handleCustomColorChange"
				>
					<template #prefix>
						<div
							class="color-preview"
							:style="{ backgroundColor: customColor || currentColor }"
						></div>
					</template>
				</el-input>
			</div>
			<el-color-picker
				v-model="customColorPicker"
				:predefine="predefineColors"
				show-alpha
				@change="handlePickerChange"
			/>
		</div>

		<!-- 颜色历史 -->
		<div v-if="colorHistory.length > 0" class="color-history">
			<div class="history-label">最近使用</div>
			<div class="history-colors">
				<div
					v-for="(color, index) in colorHistory"
					:key="index"
					class="history-item"
					:style="{ backgroundColor: color }"
					@click="selectColor(color)"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="ThemeColorPicker">
import { ref, computed, watch, onMounted } from 'vue';
import { Check } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

// ============================================
// Props 定义
// ============================================
interface Props {
	/** 标题 */
	title?: string;
	/** 描述 */
	description?: string;
	/** 当前颜色值 */
	modelValue?: string;
	/** 预设颜色列表 */
	presets?: string[];
	/** 最大历史记录数 */
	maxHistory?: number;
}

const props = withDefaults(defineProps<Props>(), {
	title: '主题颜色',
	description: '选择或自定义主题颜色',
	modelValue: '#2563eb',
	presets: () => [
		'#2563eb', // 静谧蓝
		'#059669', // 森之绿
		'#7c3aed', // 暮光紫
		'#ea580c', // 日落橙
		'#0891b2', // 海洋青
		'#e11d48', // 玫瑰红
		'#ca8a04', // 柠檬黄
		'#374151', // 石墨灰
		'#ef4444', // 红色
		'#f97316', // 橙色
		'#84cc16', // 黄绿色
		'#06b6d4', // 青色
		'#3b82f6', // 蓝色
		'#8b5cf6', // 紫色
		'#ec4899', // 粉色
	],
	maxHistory: 8,
});

// ============================================
// Emits 定义
// ============================================
interface Emits {
	(e: 'update:modelValue', value: string): void;
	(e: 'change', value: string): void;
}

const emit = defineEmits<Emits>();

// ============================================
// 状态管理
// ============================================
const currentColor = ref(props.modelValue);
const customColor = ref('');
const customColorPicker = ref('');
const colorHistory = ref<string[]>([]);

// 预定义颜色（用于颜色选择器）
const predefineColors = ref([
	'#2563eb',
	'#059669',
	'#7c3aed',
	'#ea580c',
	'#e11d48',
	'#dc2626',
	'#db2777',
	'#7c3aed',
	'#2563eb',
	'#0891b2',
	'#059669',
	'#ca8a04',
	'#dc2626',
	'#374151',
]);

// ============================================
// 计算属性
// ============================================
const presetColors = computed(() => {
	return props.presets.map((color) => ({
		value: color,
	}));
});

// ============================================
// 方法
// ============================================
/** 检查是否为当前颜色 */
const isActive = (color: string): boolean => {
	return currentColor.value.toLowerCase() === color.toLowerCase();
};

/** 选择颜色 */
const selectColor = (color: string) => {
	applyColor(color);
	addToHistory(color);
};

/** 应用颜色 */
const applyColor = (color: string) => {
	if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) return;

	currentColor.value = color;
	customColor.value = color;

	// 应用到 CSS 变量
	applyColorToTheme(color);

	emit('update:modelValue', color);
	emit('change', color);
};

/** 应用颜色到主题 */
const applyColorToTheme = (color: string) => {
	const root = document.documentElement;

	// 设置主色变量
	root.style.setProperty('--primary-base', color);
	root.style.setProperty('--el-color-primary', color);

	// 计算并设置颜色变体
	const hoverColor = adjustBrightness(color, -10);
	const activeColor = adjustBrightness(color, -20);
	const lightColor = adjustBrightness(color, 10);
	const lighterColor = adjustBrightness(color, 20);

	root.style.setProperty('--primary-hover', hoverColor);
	root.style.setProperty('--primary-active', activeColor);
	root.style.setProperty('--primary-light', lightColor);
	root.style.setProperty('--primary-lighter', lighterColor);

	// 生成 Element Plus 颜色变体
	for (let i = 1; i <= 9; i++) {
		const mixedColor = mixWithWhite(color, i * 0.1);
		root.style.setProperty(`--el-color-primary-light-${i}`, mixedColor);
	}

	const darkColor = adjustBrightness(color, -20);
	root.style.setProperty('--el-color-primary-dark-2', darkColor);
};

/** 调整颜色亮度 */
const adjustBrightness = (color: string, percent: number): string => {
	const num = parseInt(color.replace('#', ''), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
	return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

/** 颜色与白色混合 */
const mixWithWhite = (color: string, whiteRatio: number): string => {
	const num = parseInt(color.replace('#', ''), 16);
	const R = (num >> 16) & 0xff;
	const G = (num >> 8) & 0xff;
	const B = num & 0xff;

	const newR = Math.round(R + (255 - R) * whiteRatio);
	const newG = Math.round(G + (255 - G) * whiteRatio);
	const newB = Math.round(B + (255 - B) * whiteRatio);

	return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
};

/** 添加到历史记录 */
const addToHistory = (color: string) => {
	// 移除已存在的相同颜色
	const index = colorHistory.value.indexOf(color);
	if (index > -1) {
		colorHistory.value.splice(index, 1);
	}

	// 添加到开头
	colorHistory.value.unshift(color);

	// 限制历史记录数量
	if (colorHistory.value.length > props.maxHistory) {
		colorHistory.value = colorHistory.value.slice(0, props.maxHistory);
	}

	// 保存到 localStorage
	saveHistory();
};

/** 保存历史记录到 localStorage */
const saveHistory = debounce(() => {
	try {
		localStorage.setItem('theme-color-history', JSON.stringify(colorHistory.value));
	} catch (e) {
		console.warn('[ThemeColorPicker] 无法保存颜色历史', e);
	}
}, 300);

/** 加载历史记录 */
const loadHistory = () => {
	try {
		const saved = localStorage.getItem('theme-color-history');
		if (saved) {
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed)) {
				colorHistory.value = parsed.slice(0, props.maxHistory);
			}
		}
	} catch (e) {
		console.warn('[ThemeColorPicker] 无法加载颜色历史', e);
	}
};

/** 处理自定义颜色输入 */
const handleCustomColorChange = (value: string) => {
	let color = value.trim();
	if (!color.startsWith('#')) {
		color = '#' + color;
	}
	if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
		applyColor(color);
		addToHistory(color);
	}
};

/** 处理颜色选择器变化 */
const handlePickerChange = (value: string) => {
	if (value && /^#[0-9A-Fa-f]{6,8}$/.test(value)) {
		const color = value.substring(0, 7);
		applyColor(color);
		addToHistory(color);
	}
};

// ============================================
// 监听 props 变化
// ============================================
watch(
	() => props.modelValue,
	(val) => {
		if (val && val !== currentColor.value) {
			currentColor.value = val;
			customColor.value = val;
		}
	}
);

// ============================================
// 生命周期
// ============================================
onMounted(() => {
	// 加载历史记录
	loadHistory();

	// 初始化颜色
	if (props.modelValue) {
		currentColor.value = props.modelValue;
		customColor.value = props.modelValue;
	}
});
</script>

<style scoped lang="scss">
.theme-color-picker {
	.picker-header {
		margin-bottom: var(--spacing-4);

		.picker-title {
			font-size: var(--text-base);
			font-weight: var(--font-semibold);
			color: var(--text-primary);
			margin: 0 0 var(--spacing-1) 0;
		}

		.picker-desc {
			font-size: var(--text-sm);
			color: var(--text-tertiary);
			margin: 0;
		}
	}

	.preset-colors {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-4);

		.color-item {
			width: 36px;
			height: 36px;
			border-radius: var(--radius-md);
			cursor: pointer;
			transition: all var(--duration-base) var(--ease-default);
			border: 2px solid var(--border-base);
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;

			&:hover {
				transform: scale(1.1);
				border-color: var(--primary-base);
				box-shadow: var(--shadow-md);
			}

			&.is-active {
				border-color: var(--primary-base);
				box-shadow: var(--shadow-focus);

				.color-check {
					color: var(--text-on-primary);
					font-size: var(--text-lg);
					animation: checkIn var(--duration-slow) var(--ease-bounce);
				}
			}
		}
	}

	.custom-color-section {
		display: flex;
		gap: var(--spacing-3);
		align-items: center;
		padding: var(--spacing-3);
		background: var(--bg-muted);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-4);

		.custom-color-input {
			flex: 1;

			:deep(.el-input__wrapper) {
				padding-left: var(--spacing-2);

				.el-input__prefix {
					display: flex;
					align-items: center;
				}
			}

			.color-preview {
				width: 20px;
				height: 20px;
				border-radius: var(--radius-sm);
				border: 1px solid var(--border-base);
			}
		}

		:deep(.el-color-picker) {
			.el-color-picker__trigger {
				width: 36px;
				height: 36px;
				border-radius: var(--radius-md);
				border: 1px solid var(--border-base);
			}
		}
	}

	.color-history {
		.history-label {
			font-size: var(--text-xs);
			color: var(--text-tertiary);
			margin-bottom: var(--spacing-2);
		}

		.history-colors {
			display: flex;
			gap: var(--spacing-2);
			flex-wrap: wrap;

			.history-item {
				width: 24px;
				height: 24px;
				border-radius: var(--radius-sm);
				cursor: pointer;
				transition: all var(--duration-fast) var(--ease-default);
				border: 1px solid var(--border-base);

				&:hover {
					transform: scale(1.15);
					border-color: var(--primary-base);
				}
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
	.theme-color-picker {
		.custom-color-section {
			background: var(--bg-elevated);
		}
	}
}
</style>
