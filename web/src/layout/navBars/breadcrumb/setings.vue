<template>
	<div class="layout-breadcrumb-seting">
		<el-drawer
			:title="$t('message.layout.configTitle')"
			v-model="getThemeConfig.isDrawer"
			direction="rtl"
			destroy-on-close
			size="320px"
			@close="onDrawerClose"
		>
			<el-scrollbar class="layout-breadcrumb-seting-bar">
				<!-- 全局主题 -->
				<el-divider content-position="left">{{ $t('message.layout.oneTitle') }}</el-divider>

				<!-- 4个固定预设主题 -->
				<div class="layout-preset-theme">
					<div class="layout-preset-header">
						<span class="layout-preset-title">{{ $t('message.layout.presetTitle') }}</span>
					</div>
					<div class="layout-preset-grid">
						<button
							type="button"
							v-for="preset in themePresets"
							:key="preset.key"
							class="layout-preset-item"
							:class="{ 'is-active': getThemeConfig.themePreset === preset.key }"
							:aria-pressed="getThemeConfig.themePreset === preset.key"
							:data-preset="preset.key"
							@click="onSelectPresetTheme(preset)"
						>
							<span class="preset-preview" :style="presetPreview(preset)" aria-hidden="true">
								<span class="preset-preview-sidebar"><i></i><i></i><i></i></span>
								<span class="preset-preview-content"><i></i><i></i><i></i><b></b></span>
							</span>
							<div class="preset-meta">
								<span class="preset-name">{{ $t(preset.nameI18nKey) }}</span>
								<span class="preset-sub">{{ $t(preset.descriptionI18nKey) }}</span>
							</div>
						</button>
					</div>
				</div>

				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.customColor') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker v-model="getThemeConfig.primary" size="default" @change="onColorPickerChange"> </el-color-picker>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsDark') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isIsDark" :aria-label="$t('message.layout.fourIsDark')" size="small" @change="onAddDarkChange"></el-switch>
					</div>
				</div>

				<!-- 顶栏设置 -->
				<el-divider content-position="left">{{ $t('message.layout.twoTopTitle') }}</el-divider>
				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoTopBar') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker v-model="getThemeConfig.topBar" size="default" @change="onBgColorPickerChange('topBar')"> </el-color-picker>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoTopBarColor') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker v-model="getThemeConfig.topBarColor" size="default" @change="onBgColorPickerChange('topBarColor')"> </el-color-picker>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt10">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoIsTopBarColorGradual') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isTopBarColorGradual" size="small" @change="onTopBarGradualChange"></el-switch>
					</div>
				</div>

				<!-- 菜单设置 -->
				<el-divider content-position="left">{{ $t('message.layout.twoMenuTitle') }}</el-divider>
				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoMenuBar') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker v-model="getThemeConfig.menuBar" size="default" @change="onBgColorPickerChange('menuBar')"> </el-color-picker>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoMenuBarColor') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker v-model="getThemeConfig.menuBarColor" size="default" @change="onBgColorPickerChange('menuBarColor')"> </el-color-picker>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoMenuBarActiveColor') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-color-picker
							v-model="getThemeConfig.menuBarActiveColor"
							size="default"
							show-alpha
							@change="onBgColorPickerChange('menuBarActiveColor')"
						/>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt14">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.twoIsMenuBarColorGradual') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isMenuBarColorGradual" size="small" @change="onMenuBarGradualChange"></el-switch>
					</div>
				</div>

				<!-- 界面设置 -->
				<el-divider content-position="left">{{ $t('message.layout.threeTitle') }}</el-divider>
				<div class="layout-breadcrumb-seting-bar-flex" :style="{ opacity: getThemeConfig.layout === 'transverse' ? 0.5 : 1 }">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.threeIsCollapse') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch
							v-model="getThemeConfig.isCollapse"
							:disabled="getThemeConfig.layout === 'transverse'"
							size="small"
							@change="onThemeConfigChange"
						></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15" :style="{ opacity: getThemeConfig.layout === 'transverse' ? 0.5 : 1 }">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.threeIsUniqueOpened') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch
							v-model="getThemeConfig.isUniqueOpened"
							:disabled="getThemeConfig.layout === 'transverse'"
							size="small"
							@change="setLocalThemeConfig"
						></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.threeIsFixedHeader') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isFixedHeader" size="small" @change="onIsFixedHeaderChange"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.threeIsLockScreen') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isLockScreen" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt11">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.threeLockScreenTime') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-input-number
							v-model="getThemeConfig.lockScreenTime"
							controls-position="right"
							:min="1"
							:max="9999"
							@change="setLocalThemeConfig"
							size="default"
							style="width: 90px"
						>
						</el-input-number>
					</div>
				</div>

				<!-- 界面显示 -->
				<el-divider content-position="left">{{ $t('message.layout.fourTitle') }}</el-divider>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsShowLogo') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isShowLogo" size="small" @change="onIsShowLogoChange"></el-switch>
					</div>
				</div>
				<div
					class="layout-breadcrumb-seting-bar-flex mt15"
					:style="{ opacity: getThemeConfig.layout === 'transverse' ? 0.5 : 1 }"
				>
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsBreadcrumb') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch
							v-model="getThemeConfig.isBreadcrumb"
							:disabled="getThemeConfig.layout === 'transverse'"
							size="small"
							@change="onIsBreadcrumbChange"
						></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsBreadcrumbIcon') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isBreadcrumbIcon" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsTagsview') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isTagsview" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsTagsviewIcon') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isTagsviewIcon" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsCacheTagsView') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isCacheTagsView" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15" :style="{ opacity: state.isMobile ? 0.5 : 1 }">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsSortableTagsView') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch
							v-model="getThemeConfig.isSortableTagsView"
							:disabled="state.isMobile ? true : false"
							size="small"
							@change="onSortableTagsViewChange"
						></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsShareTagsView') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isShareTagsView" size="small" @change="onShareTagsViewChange"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsFooter') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isFooter" size="small" @change="setLocalThemeConfig"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsGrayscale') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isGrayscale" size="small" @change="onAddFilterChange('grayscale')"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsInvert') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isInvert" size="small" @change="onAddFilterChange('invert')"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourIsWartermark') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-switch v-model="getThemeConfig.isWartermark" size="small" @change="onWartermarkChange"></el-switch>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt14">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fourWartermarkText') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-input v-model="getThemeConfig.wartermarkText" size="default" style="width: 90px" @input="onWartermarkTextInput"></el-input>
					</div>
				</div>

				<!-- 其它设置 -->
				<el-divider content-position="left">{{ $t('message.layout.fiveTitle') }}</el-divider>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fiveTagsStyle') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-select v-model="getThemeConfig.tagsStyle" :placeholder="$t('message.layout.selectPlaceholder')" size="default" style="width: 115px" @change="setLocalThemeConfig">
							<el-option :label="$t('message.layout.styleSimple')" value="tags-style-shadcn"></el-option>
							<el-option :label="$t('message.layout.styleCard')" value="tags-style-one"></el-option>
							<el-option :label="$t('message.layout.styleUnderline')" value="tags-style-four"></el-option>
							<el-option :label="$t('message.layout.styleArc')" value="tags-style-five"></el-option>
						</el-select>
					</div>
				</div>
				<div class="layout-breadcrumb-seting-bar-flex mt15">
					<div class="layout-breadcrumb-seting-bar-flex-label">{{ $t('message.layout.fiveAnimation') }}</div>
					<div class="layout-breadcrumb-seting-bar-flex-value">
						<el-select v-model="getThemeConfig.animation" :placeholder="$t('message.layout.selectPlaceholder')" size="default" style="width: 90px" @change="setLocalThemeConfig">
							<el-option label="slide-right" value="slide-right"></el-option>
							<el-option label="slide-left" value="slide-left"></el-option>
							<el-option label="opacitys" value="opacitys"></el-option>
						</el-select>
					</div>
				</div>

				<!-- 布局切换 -->
				<el-divider content-position="left">{{ $t('message.layout.sixTitle') }}</el-divider>
				<div class="layout-drawer-content-flex">
					<!-- defaults 布局 -->
					<div class="layout-drawer-content-item" @click="onSetLayout('defaults')">
						<section class="el-container el-circular" :class="{ 'drawer-layout-active': getThemeConfig.layout === 'defaults' }">
							<aside class="el-aside" style="width: 20px"></aside>
							<section class="el-container is-vertical">
								<header class="el-header" style="height: 10px"></header>
								<main class="el-main"></main>
							</section>
						</section>
						<div class="layout-tips-warp" :class="{ 'layout-tips-warp-active': getThemeConfig.layout === 'defaults' }">
							<div class="layout-tips-box">
								<p class="layout-tips-txt">{{ $t('message.layout.sixDefaults') }}</p>
							</div>
						</div>
					</div>
					<!-- transverse 布局 -->
					<div class="layout-drawer-content-item" @click="onSetLayout('transverse')">
						<section class="el-container is-vertical el-circular" :class="{ 'drawer-layout-active': getThemeConfig.layout === 'transverse' }">
							<header class="el-header" style="height: 10px"></header>
							<section class="el-container">
								<section class="el-container is-vertical">
									<main class="el-main"></main>
								</section>
							</section>
						</section>
						<div class="layout-tips-warp" :class="{ 'layout-tips-warp-active': getThemeConfig.layout === 'transverse' }">
							<div class="layout-tips-box">
								<p class="layout-tips-txt">{{ $t('message.layout.sixTransverse') }}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="copy-config">
					<el-alert :title="$t('message.layout.tipText')" type="warning" :closable="false"> </el-alert>
					<el-button size="default" class="copy-config-btn" type="primary" ref="copyConfigBtnRef" @click="onCopyConfigClick">
						<el-icon class="mr5">
							<ele-CopyDocument />
						</el-icon>
						{{ $t('message.layout.copyText') }}
					</el-button>
					<el-button size="default" class="copy-config-btn-reset" type="info" @click="onResetConfigClick">
						<el-icon class="mr5">
							<ele-RefreshRight />
						</el-icon>
						{{ $t('message.layout.resetText') }}
					</el-button>
				</div>
			</el-scrollbar>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbSeting">
import { nextTick, onUnmounted, onMounted, computed, reactive } from 'vue';
import { warningMessage } from '/@/utils/message';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useChangeColor } from '/@/utils/theme';
import { verifyAndSpace } from '/@/utils/toolsValidate';
import { Local } from '/@/utils/storage';
import Watermark from '/@/utils/wartermark';
import commonFunction from '/@/utils/commonFunction';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';
import { createEventSubscriptions } from '/@/shared/access/eventSubscriptions';
import { applyTheme } from '/@/shared/access/theme';
import { themePresets, presetAppearance, changeThemeMode, type ThemePreset } from '/@/shared/access/themePresets';
const events = createEventSubscriptions(mittBus);
onUnmounted(() => events.clear());

// 定义变量内容
const { locale } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { copyText } = commonFunction();
const { getLightColor } = useChangeColor();
const state = reactive({
	isMobile: false,
});

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});
const presetPreview = (preset: ThemePreset) => {
	const palette = preset.defaultDark ? preset.dark : preset.light;
	return {
		'--preset-canvas': palette.canvas, '--preset-sidebar': palette.sidebar,
		'--preset-text': palette.text, '--preset-border': palette.border, '--preset-primary': palette.primary,
	};
};

const onSelectPresetTheme = (preset: ThemePreset) => {
	Object.assign(getThemeConfig.value, presetAppearance(preset.key));
	setDispatchThemeConfig();
};

// 1、全局主题
const onColorPickerChange = () => {
	if (!getThemeConfig.value.primary) return warningMessage('全局主题 primary 颜色值不能为空');
	setDispatchThemeConfig();
};
// 2、菜单 / 顶栏
const onBgColorPickerChange = (bg: string) => {
	document.documentElement.style.setProperty(`--next-bg-${bg}`, (themeConfig.value as Record<string, any>)[bg]);
	if (bg === 'menuBar') {
		document.documentElement.style.setProperty(`--next-bg-menuBar-light-1`, getLightColor(getThemeConfig.value.menuBar, 0.05));
	}
	onTopBarGradualChange();
	onMenuBarGradualChange();
	setDispatchThemeConfig();
};
// 2、菜单 / 顶栏 --> 顶栏背景渐变
const onTopBarGradualChange = () => {
	setGraduaFun('.layout-navbars-breadcrumb-index', getThemeConfig.value.isTopBarColorGradual, getThemeConfig.value.topBar);
};
// 2、菜单 / 顶栏 --> 菜单背景渐变
const onMenuBarGradualChange = () => {
	setGraduaFun('.layout-container .el-aside', getThemeConfig.value.isMenuBarColorGradual, getThemeConfig.value.menuBar);
};
// 2、菜单 / 顶栏 --> 背景渐变函数
const setGraduaFun = (el: string, bool: boolean, color: string) => {
	setTimeout(() => {
		let els = document.querySelector(el);
		if (!els) return false;
		document.documentElement.style.setProperty('--el-menu-bg-color', document.documentElement.style.getPropertyValue('--next-bg-menuBar'));
		if (bool) els.setAttribute('style', `background:linear-gradient(to bottom left , ${color}, ${getLightColor(color, 0.6)}) !important;`);
		else els.setAttribute('style', ``);
		setLocalThemeConfig();
	}, 200);
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
// 4、界面显示 --> 侧边栏 Logo
const onIsShowLogoChange = () => {
	getThemeConfig.value.isShowLogoChange = getThemeConfig.value.isShowLogo ? false : true;
	setLocalThemeConfig();
};
// 4、界面显示 --> 面包屑 Breadcrumb
const onIsBreadcrumbChange = () => {
	setLocalThemeConfig();
};
// 4、界面显示 --> 开启 TagsView 拖拽
const onSortableTagsViewChange = () => {
	mittBus.emit('openOrCloseSortable');
	setLocalThemeConfig();
};
// 4、界面显示 --> 开启 TagsView 共用
const onShareTagsViewChange = () => {
	mittBus.emit('openShareTagsView');
	setLocalThemeConfig();
};
// 4、界面显示 --> 灰色模式/色弱模式
const onAddFilterChange = (attr: string) => {
	if (attr === 'grayscale') {
		if (getThemeConfig.value.isGrayscale) getThemeConfig.value.isInvert = false;
	} else {
		if (getThemeConfig.value.isInvert) getThemeConfig.value.isGrayscale = false;
	}
	const cssAttr =
		attr === 'grayscale' ? `grayscale(${getThemeConfig.value.isGrayscale ? 1 : 0})` : `invert(${getThemeConfig.value.isInvert ? '80%' : '0%'})`;
	const appEle = document.body;
	appEle.setAttribute('style', `filter: ${cssAttr}`);
	setLocalThemeConfig();
};
// 4、界面显示 --> 深色模式
// 同时切换 [data-theme]（应用令牌层）与 html.dark（Element Plus 官方暗色变量），
// themeConfig.isIsDark 是唯一事实来源，index.html 的首帧脚本读的也是同一个值。
const onAddDarkChange = () => {
	changeThemeMode(getThemeConfig.value, getThemeConfig.value.isIsDark);
	setDispatchThemeConfig();
};
// 4、界面显示 --> 开启水印
const onWartermarkChange = () => {
	getThemeConfig.value.isWartermark ? Watermark.set(getThemeConfig.value.wartermarkText) : Watermark.del();
	setLocalThemeConfig();
};
// 4、界面显示 --> 水印文案
const onWartermarkTextInput = (val: string) => {
	getThemeConfig.value.wartermarkText = verifyAndSpace(val);
	if (getThemeConfig.value.wartermarkText === '') return false;
	if (getThemeConfig.value.isWartermark) Watermark.set(getThemeConfig.value.wartermarkText);
	setLocalThemeConfig();
};
// 5、布局切换
const onSetLayout = (layout: 'defaults' | 'transverse') => {
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
};
// 关闭弹窗时，初始化变量。变量用于处理 layoutScrollbarRef.value.update() 更新滚动条高度
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
	applyTheme(getThemeConfig.value);
	setLocalThemeConfig();
};
// 存储布局配置
const setLocalThemeConfig = () => {
	Local.remove('themeConfig');
	Local.set('themeConfig', getThemeConfig.value);
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
	storesThemeConfig.$reset();
	document.body.style.removeProperty('filter');
	Watermark.del();
	locale.value = getThemeConfig.value.globalI18n;
	Local.set('oldLayout', getThemeConfig.value.layout);
	initSetStyle();
	setDispatchThemeConfig();
};
// 初始化菜单样式等
const initSetStyle = () => {
	// 2、菜单 / 顶栏 --> 顶栏背景渐变
	onTopBarGradualChange();
	// 2、菜单 / 顶栏 --> 菜单背景渐变
	onMenuBarGradualChange();
};
onMounted(() => {
	nextTick(() => {
		// 判断当前布局是否不相同，不相同则初始化当前布局的样式，防止监听窗口大小改变时，布局配置logo、菜单背景等部分布局失效问题
		if (!Local.get('frequency')) initLayoutChangeFun();
		Local.set('frequency', 1);
		// 监听窗口大小改变，非默认布局，设置成默认布局（适配移动端）
		events.on('layoutMobileResize', (res: LayoutMobileResize) => {
			getThemeConfig.value.layout = res.layout;
			getThemeConfig.value.isDrawer = false;
			initLayoutChangeFun();
			state.isMobile = other.isMobile();
		});
		setTimeout(() => {
			// 默认样式
			onColorPickerChange();
			// 灰色模式
			if (getThemeConfig.value.isGrayscale) onAddFilterChange('grayscale');
			// 色弱模式
			if (getThemeConfig.value.isInvert) onAddFilterChange('invert');
			// 深色模式
			if (getThemeConfig.value.isIsDark) onAddDarkChange();
			// 开启水印
			onWartermarkChange();
			// 语言国际化
			if (Local.get('themeConfig')) locale.value = Local.get('themeConfig').globalI18n;
			// 初始化菜单样式等
			initSetStyle();
		}, 100);
	});
});
onUnmounted(() => {
});

// 暴露变量
defineExpose({
	openDrawer,
});
</script>

<style scoped lang="scss">
.layout-breadcrumb-seting-bar {
	height: calc(100vh - 50px);
	padding: 0 15px;
	:deep(.el-scrollbar__view) {
		overflow-x: hidden !important;
	}
	.layout-preset-theme {
		margin-bottom: 14px;
		.layout-preset-header {
			font-size: 12px;
			color: var(--admin-muted);
			margin-bottom: 8px;
		}
		.layout-preset-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}
		.layout-preset-item {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			min-width: 0;
			gap: 8px;
			padding: 9px;
			font: inherit;
			text-align: left;
			border: 1px solid var(--admin-border);
			border-radius: 6px;
			background: var(--admin-surface);
			cursor: pointer;
			transition: all 0.2s ease;
			user-select: none;

			&:hover {
				border-color: var(--el-color-primary);
				background: var(--admin-hover);
			}

			&.is-active {
				border-color: var(--el-color-primary);
				background: var(--admin-surface);

				.preset-name {
					color: var(--el-color-primary);
					font-weight: 500;
				}
			}

			.preset-preview {
				display: flex;
				height: 55px;
				border: 1px solid var(--preset-border);
				border-radius: 4px;
				overflow: hidden;
				background: var(--preset-canvas);
			}
			.preset-preview-sidebar {
				width: 25%;
				padding: 10px 4px;
				background: var(--preset-sidebar);
				border-right: 1px solid var(--preset-border);
				i { display: block; height: 3px; background: var(--preset-border); margin-bottom: 5px; }
				i:nth-child(2) { background: var(--preset-primary); }
			}
			.preset-preview-content {
				flex: 1;
				padding: 10px;
				i { display: block; height: 2px; margin-bottom: 5px; background: var(--preset-border); }
				i:first-child { width: 45%; background: var(--preset-text); height: 3px; }
				b { display: block; width: 25%; height: 6px; margin-left: auto; border-radius: 2px; background: var(--preset-primary); }
			}

			.preset-meta {
				display: flex;
				flex-direction: column;
				overflow: hidden;

				.preset-name {
					font-size: 12px;
					line-height: 1.2;
					color: var(--admin-text);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.preset-sub {
					font-size: 11px;
					line-height: 1.4;
					color: var(--admin-muted);
					margin-top: 4px;
				}
			}
		}
	}
	.layout-breadcrumb-seting-bar-flex {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		&-label {
			flex: 1;
			color: var(--el-text-color-primary);
		}
	}
	.layout-drawer-content-flex {
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		margin: 0 -5px;
		.layout-drawer-content-item {
			width: 50%;
			height: 70px;
			cursor: pointer;
			border: 1px solid transparent;
			position: relative;
			padding: 5px;
			.el-container {
				height: 100%;
				.el-aside-dark {
					background-color: var(--next-color-seting-header);
				}
				.el-aside {
					background-color: var(--next-color-seting-aside);
				}
				.el-header {
					background-color: var(--next-color-seting-header);
				}
				.el-main {
					background-color: var(--next-color-seting-main);
				}
			}
			.el-circular {
				border-radius: 2px;
				overflow: hidden;
				border: 1px solid transparent;
				transition: all 0.3s ease-in-out;
			}
			.drawer-layout-active {
				border: 1px solid;
				border-color: var(--el-color-primary);
			}
			.layout-tips-warp,
			.layout-tips-warp-active {
				transition: all 0.3s ease-in-out;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				border: 1px solid;
				border-color: var(--el-color-primary-light-5);
				border-radius: 100%;
				padding: 4px;
				.layout-tips-box {
					transition: inherit;
					width: 30px;
					height: 30px;
					z-index: 9;
					border: 1px solid;
					border-color: var(--el-color-primary-light-5);
					border-radius: 100%;
					.layout-tips-txt {
						transition: inherit;
						position: relative;
						top: 5px;
						font-size: 12px;
						line-height: 1;
						letter-spacing: 2px;
						white-space: nowrap;
						color: var(--el-color-primary-light-5);
						text-align: center;
						transform: rotate(30deg);
						left: -1px;
						background-color: var(--next-color-seting-main);
						width: 32px;
						height: 17px;
						line-height: 17px;
					}
				}
			}
			.layout-tips-warp-active {
				border: 1px solid;
				border-color: var(--el-color-primary);
				.layout-tips-box {
					border: 1px solid;
					border-color: var(--el-color-primary);
					.layout-tips-txt {
						color: var(--el-color-primary) !important;
						background-color: var(--next-color-seting-main) !important;
					}
				}
			}
			&:hover {
				.el-circular {
					transition: all 0.3s ease-in-out;
					border: 1px solid;
					border-color: var(--el-color-primary);
				}
				.layout-tips-warp {
					transition: all 0.3s ease-in-out;
					border-color: var(--el-color-primary);
					.layout-tips-box {
						transition: inherit;
						border-color: var(--el-color-primary);
						.layout-tips-txt {
							transition: inherit;
							color: var(--el-color-primary) !important;
							background-color: var(--next-color-seting-main) !important;
						}
					}
				}
			}
		}
	}
	.copy-config {
		margin: 10px 0;
		.copy-config-btn {
			width: 100%;
			margin-top: 15px;
		}
		.copy-config-btn-reset {
			width: 100%;
			margin: 10px 0 0;
		}
	}
}
</style>
