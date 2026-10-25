import { getThemePalette, type ThemeAppearance } from './themePresets.ts';

/**
 * 暗色模式的唯一开关是 `themeConfig.isIsDark`，落到 <html> 上时需要两个属性同时成立：
 *
 * - `[data-theme='dark']`：应用自己的令牌层（`theme/tokens.scss`、`theme/other.scss`）用它；
 * - `html.dark`：Element Plus 官方暗色变量（`element-plus/theme-chalk/dark/css-vars.css`，
 *   在 `main.ts` 中引入）只用这个类名。
 *
 * 两处分开维护很容易漂移（比如只改了类名没改属性，第三方组件亮、自己的组件暗），
 * 所以统一从这里写。
 */
export function applyDarkMode(isDark: boolean, root: HTMLElement = document.documentElement): void {
	root.setAttribute('data-theme', isDark ? 'dark' : '');
	root.classList.toggle('dark', isDark);
}

const validColor = (value: string | undefined, fallback: string) => /^#[\da-f]{6}$/i.test(value ?? '') ? value! : fallback;
const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));

export function mixColor(color: string, background: string, amount: number): string {
  const target = rgb(background);
  return '#' + rgb(color).map((channel, i) => Math.round(channel * (1 - amount) + target[i] * amount).toString(16).padStart(2, '0')).join('');
}

function luminance(color: string): number {
  return rgb(color).map(channel => channel / 255).reduce((sum, value, i) => {
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

export function contrastRatio(a: string, b: string): number {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

/** Custom accents used as text must remain readable on their actual surface. */
function readableAccent(color: string, backgrounds: string[], dark: boolean): string {
  for (let amount = 0; amount <= 1; amount += 0.05) {
    const candidate = mixColor(color, dark ? '#ffffff' : '#000000', amount);
    if (backgrounds.every(background => contrastRatio(candidate, background) >= 4.5)) return candidate;
  }
  return dark ? '#ffffff' : '#000000';
}

/** Rebuild all theme variables from preferences; never replay a stale cssText snapshot. */
export function applyTheme(config: ThemeAppearance, root: HTMLElement = document.documentElement): void {
  const palette = getThemePalette(config.themePreset, config.isIsDark);
  const primary = validColor(config.primary, palette.primary);
  const sidebar = validColor(config.menuBar, palette.sidebar);
  const navigation = validColor(config.topBar, palette.surface);
  const active = validColor(config.menuBarActiveColor, palette.active);
  const soft = primary.toLowerCase() === palette.primary ? palette.active : mixColor(primary, palette.surface, 0.9);
  const accent = readableAccent(primary, [palette.canvas, palette.surface, soft], config.isIsDark);
  const foreground = contrastRatio(primary, '#ffffff') >= contrastRatio(primary, '#191a1d') ? '#ffffff' : '#191a1d';
  const tokens: Record<string, string> = {
    canvas: palette.canvas, surface: palette.surface, 'surface-2': palette.active,
    sidebar, navigation, hover: palette.active, text: palette.text, 'text-secondary': palette.secondary, muted: palette.muted,
    border: palette.border, 'border-strong': palette.input, input: palette.input, ring: accent,
    primary, 'primary-foreground': foreground, accent, 'accent-soft': soft, 'accent-fg': accent,
    'menu-text': validColor(config.menuBarColor, palette.secondary), 'menu-active': active,
    'menu-active-text': readableAccent(primary, [active], luminance(active) < 0.18),
    success: config.isIsDark ? '#86efac' : '#15803d', 'success-bg': config.isIsDark ? '#16372a' : '#f0fdf4',
    warning: config.isIsDark ? '#fcd34d' : '#92400e', 'warning-bg': config.isIsDark ? '#40351d' : '#fffbeb',
    danger: config.isIsDark ? '#fca5a5' : '#b91c1c', 'danger-bg': config.isIsDark ? '#43242d' : '#fef2f2',
    'success-foreground': config.isIsDark ? '#191a1d' : '#ffffff',
    'warning-foreground': config.isIsDark ? '#191a1d' : '#ffffff',
    'danger-foreground': config.isIsDark ? '#191a1d' : '#ffffff',
    'chart-1': accent, 'chart-2': mixColor(accent, palette.secondary, 0.45), 'chart-3': palette.secondary,
    'chart-4': palette.muted, 'chart-5': mixColor(accent, palette.surface, 0.55),
  };
  for (const [name, value] of Object.entries(tokens)) root.style.setProperty(`--admin-${name}`, value);
  root.style.setProperty('--el-color-primary', primary);
  root.style.setProperty('--el-menu-bg-color', sidebar);
  for (let i = 1; i <= 9; i++) root.style.setProperty(`--el-color-primary-light-${i}`, mixColor(primary, palette.surface, i / 10));
  root.style.setProperty('--el-color-primary-dark-2', mixColor(primary, config.isIsDark ? '#ffffff' : '#000000', 0.15));
  for (const key of ['topBar', 'topBarColor', 'menuBar', 'menuBarColor', 'menuBarActiveColor'] as const) {
    root.style.setProperty(`--next-bg-${key}`, config[key]);
  }
  root.style.setProperty('--next-bg-menuBar-light-1', mixColor(sidebar, palette.surface, 0.05));
  root.setAttribute('data-palette', config.themePreset);
  applyDarkMode(config.isIsDark, root);
}
