/**
 * 主题预设类型定义
 */

export interface ThemePreset {
	/** 主题名称 */
	name: string;
	/** 主题描述 */
	description: string;
	/** 主题标识 */
	key: string;
	/** 颜色配置 */
	colors: {
		/** 主色调 */
		primary: string;
		/** 主色悬浮 */
		primaryHover?: string;
		/** 主色激活 */
		primaryActive?: string;
		/** 成功色 */
		success?: string;
		/** 警告色 */
		warning?: string;
		/** 危险色 */
		danger?: string;
		/** 信息色 */
		info?: string;
	};
	/** 中性色配置 */
	neutral?: {
		/** 页面背景 */
		bgPage?: string;
		/** 表面背景 */
		bgSurface?: string;
		/** 边框色 */
		borderBase?: string;
		/** 主要文字 */
		textPrimary?: string;
	};
	/** Element Plus 主题配置 */
	element?: {
		primary?: string;
		success?: string;
		warning?: string;
		danger?: string;
		info?: string;
	};
	/** 是否为深色主题 */
	isDark?: boolean;
	/** 预览色 */
	preview?: string;
}

export interface ThemePresetListItem {
	key: string;
	name: string;
	description: string;
	preview: string;
}

export interface ThemeConfigExport {
	preset: string;
	custom: {
		primary: string;
		isDark: boolean;
	};
}

/**
 * 应用主题预设
 * @param presetKey 主题预设键名
 * @param updateConfig 是否更新主题配置
 */
export declare function applyThemePreset(presetKey: string, updateConfig?: boolean): boolean;

/**
 * 获取当前应用的主题键名
 */
export declare function getCurrentPresetKey(): string | null;

/**
 * 获取主题列表
 */
export declare function getThemePresetList(): ThemePresetListItem[];

/**
 * 导出主题配置为 JSON
 */
export declare function exportThemeConfig(): string;

/**
 * 从 JSON 导入主题配置
 */
export declare function importThemeConfig(config: string): boolean;

declare const themePresets: Record<string, ThemePreset>;

export default {
	themePresets,
	applyThemePreset,
	getCurrentPresetKey,
	getThemePresetList,
	exportThemeConfig,
	importThemeConfig,
};
