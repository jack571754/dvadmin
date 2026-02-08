<template>
	<div class="layout-breadcrumb-seting-modern">
		<el-drawer
			v-model="getThemeConfig.isDrawer"
			title="主题设置"
			direction="rtl"
			destroy-on-close
			size="340px"
			@close="onDrawerClose"
			class="theme-settings-drawer"
		>
			<template #header>
				<div class="drawer-header">
					<div class="header-left">
						<el-icon class="header-icon"><Setting /></el-icon>
						<span class="header-title">{{ $t('message.layout.configTitle') }}</span>
					</div>
					<div class="header-actions">
						<el-tooltip content="重置主题">
							<el-button link @click="onResetThemeClick">
								<el-icon><RefreshLeft /></el-icon>
							</el-button>
						</el-tooltip>
					</div>
				</div>
			</template>

			<el-scrollbar class="layout-breadcrumb-seting-bar">
				<!-- 主题预设 -->
				<div class="setting-section">
					<div class="section-header">
						<h4 class="section-title">主题预设</h4>
						<p class="section-desc">快速切换整体外观</p>
					</div>
					<div class="preset-grid">
						<div
							v-for="preset in themePresets"
							:key="preset.key"
							class="preset-card"
							:class="{ 'is-active': currentPreset === preset.key, 'is-dark': preset.isDark }"
							@click="onPresetClick(preset)"
						>
							<div class="preset-preview" :style="{ background: preset.preview }">
								<el-icon v-if="currentPreset === preset.key" class="preset-check"><Check /></el-icon>
							</div>
							<div class="preset-info">
								<div class="preset-name">{{ preset.name }}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 全局主题 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.oneTitle') }}</span>
				</el-divider>
				<div class="setting-item">
					<div class="setting-label">主题颜色</div>
					<div class="setting-value">
						<el-color-picker v-model="getThemeConfig.primary" size="default" @change="onColorPickerChange" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.fourIsDark') }}</div>
					<div class="setting-value">
						<el-switch v-model="getThemeConfig.isIsDark" size="small" @change="onAddDarkChange" />
					</div>
				</div>

				<!-- 顶栏设置 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.twoTopTitle') }}</span>
				</el-divider>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.twoTopBar') }}</div>
					<div class="setting-value">
						<el-color-picker v-model="getThemeConfig.topBar" size="default" @change="onBgColorPickerChange('topBar')" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.twoTopBarColor') }}</div>
					<div class="setting-value">
						<el-color-picker v-model="getThemeConfig.topBarColor" size="default" @change="onBgColorPickerChange('topBarColor')" />
					</div>
				</div>

				<!-- 菜单设置 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.twoMenuTitle') }}</span>
				</el-divider>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.twoMenuBar') }}</div>
					<div class="setting-value">
						<el-color-picker v-model="getThemeConfig.menuBar" size="default" @change="onBgColorPickerChange('menuBar')" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.twoMenuBarColor') }}</div>
					<div class="setting-value">
						<el-color-picker v-model="getThemeConfig.menuBarColor" size="default" @change="onBgColorPickerChange('menuBarColor')" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.twoMenuBarActiveColor') }}</div>
					<div class="setting-value">
						<el-color-picker
							v-model="getThemeConfig.menuBarActiveColor"
							size="default"
							show-alpha
							@change="onBgColorPickerChange('menuBarActiveColor')"
						/>
					</div>
				</div>

				<!-- 界面设置 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.threeTitle') }}</span>
				</el-divider>
				<div class="setting-item" :style="{ opacity: getThemeConfig.layout === 'transverse' ? 0.5 : 1 }">
					<div class="setting-label">{{ $t('message.layout.threeIsCollapse') }}</div>
					<div class="setting-value">
						<el-switch
							v-model="getThemeConfig.isCollapse"
							:disabled="getThemeConfig.layout === 'transverse'"
							size="small"
							@change="onThemeConfigChange"
						/>
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.threeIsFixedHeader') }}</div>
					<div class="setting-value">
						<el-switch v-model="getThemeConfig.isFixedHeader" size="small" @change="onIsFixedHeaderChange" />
					</div>
				</div>

				<!-- 界面显示 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.fourTitle') }}</span>
				</el-divider>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.fourIsBreadcrumb') }}</div>
					<div class="setting-value">
						<el-switch v-model="getThemeConfig.isBreadcrumb" size="small" @change="onIsBreadcrumbChange" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.fourIsTagsview') }}</div>
					<div class="setting-value">
						<el-switch v-model="getThemeConfig.isTagsview" size="small" @change="setLocalThemeConfig" />
					</div>
				</div>
				<div class="setting-item">
					<div class="setting-label">{{ $t('message.layout.fourIsFooter') }}</div>
					<div class="setting-value">
						<el-switch v-model="getThemeConfig.isFooter" size="small" @change="setLocalThemeConfig" />
					</div>
				</div>

				<!-- 布局切换 -->
				<el-divider content-position="left">
					<span class="divider-label">{{ $t('message.layout.sixTitle') }}</span>
				</el-divider>
				<div class="layout-grid">
					<div
						v-for="layout in layouts"
						:key="layout.value"
						class="layout-item"
						:class="{ 'is-active': getThemeConfig.layout === layout.value }"
						@click="onSetLayout(layout.value)"
					>
						<div class="layout-preview" v-html="layout.icon"></div>
						<div class="layout-name">{{ layout.label }}</div>
					</div>
				</div>

				<!-- 操作按钮 -->
				<div class="setting-actions">
					<el-button class="action-btn" type="primary" @click="onCopyConfigClick">
						<el-icon><CopyDocument /></el-icon>
						{{ $t('message.layout.copyText') }}
					</el-button>
					<el-button class="action-btn" @click="onResetConfigClick">
						<el-icon><RefreshRight /></el-icon>
						{{ $t('message.layout.resetText') }}
					</el-button>
				</div>
			</el-scrollbar>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbSetingModern">
import { nextTick, onUnmounted, onMounted, computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
	Setting,
	RefreshLeft,
	Check,
	CopyDocument,
	RefreshRight,
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useChangeColor } from '/@/utils/theme';
import { Local } from '/@/utils/storage';
import Watermark from '/@/utils/wartermark';
import commonFunction from '/@/utils/commonFunction';
import mittBus from '/@/utils/mitt';
import { applyThemePreset, type ThemePreset } from '/@/utils/themePresets';

// 定义变量内容
const { locale } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { copyText } = commonFunction();
const { getLightColor, getDarkColor } = useChangeColor();

// 当前选中的预设
const currentPreset = ref('serenity');

// 主题预设列表
const themePresets: ThemePreset[] = [
	{ key: 'serenity', name: '静谧蓝', description: '专业、现代、冷静', colors: { primary: '#2563eb' }, preview: '#2563eb' },
	{ key: 'forest', name: '森之绿', description: '自然、平和、清新', colors: { primary: '#059669' }, preview: '#059669' },
	{ key: 'twilight', name: '暮光紫', description: '优雅、神秘、创意', colors: { primary: '#7c3aed' }, preview: '#7c3aed' },
	{ key: 'sunset', name: '日落橙', description: '温暖、活力、友好', colors: { primary: '#ea580c' }, preview: '#ea580c' },
	{ key: 'ocean', name: '海洋青', description: '清新、深邃、辽阔', colors: { primary: '#0891b2' }, preview: '#0891b2' },
	{ key: 'rose', name: '玫瑰红', description: '热情、优雅、浪漫', colors: { primary: '#e11d48' }, preview: '#e11d48' },
	{ key: 'dark', name: '深色模式', description: '护眼、沉浸、专业', colors: { primary: '#3b82f6' }, preview: '#1e293b', isDark: true },
];

// 布局选项
const layouts = [
	{
		value: 'defaults',
		label: '默认',
		icon: `<svg viewBox="0 0 48 36" class="layout-svg"><rect x="0" y="0" width="12" height="36" fill="var(--border-strong)"/><rect x="12" y="0" width="36" height="8" fill="var(--border-strong)"/><rect x="12" y="8" width="36" height="28" fill="var(--border-muted)"/></svg>`,
	},
	{
		value: 'classic',
		label: '经典',
		icon: `<svg viewBox="0 0 48 36" class="layout-svg"><rect x="0" y="0" width="48" height="8" fill="var(--border-strong)"/><rect x="0" y="8" width="12" height="28" fill="var(--border-strong)"/><rect x="12" y="8" width="36" height="28" fill="var(--border-muted)"/></svg>`,
	},
	{
		value: 'transverse',
		label: '横向',
		icon: `<svg viewBox="0 0 48 36" class="layout-svg"><rect x="0" y="0" width="48" height="8" fill="var(--border-strong)"/><rect x="0" y="8" width="48" height="28" fill="var(--border-muted)"/></svg>`,
	},
	{
		value: 'columns',
		label: '分栏',
		icon: `<svg viewBox="0 0 48 36" class="layout-svg"><rect x="0" y="0" width="6" height="36" fill="var(--border-base)"/><rect x="6" y="0" width="12" height="36" fill="var(--border-strong)"/><rect x="18" y="0" width="30" height="8" fill="var(--border-strong)"/><rect x="18" y="8" width="30" height="28" fill="var(--border-muted)"/></svg>`,
	},
];

const state = reactive({
	isMobile: false,
});

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

// 点击预设主题
const onPresetClick = (preset: ThemePreset) => {
	currentPreset.value = preset.key;

	// 应用预设主题
	applyThemePreset(preset.key, false);

	// 更新主题配置
	if (preset.colors.primary) {
		getThemeConfig.value.primary = preset.colors.primary;
	}

	// 更新深色模式
	if (preset.isDark) {
		getThemeConfig.value.isIsDark = true;
		onAddDarkChange();
	} else {
		getThemeConfig.value.isIsDark = false;
		onAddDarkChange();
	}

	setLocalThemeConfig();
};

// 重置主题
const onResetThemeClick = () => {
	currentPreset.value = 'serenity';
	getThemeConfig.value.primary = '#2563eb';
	getThemeConfig.value.menuBar = '#ffffff';
	getThemeConfig.value.menuBarColor = '#475569';
	getThemeConfig.value.topBar = '#ffffff';
	getThemeConfig.value.topBarColor = '#475569';
	getThemeConfig.value.isIsDark = false;

	onColorPickerChange();
	onBgColorPickerChange('menuBar');
	onBgColorPickerChange('menuBarColor');
	onBgColorPickerChange('topBar');
	onBgColorPickerChange('topBarColor');
	onAddDarkChange();

	setLocalThemeConfig();
	ElMessage.success('主题已重置');
};

// 1、全局主题
const onColorPickerChange = () => {
	if (!getThemeConfig.value.primary) return ElMessage.warning('全局主题 primary 颜色值不能为空');
	// 颜色加深
	document.documentElement.style.setProperty('--el-color-primary-dark-2', `${getDarkColor(getThemeConfig.value.primary, 0.1)}`);
	document.documentElement.style.setProperty('--el-color-primary', getThemeConfig.value.primary);
	// 颜色变浅
	for (let i = 1; i <= 9; i++) {
		document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(getThemeConfig.value.primary, i / 10)}`);
	}
	setDispatchThemeConfig();
};

// 2、菜单 / 顶栏
const onBgColorPickerChange = (bg: string) => {
	document.documentElement.style.setProperty(`--next-bg-${bg}`, themeConfig.value[bg]);
	if (bg === 'menuBar') {
		document.documentElement.style.setProperty(`--next-bg-menuBar-light-1`, getLightColor(getThemeConfig.value.menuBar, 0.05));
	}
	setLocalThemeConfig();
};

// 3、界面设置 --> 菜单水平折叠
const onThemeConfigChange = () => {
	setDispatchThemeConfig();
};

// 3、界面设置 --> 固定 Header
const onIsFixedHeaderChange = () => {
	getThemeConfig.value.isFixedHeaderChange = getThemeConfig.value.isFixedHeader ? false : true;
	setLocalThemeConfig();
};

// 4、界面显示 --> 面包屑 Breadcrumb
const onIsBreadcrumbChange = () => {
	if (getThemeConfig.value.layout === 'classic') {
		getThemeConfig.value.isClassicSplitMenu = false;
	}
	setLocalThemeConfig();
};

// 4、界面显示 --> 深色模式
const onAddDarkChange = () => {
	const body = document.documentElement as HTMLElement;
	if (getThemeConfig.value.isIsDark) {
		body.setAttribute('data-theme', 'dark');
		currentPreset.value = 'dark';
	} else {
		body.setAttribute('data-theme', '');
		if (currentPreset.value === 'dark') {
			currentPreset.value = 'serenity';
		}
	}
};

// 5、布局切换
const onSetLayout = (layout: string) => {
	Local.set('oldLayout', layout);
	if (getThemeConfig.value.layout === layout) return false;
	if (layout === 'transverse') getThemeConfig.value.isCollapse = false;
	getThemeConfig.value.layout = layout;
	getThemeConfig.value.isDrawer = false;
	initLayoutChangeFun();
};

// 设置布局切换函数
const initLayoutChangeFun = () => {
	onBgColorPickerChange('menuBar');
	onBgColorPickerChange('menuBarColor');
	onBgColorPickerChange('menuBarActiveColor');
	onBgColorPickerChange('topBar');
	onBgColorPickerChange('topBarColor');
	onBgColorPickerChange('columnsMenuBar');
	onBgColorPickerChange('columnsMenuBarColor');
};

// 关闭弹窗时
const onDrawerClose = () => {
	getThemeConfig.value.isFixedHeaderChange = false;
	getThemeConfig.value.isShowLogoChange = false;
	getThemeConfig.value.isDrawer = false;
	setLocalThemeConfig();
};

// 布局配置弹窗打开
const openDrawer = () => {
	getThemeConfig.value.isDrawer = true;
};

// 触发 store 布局配置更新
const setDispatchThemeConfig = () => {
	setLocalThemeConfig();
	setLocalThemeConfigStyle();
};

// 存储布局配置
const setLocalThemeConfig = () => {
	Local.remove('themeConfig');
	Local.set('themeConfig', getThemeConfig.value);
};

// 存储布局配置全局主题样式
const setLocalThemeConfigStyle = () => {
	Local.set('themeConfigStyle', document.documentElement.style.cssText);
};

// 一键复制配置
const onCopyConfigClick = () => {
	let copyThemeConfig = Local.get('themeConfig');
	copyThemeConfig.isDrawer = false;
	copyText(JSON.stringify(copyThemeConfig)).then(() => {
		getThemeConfig.value.isDrawer = false;
	});
};

// 一键恢复默认
const onResetConfigClick = () => {
	Local.clear();
	window.location.reload();
	// @ts-ignore
	Local.set('version', __VERSION__);
};

onMounted(() => {
	nextTick(() => {
		if (!Local.get('frequency')) initLayoutChangeFun();
		Local.set('frequency', 1);
		mittBus.on('layoutMobileResize', (res: any) => {
			getThemeConfig.value.layout = res.layout;
			getThemeConfig.value.isDrawer = false;
			initLayoutChangeFun();
			state.isMobile = true;
		});
		setTimeout(() => {
			onColorPickerChange();
			if (getThemeConfig.value.isIsDark) onAddDarkChange();
			if (Local.get('themeConfig')) locale.value = Local.get('themeConfig').globalI18n;
		}, 100);
	});
});

onUnmounted(() => {
	mittBus.off('layoutMobileResize', () => {});
});

// 暴露变量
defineExpose({
	openDrawer,
});
</script>

<style scoped lang="scss">
.layout-breadcrumb-seting-modern {
	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0;

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

		.header-actions {
			display: flex;
			gap: var(--spacing-2);
		}
	}

	.layout-breadcrumb-seting-bar {
		height: calc(100vh - 50px);
		padding: 0 var(--spacing-4);

		:deep(.el-scrollbar__view) {
			overflow-x: hidden !important;
		}

		.setting-section {
			margin-bottom: var(--spacing-6);

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

			.preset-grid {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: var(--spacing-2);

				.preset-card {
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: var(--spacing-2);
					background: var(--bg-surface);
					border: 2px solid var(--border-base);
					border-radius: var(--radius-lg);
					cursor: pointer;
					transition: all var(--duration-base) var(--ease-default);

					&:hover {
						border-color: var(--primary-base);
						transform: translateY(-2px);
						box-shadow: var(--shadow-md);
					}

					&.is-active {
						border-color: var(--primary-base);
						background: var(--primary-gradient-subtle);
						box-shadow: var(--shadow-focus);
					}

					&.is-dark {
						.preset-preview {
							background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
						}
					}

					.preset-preview {
						width: 36px;
						height: 36px;
						border-radius: var(--radius-md);
						margin-bottom: var(--spacing-2);
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						box-shadow: var(--shadow-sm);

						.preset-check {
							color: var(--text-on-primary);
							font-size: var(--text-lg);
						}
					}

					.preset-info {
						.preset-name {
							font-size: var(--text-xs);
							font-weight: var(--font-medium);
							color: var(--text-secondary);
						}
					}
				}
			}
		}

		:deep(.el-divider) {
			margin: var(--spacing-5) 0;

			.el-divider__text {
				background-color: transparent;
				padding: 0;

				.divider-label {
					font-size: var(--text-sm);
					font-weight: var(--font-semibold);
					color: var(--text-primary);
				}
			}
		}

		.setting-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: var(--spacing-3) 0;
			border-bottom: 1px solid var(--divider-base);

			&:last-child {
				border-bottom: none;
			}

			.setting-label {
				flex: 1;
				color: var(--text-secondary);
				font-size: var(--text-sm);
			}

			.setting-value {
				display: flex;
				align-items: center;
			}
		}

		.layout-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-3);

			.layout-item {
				padding: var(--spacing-3);
				background: var(--bg-surface);
				border: 2px solid var(--border-base);
				border-radius: var(--radius-lg);
				cursor: pointer;
				transition: all var(--duration-base) var(--ease-default);
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: var(--spacing-2);

				&:hover {
					border-color: var(--primary-base);
				}

				&.is-active {
					border-color: var(--primary-base);
					background: var(--primary-gradient-subtle);
				}

				.layout-preview {
					width: 48px;
					height: 36px;
					border-radius: var(--radius-sm);

					:deep(.layout-svg) {
						width: 100%;
						height: 100%;
					}
				}

				.layout-name {
					font-size: var(--text-xs);
					color: var(--text-secondary);
				}
			}
		}

		.setting-actions {
			margin-top: var(--spacing-5);
			display: flex;
			flex-direction: column;
			gap: var(--spacing-2);

			.action-btn {
				width: 100%;
			}
		}
	}
}

// 深色模式适配
[data-theme='dark'] {
	.layout-breadcrumb-seting-modern {
		:deep(.theme-settings-drawer) {
			.el-drawer {
				background: var(--bg-surface);
			}
		}

		.preset-card {
			background: var(--bg-elevated) !important;

			&.is-active {
				background: var(--primary-gradient-strong) !important;
			}
		}

		.layout-item {
			background: var(--bg-elevated) !important;

			&.is-active {
				background: var(--primary-gradient-strong) !important;
			}
		}
	}
}
</style>
