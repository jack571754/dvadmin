export type ThemePresetKey = 'mono' | 'slate' | 'sand' | 'carbon';

export interface ThemePalette {
  primary: string;
  canvas: string;
  surface: string;
  sidebar: string;
  text: string;
  secondary: string;
  muted: string;
  border: string;
  input: string;
  active: string;
}

export interface ThemePreset {
  key: ThemePresetKey;
  nameI18nKey: string;
  descriptionI18nKey: string;
  defaultDark: boolean;
  light: ThemePalette;
  dark: ThemePalette;
}

const carbonDark: ThemePalette = {
  primary: '#b2c1ff', canvas: '#191a1d', surface: '#1d1e22', sidebar: '#151619',
  text: '#ebecef', secondary: '#b5b8c1', muted: '#979ca8', border: '#2e3037', input: '#3b3e47', active: '#292d39',
};
const monoLight: ThemePalette = {
  primary: '#202124', canvas: '#ffffff', surface: '#ffffff', sidebar: '#f7f7f8',
  text: '#202124', secondary: '#4d5156', muted: '#6b7077', border: '#e8e9ec', input: '#dadce0', active: '#e9eaed',
};
const slateLight: ThemePalette = {
  primary: '#3459cf', canvas: '#ffffff', surface: '#ffffff', sidebar: '#f6f7f9',
  text: '#22252b', secondary: '#505762', muted: '#68717d', border: '#e6e9ef', input: '#d5dbe4', active: '#edf1fb',
};

/** Approved palette values; all consumers receive the same semantic tokens. */
export const themePresets: readonly ThemePreset[] = [
  { key: 'mono', nameI18nKey: 'message.layout.presetMono', descriptionI18nKey: 'message.layout.presetMonoDesc', defaultDark: false,
    light: monoLight, dark: { ...carbonDark, primary: '#eceef2', active: '#303136' } },
  { key: 'slate', nameI18nKey: 'message.layout.presetSlate', descriptionI18nKey: 'message.layout.presetSlateDesc', defaultDark: false,
    light: slateLight, dark: { ...carbonDark, primary: '#afc0ff', active: '#292f41' } },
  { key: 'sand', nameI18nKey: 'message.layout.presetSand', descriptionI18nKey: 'message.layout.presetSandDesc', defaultDark: false,
    light: { primary: '#80513c', canvas: '#fcfbf8', surface: '#fdfcfa', sidebar: '#f2f0ea', text: '#2b2925', secondary: '#59554d', muted: '#716b62', border: '#e7e3da', input: '#d8d2c7', active: '#e8e2d8' },
    dark: { primary: '#d5b9a5', canvas: '#201e1b', surface: '#26231f', sidebar: '#1b1917', text: '#eee9e1', secondary: '#c4bcb1', muted: '#a69c90', border: '#3b352e', input: '#51483d', active: '#3a3028' } },
  { key: 'carbon', nameI18nKey: 'message.layout.presetCarbon', descriptionI18nKey: 'message.layout.presetCarbonDesc', defaultDark: true,
    light: { ...slateLight, canvas: '#f7f8fa', sidebar: '#f0f1f4', muted: '#606975' }, dark: carbonDark },
];

export function isThemePresetKey(key: unknown): key is ThemePresetKey {
  return themePresets.some(preset => preset.key === key);
}

export function getThemePreset(key: unknown): ThemePreset {
  return themePresets.find(preset => preset.key === key) ?? themePresets[3];
}

export function getThemePalette(key: unknown, dark: boolean): ThemePalette {
  const preset = getThemePreset(key);
  return dark ? preset.dark : preset.light;
}

export interface ThemeAppearance {
  themePreset: ThemePresetKey;
  primary: string;
  isIsDark: boolean;
  topBar: string;
  topBarColor: string;
  menuBar: string;
  menuBarColor: string;
  menuBarActiveColor: string;
  isTopBarColorGradual: boolean;
  isMenuBarColorGradual: boolean;
}

export function presetAppearance(key: ThemePresetKey, dark = getThemePreset(key).defaultDark): ThemeAppearance {
  const palette = getThemePalette(key, dark);
  return {
    themePreset: key, primary: palette.primary, isIsDark: dark,
    topBar: palette.surface, topBarColor: palette.text,
    menuBar: palette.sidebar, menuBarColor: palette.secondary, menuBarActiveColor: palette.active,
    isTopBarColorGradual: false, isMenuBarColorGradual: false,
  };
}

/** Move preset-owned colors to the other mode while preserving custom colors. */
export function changeThemeMode(config: ThemeAppearance, dark: boolean): void {
  const previous = presetAppearance(config.themePreset, !dark);
  const next = presetAppearance(config.themePreset, dark);
  for (const key of ['primary', 'topBar', 'topBarColor', 'menuBar', 'menuBarColor', 'menuBarActiveColor'] as const) {
    if (config[key].toLowerCase() === previous[key].toLowerCase()) config[key] = next[key];
  }
  config.isIsDark = dark;
}
