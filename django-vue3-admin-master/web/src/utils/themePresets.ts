/**
 * 主题预设配置
 * 用于快速切换不同配色方案
 */

// ============================================
// 一、主题预设类型定义
// ============================================

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

// ============================================
// 二、主题预设列表
// ============================================

export const themePresets: Record<string, ThemePreset> = {
	// 默认主题 - 静谧蓝
	serenity: {
		name: '静谧蓝',
		description: '专业、现代、冷静',
		key: 'serenity',
		colors: {
			primary: '#2563eb',
			primaryHover: '#1d4ed8',
			primaryActive: '#1e40af',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#fafbfc',
			bgSurface: '#ffffff',
			borderBase: '#e2e8f0',
			textPrimary: '#0f172a',
		},
		preview: '#2563eb',
	},

	// 森之绿
	forest: {
		name: '森之绿',
		description: '自然、平和、清新',
		key: 'forest',
		colors: {
			primary: '#059669',
			primaryHover: '#047857',
			primaryActive: '#065f46',
			success: '#047857',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#f0fdf4',
			bgSurface: '#ffffff',
			borderBase: '#d1fae5',
			textPrimary: '#14532d',
		},
		preview: '#059669',
	},

	// 暮光紫
	twilight: {
		name: '暮光紫',
		description: '优雅、神秘、创意',
		key: 'twilight',
		colors: {
			primary: '#7c3aed',
			primaryHover: '#6d28d9',
			primaryActive: '#5b21b6',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#faf5ff',
			bgSurface: '#ffffff',
			borderBase: '#e9d5ff',
			textPrimary: '#1e1b4b',
		},
		preview: '#7c3aed',
	},

	// 日落橙
	sunset: {
		name: '日落橙',
		description: '温暖、活力、友好',
		key: 'sunset',
		colors: {
			primary: '#ea580c',
			primaryHover: '#c2410c',
			primaryActive: '#9a3412',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#fff7ed',
			bgSurface: '#ffffff',
			borderBase: '#ffedd5',
			textPrimary: '#1c1917',
		},
		preview: '#ea580c',
	},

	// 海洋青
	ocean: {
		name: '海洋青',
		description: '清新、深邃、辽阔',
		key: 'ocean',
		colors: {
			primary: '#0891b2',
			primaryHover: '#0e7490',
			primaryActive: '#155e75',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0e7490',
		},
		neutral: {
			bgPage: '#f0fdfa',
			bgSurface: '#ffffff',
			borderBase: '#ccfbf1',
			textPrimary: '#134e4a',
		},
		preview: '#0891b2',
	},

	// 玫瑰红
	rose: {
		name: '玫瑰红',
		description: '热情、优雅、浪漫',
		key: 'rose',
		colors: {
			primary: '#e11d48',
			primaryHover: '#be123c',
			primaryActive: '#9f1239',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#fff1f2',
			bgSurface: '#ffffff',
			borderBase: '#ffe4e6',
			textPrimary: '#1c1917',
		},
		preview: '#e11d48',
	},

	// 柠檬黄
	lemon: {
		name: '柠檬黄',
		description: '明亮、愉悦、活力',
		key: 'lemon',
		colors: {
			primary: '#ca8a04',
			primaryHover: '#a16207',
			primaryActive: '#854d0e',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#fefce8',
			bgSurface: '#ffffff',
			borderBase: '#fef9c3',
			textPrimary: '#1c1917',
		},
		preview: '#ca8a04',
	},

	// 石墨灰（极简）
	graphite: {
		name: '石墨灰',
		description: '极简、纯粹、经典',
		key: 'graphite',
		colors: {
			primary: '#374151',
			primaryHover: '#1f2937',
			primaryActive: '#111827',
			success: '#059669',
			warning: '#d97706',
			danger: '#dc2626',
			info: '#0891b2',
		},
		neutral: {
			bgPage: '#ffffff',
			bgSurface: '#ffffff',
			borderBase: '#e5e7eb',
			textPrimary: '#000000',
		},
		preview: '#374151',
	},

	// 深色模式预设
	dark: {
		name: '深色模式',
		description: '护眼、沉浸、专业',
		key: 'dark',
		colors: {
			primary: '#3b82f6',
			primaryHover: '#60a5fa',
			primaryActive: '#2563eb',
			success: '#10b981',
			warning: '#f59e0b',
			danger: '#ef4444',
			info: '#06b6d4',
		},
		neutral: {
			bgPage: '#0f172a',
			bgSurface: '#1e293b',
			borderBase: '#334155',
			textPrimary: '#f1f5f9',
		},
		isDark: true,
		preview: '#1e293b',
	},
};

// ============================================
// 三、主题切换工具函数
// ============================================

/**
 * 应用主题预设
 * @param presetKey 主题预设键名
 * @param updateConfig 是否更新主题配置（默认 true）
 */
export function applyThemePreset(presetKey: string, updateConfig = true): boolean {
	const preset = themePresets[presetKey];
	if (!preset) {
		console.warn(`[ThemePresets] 主题预设 "${presetKey}" 不存在`);
		return false;
	}

	const root = document.documentElement;

	// 应用主色系
	applyColor(root, '--primary-base', preset.colors.primary);
	applyColor(root, '--primary-hover', preset.colors.primaryHover || adjustBrightness(preset.colors.primary, -10));
	applyColor(root, '--primary-active', preset.colors.primaryActive || adjustBrightness(preset.colors.primary, -20));
	applyColor(root, '--primary-light', adjustBrightness(preset.colors.primary, 10));
	applyColor(root, '--primary-lighter', adjustBrightness(preset.colors.primary, 20));

	// 应用功能色
	if (preset.colors.success) {
		applyColor(root, '--success-base', preset.colors.success);
		applyColor(root, '--el-color-success', preset.colors.success);
	}
	if (preset.colors.warning) {
		applyColor(root, '--warning-base', preset.colors.warning);
		applyColor(root, '--el-color-warning', preset.colors.warning);
	}
	if (preset.colors.danger) {
		applyColor(root, '--danger-base', preset.colors.danger);
		applyColor(root, '--el-color-danger', preset.colors.danger);
	}
	if (preset.colors.info) {
		applyColor(root, '--info-base', preset.colors.info);
		applyColor(root, '--el-color-info', preset.colors.info);
	}

	// 应用中性色
	if (preset.neutral) {
		if (preset.neutral.bgPage) {
			applyColor(root, '--bg-page', preset.neutral.bgPage);
			applyColor(root, '--next-bg-main-color', preset.neutral.bgPage);
		}
		if (preset.neutral.bgSurface) {
			applyColor(root, '--bg-surface', preset.neutral.bgSurface);
			applyColor(root, '--next-color-white', preset.neutral.bgSurface);
		}
		if (preset.neutral.borderBase) {
			applyColor(root, '--border-base', preset.neutral.borderBase);
			applyColor(root, '--next-border-color-light', preset.neutral.borderBase);
		}
		if (preset.neutral.textPrimary) {
			applyColor(root, '--text-primary', preset.neutral.textPrimary);
		}
	}

	// 应用 Element Plus 颜色
	applyColor(root, '--el-color-primary', preset.colors.primary);

	// 生成 Element Plus 颜色变体
	generateElementColorVariants(preset.colors.primary);

	// 处理深色模式
	if (preset.isDark) {
		root.setAttribute('data-theme', 'dark');
	} else {
		root.removeAttribute('data-theme');
	}

	// 更新主题配置（如果需要）
	if (updateConfig && typeof window !== 'undefined') {
		const event = new CustomEvent('theme-preset-applied', {
			detail: { preset, presetKey },
		});
		window.dispatchEvent(event);
	}

	console.log(`[ThemePresets] 已应用主题: ${preset.name}`);
	return true;
}

/**
 * 应用单个颜色变量
 */
function applyColor(element: HTMLElement, property: string, value: string): void {
	if (value) {
		element.style.setProperty(property, value);
	}
}

/**
 * 调整颜色亮度
 * @param color HEX 颜色值
 * @param percent 亮度调整百分比（正数变亮，负数变暗）
 */
function adjustBrightness(color: string, percent: number): string {
	const num = parseInt(color.replace('#', ''), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
	return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * 生成 Element Plus 颜色变体
 */
function generateElementColorVariants(baseColor: string): void {
	const root = document.documentElement;

	// 生成 light-1 到 light-9
	for (let i = 1; i <= 9; i++) {
		const lightColor = mixWithWhite(baseColor, i * 0.1);
		root.style.setProperty(`--el-color-primary-light-${i}`, lightColor);
	}

	// 生成 dark-2
	const darkColor = adjustBrightness(baseColor, -20);
	root.style.setProperty('--el-color-primary-dark-2', darkColor);
}

/**
 * 颜色与白色混合
 */
function mixWithWhite(color: string, whiteRatio: number): string {
	const num = parseInt(color.replace('#', ''), 16);
	const R = (num >> 16) & 0xff;
	const G = (num >> 8) & 0xff;
	const B = num & 0xff;

	const newR = Math.round(R + (255 - R) * whiteRatio);
	const newG = Math.round(G + (255 - G) * whiteRatio);
	const newB = Math.round(B + (255 - B) * whiteRatio);

	return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
}

/**
 * 获取当前应用的主题键名
 */
export function getCurrentPresetKey(): string | null {
	const root = document.documentElement;
	const primaryColor = root.style.getPropertyValue('--primary-base');

	for (const [key, preset] of Object.entries(themePresets)) {
		if (preset.colors.primary.toLowerCase() === primaryColor?.toLowerCase()) {
			return key;
		}
	}

	return null;
}

/**
 * 获取主题列表（用于设置面板）
 */
export function getThemePresetList(): Array<{
	key: string;
	name: string;
	description: string;
	preview: string;
}> {
	return Object.values(themePresets).map((preset) => ({
		key: preset.key,
		name: preset.name,
		description: preset.description,
		preview: preset.preview || preset.colors.primary,
	}));
}

/**
 * 导出主题配置为 JSON
 */
export function exportThemeConfig(): string {
	const currentKey = getCurrentPresetKey();
	const preset = currentKey ? themePresets[currentKey] : themePresets.serenity;

	return JSON.stringify(
		{
			preset: currentKey || 'serenity',
			custom: {
				primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-base').trim(),
				isDark: document.documentElement.getAttribute('data-theme') === 'dark',
			},
		},
		null,
		2
	);
}

/**
 * 从 JSON 导入主题配置
 */
export function importThemeConfig(config: string): boolean {
	try {
		const parsed = JSON.parse(config);
		if (parsed.preset && themePresets[parsed.preset]) {
			applyThemePreset(parsed.preset);
			return true;
		}
		if (parsed.custom?.primary) {
			applyColor(document.documentElement, '--primary-base', parsed.custom.primary);
			if (parsed.custom.isDark) {
				document.documentElement.setAttribute('data-theme', 'dark');
			} else {
				document.documentElement.removeAttribute('data-theme');
			}
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

// ============================================
// 四、默认导出
// ============================================

export default {
	themePresets,
	applyThemePreset,
	getCurrentPresetKey,
	getThemePresetList,
	exportThemeConfig,
	importThemeConfig,
};
