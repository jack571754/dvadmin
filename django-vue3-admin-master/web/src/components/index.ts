/**
 * 主题组件统一导出
 *
 * 用法:
 * import { ThemePresetSelector, ThemeColorPicker, ThemeSettings } from '@/components';
 */

export { default as ThemePresetSelector } from './ThemePresetSelector/index.vue';
export { default as ThemeColorPicker } from './ThemeColorPicker/index.vue';
export { default as ThemeSettings } from './ThemeSettings/index.vue';

// 重新导出类型
export type { ThemePreset, ThemePresetListItem } from '@/utils/themePresets';
