<template>
	<el-drawer
		v-model="drawerVisible"
		title="主题设置"
		direction="rtl"
		:size="320"
		:before-close="handleClose"
		class="theme-settings-drawer"
	>
		<template #header>
			<div class="drawer-header">
				<div class="header-left">
					<el-icon class="header-icon"><Setting /></el-icon>
					<span class="header-title">主题设置</span>
				</div>
				<el-button link @click="handleReset">
					<el-icon><RefreshLeft /></el-icon>
					重置
				</el-button>
			</div>
		</template>

		<div class="theme-settings-content">
			<!-- 主题预设 -->
			<div class="settings-section">
				<div class="section-header">
					<h4 class="section-title">主题预设</h4>
					<p class="section-desc">选择预设主题快速切换外观</p>
				</div>
				<theme-preset-selector
					v-model="currentPreset"
					title=""
					description=""
					@change="handlePresetChange"
				/>
			</div>

			<!-- 主题颜色 -->
			<div class="settings-section">
				<div class="section-header">
					<h4 class="section-title">主题颜色</h4>
					<p class="section-desc">自定义主色调</p>
				</div>
				<theme-color-picker
					v-model="customColor"
					title=""
					description=""
					@change="handleColorChange"
				/>
			</div>

			<!-- 深色模式 -->
			<div class="settings-section">
				<div class="section-header">
					<h4 class="section-title">显示模式</h4>
				</div>
				<div class="mode-switch">
					<div
						class="mode-item"
						:class="{ 'is-active': !isDarkMode }"
						@click="toggleDarkMode(false)"
					>
						<el-icon><Sunny /></el-icon>
						<span>浅色</span>
					</div>
					<div
						class="mode-item"
						:class="{ 'is-active': isDarkMode }"
						@click="toggleDarkMode(true)"
					>
						<el-icon><Moon /></el-icon>
						<span>深色</span>
					</div>
				</div>
			</div>

			<!-- 界面设置 -->
			<div class="settings-section">
				<div class="section-header">
					<h4 class="section-title">界面设置</h4>
				</div>
				<div class="settings-list">
					<div class="settings-item">
						<span class="item-label">菜单圆角</span>
						<el-segmented v-model="menuRadius" :options="radiusOptions" @change="handleRadiusChange" />
					</div>
					<div class="settings-item">
						<span class="item-label">组件阴影</span>
						<el-segmented v-model="shadowLevel" :options="shadowOptions" @change="handleShadowChange" />
					</div>
					<div class="settings-item">
						<span class="item-label">紧凑模式</span>
						<el-switch v-model="compactMode" @change="handleCompactChange" />
					</div>
				</div>
			</div>

			<!-- 导出/导入 -->
			<div class="settings-section">
				<div class="section-header">
					<h4 class="section-title">配置管理</h4>
				</div>
				<div class="config-actions">
					<el-button @click="handleExport">
						<el-icon><Download /></el-icon>
						导出配置
					</el-button>
					<el-button @click="handleImportClick">
						<el-icon><Upload /></el-icon>
						导入配置
					</el-button>
				</div>
			</div>
		</div>
	</el-drawer>

	<!-- 导入文件输入 -->
	<input
		ref="fileInputRef"
		type="file"
		accept=".json"
		style="display: none"
		@change="handleFileChange"
	/>
</template>

<script setup lang="ts" name="ThemeSettings">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
	Setting,
	RefreshLeft,
	Download,
	Upload,
	Sunny,
	Moon,
} from '@element-plus/icons-vue';
import ThemePresetSelector from '../ThemePresetSelector/index.vue';
import ThemeColorPicker from '../ThemeColorPicker/index.vue';
import { exportThemeConfig, importThemeConfig } from '@/utils/themePresets';
import { useThemeConfig } from '@/stores/themeConfig';

// ============================================
// Props 定义
// ============================================
interface Props {
	modelValue?: boolean;
}

const props = defineProps<Props>();

// ============================================
// Emits 定义
// ============================================
interface Emits {
	(e: 'update:modelValue', value: boolean): void;
}

const emit = defineEmits<Emits>();

// ============================================
// 状态管理
// ============================================
const themeConfigStore = useThemeConfig();
const drawerVisible = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

const currentPreset = ref('serenity');
const customColor = ref('#2563eb');
const isDarkMode = ref(false);
const menuRadius = ref('medium');
const shadowLevel = ref('medium');
const compactMode = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// 圆角选项
const radiusOptions = [
	{ label: '小', value: 'small' },
	{ label: '中', value: 'medium' },
	{ label: '大', value: 'large' },
];

// 阴影选项
const shadowOptions = [
	{ label: '轻', value: 'light' },
	{ label: '中', value: 'medium' },
	{ label: '重', value: 'heavy' },
];

// ============================================
// 方法
// ============================================
/** 关闭抽屉 */
const handleClose = () => {
	drawerVisible.value = false;
};

/** 重置主题 */
const handleReset = async () => {
	try {
		await ElMessageBox.confirm('确定要重置所有主题设置吗？', '确认重置', {
			type: 'warning',
		});

		// 重置为默认主题
		currentPreset.value = 'serenity';
		customColor.value = '#2563eb';
		isDarkMode.value = false;
		menuRadius.value = 'medium';
		shadowLevel.value = 'medium';
		compactMode.value = false;

		// 应用默认主题
		applyDefaultTheme();

		ElMessage.success('主题已重置');
	} catch {
		// 用户取消
	}
};

/** 应用默认主题 */
const applyDefaultTheme = () => {
	const root = document.documentElement;

	// 重置颜色
	root.style.setProperty('--primary-base', '#2563eb');
	root.style.setProperty('--el-color-primary', '#2563eb');

	// 重置深色模式
	root.removeAttribute('data-theme');
	isDarkMode.value = false;

	// 重置圆角
	root.style.setProperty('--radius-md', '6px');
	root.style.setProperty('--radius-lg', '8px');
	root.style.setProperty('--radius-xl', '12px');
};

/** 处理预设变化 */
const handlePresetChange = (preset: any) => {
	currentPreset.value = preset.key;
	customColor.value = preset.colors.primary;

	// 如果是深色模式预设
	if (preset.isDark) {
		isDarkMode.value = true;
	}
};

/** 处理颜色变化 */
const handleColorChange = (color: string) => {
	customColor.value = color;
	// 清除预设状态
	currentPreset.value = '';
};

/** 切换深色模式 */
const toggleDarkMode = (dark: boolean) => {
	isDarkMode.value = dark;
	const root = document.documentElement;

	if (dark) {
		root.setAttribute('data-theme', 'dark');
	} else {
		root.removeAttribute('data-theme');
	}
};

/** 处理圆角变化 */
const handleRadiusChange = (value: string) => {
	const root = document.documentElement;

	switch (value) {
		case 'small':
			root.style.setProperty('--radius-md', '4px');
			root.style.setProperty('--radius-lg', '6px');
			root.style.setProperty('--radius-xl', '8px');
			break;
		case 'medium':
			root.style.setProperty('--radius-md', '6px');
			root.style.setProperty('--radius-lg', '8px');
			root.style.setProperty('--radius-xl', '12px');
			break;
		case 'large':
			root.style.setProperty('--radius-md', '8px');
			root.style.setProperty('--radius-lg', '12px');
			root.style.setProperty('--radius-xl', '16px');
			break;
	}
};

/** 处理阴影变化 */
const handleShadowChange = (value: string) => {
	const root = document.documentElement;

	switch (value) {
		case 'light':
			root.style.setProperty('--shadow-sm', '0 1px 2px rgba(15, 23, 42, 0.04)');
			root.style.setProperty('--shadow-md', '0 2px 4px rgba(15, 23, 42, 0.06)');
			root.style.setProperty('--shadow-lg', '0 4px 8px rgba(15, 23, 42, 0.08)');
			break;
		case 'medium':
			root.style.setProperty('--shadow-sm', '0 1px 3px rgba(15, 23, 42, 0.06)');
			root.style.setProperty('--shadow-md', '0 4px 6px rgba(15, 23, 42, 0.08)');
			root.style.setProperty('--shadow-lg', '0 10px 15px rgba(15, 23, 42, 0.08)');
			break;
		case 'heavy':
			root.style.setProperty('--shadow-sm', '0 2px 4px rgba(15, 23, 42, 0.08)');
			root.style.setProperty('--shadow-md', '0 6px 12px rgba(15, 23, 42, 0.1)');
			root.style.setProperty('--shadow-lg', '0 20px 25px rgba(15, 23, 42, 0.12)');
			break;
	}
};

/** 处理紧凑模式 */
const handleCompactChange = (value: boolean) => {
	const root = document.documentElement;

	if (value) {
		root.style.setProperty('--spacing-2', '6px');
		root.style.setProperty('--spacing-3', '8px');
		root.style.setProperty('--spacing-4', '10px');
		root.style.setProperty('--spacing-6', '14px');
	} else {
		root.style.setProperty('--spacing-2', '8px');
		root.style.setProperty('--spacing-3', '12px');
		root.style.setProperty('--spacing-4', '16px');
		root.style.setProperty('--spacing-6', '24px');
	}
};

/** 导出配置 */
const handleExport = () => {
	const config = {
		preset: currentPreset.value,
		customColor: customColor.value,
		isDarkMode: isDarkMode.value,
		menuRadius: menuRadius.value,
		shadowLevel: shadowLevel.value,
		compactMode: compactMode.value,
	};

	const dataStr = JSON.stringify(config, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(dataBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `dvadmin-theme-${Date.now()}.json`;
	link.click();
	URL.revokeObjectURL(url);

	ElMessage.success('配置已导出');
};

/** 导入配置点击 */
const handleImportClick = () => {
	fileInputRef.value?.click();
};

/** 处理文件选择 */
const handleFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file) return;

	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const config = JSON.parse(e.target?.result as string);

			// 应用配置
			if (config.preset) {
				currentPreset.value = config.preset;
			}
			if (config.customColor) {
				customColor.value = config.customColor;
			}
			if (typeof config.isDarkMode === 'boolean') {
				toggleDarkMode(config.isDarkMode);
			}
			if (config.menuRadius) {
				menuRadius.value = config.menuRadius;
				handleRadiusChange(config.menuRadius);
			}
			if (config.shadowLevel) {
				shadowLevel.value = config.shadowLevel;
				handleShadowChange(config.shadowLevel);
			}
			if (typeof config.compactMode === 'boolean') {
				compactMode.value = config.compactMode;
				handleCompactChange(config.compactMode);
			}

			ElMessage.success('配置已导入');
		} catch {
			ElMessage.error('配置文件格式错误');
		}
	};
	reader.readAsText(file);

	// 清空文件输入
	target.value = '';
};

// ============================================
// 生命周期
// ============================================
// 初始化深色模式状态
watch(
	() => themeConfigStore.themeConfig.isIsDark,
	(val) => {
		isDarkMode.value = val;
	},
	{ immediate: true }
);
</script>

<style scoped lang="scss">
.theme-settings-drawer {
	:deep(.el-drawer) {
		.el-drawer__header {
			margin-bottom: 0;
			padding: 0;
		}

		.el-drawer__body {
			padding: 0;
		}
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-4) var(--spacing-5);
		border-bottom: 1px solid var(--divider-base);

		.header-left {
			display: flex;
			align-items: center;
			gap: var(--spacing-2);

			.header-icon {
				font-size: var(--text-xl);
				color: var(--primary-base);
			}

			.header-title {
				font-size: var(--text-lg);
				font-weight: var(--font-semibold);
				color: var(--text-primary);
			}
		}
	}

	.theme-settings-content {
		padding: var(--spacing-5);
		overflow-y: auto;
		max-height: calc(100vh - 60px);

		.settings-section {
			margin-bottom: var(--spacing-6);

			&:last-child {
				margin-bottom: 0;
			}

			.section-header {
				margin-bottom: var(--spacing-3);

				.section-title {
					font-size: var(--text-sm);
					font-weight: var(--font-semibold);
					color: var(--text-primary);
					margin: 0 0 var(--spacing-1) 0;
				}

				.section-desc {
					font-size: var(--text-xs);
					color: var(--text-muted);
					margin: 0;
				}
			}
		}

		.mode-switch {
			display: flex;
			gap: var(--spacing-2);
			padding: var(--spacing-1);
			background: var(--bg-muted);
			border-radius: var(--radius-md);

			.mode-item {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: var(--spacing-1);
				padding: var(--spacing-2) var(--spacing-3);
				border-radius: var(--radius-sm);
				cursor: pointer;
				transition: all var(--duration-base) var(--ease-default);
				color: var(--text-secondary);
				font-size: var(--text-sm);

				&:hover {
					color: var(--text-primary);
				}

				&.is-active {
					background: var(--bg-surface);
					color: var(--primary-base);
					box-shadow: var(--shadow-sm);
					font-weight: var(--font-medium);
				}

				.el-icon {
					font-size: var(--text-base);
				}
			}
		}

		.settings-list {
			.settings-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--spacing-3) 0;
				border-bottom: 1px solid var(--divider-base);

				&:last-child {
					border-bottom: none;
				}

				.item-label {
					font-size: var(--text-sm);
					color: var(--text-secondary);
				}

				:deep(.el-segmented) {
					--el-segmented-bg-color: var(--bg-muted);
					--el-segmented-item-selected-bg-color: var(--bg-surface);
					--el-segmented-item-selected-color: var(--primary-base);
				}
			}
		}

		.config-actions {
			display: flex;
			gap: var(--spacing-2);

			.el-button {
				flex: 1;
			}
		}
	}
}

// 深色模式适配
[data-theme='dark'] {
	.theme-settings-drawer {
		.mode-switch {
			background: var(--bg-elevated);

			.mode-item {
				&.is-active {
					background: var(--bg-surface);
				}
			}
		}
	}
}
</style>
