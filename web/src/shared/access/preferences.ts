import { isThemePresetKey, presetAppearance, type ThemePresetKey } from './themePresets.ts';

/** Normalize the version key while preserving authentication and existing preferences. */
export function migrateThemeVersion(storage: Pick<Storage, 'getItem' | 'setItem'>, version: string) {
  const raw = storage.getItem('themeConfigVersion');
  const encoded = JSON.stringify(version);
  // Older callers wrote a plain version string rather than JSON.
  if (raw !== encoded) storage.setItem('themeConfigVersion', encoded);
}

/** The accents used before the V3 visual refresh; sessions carrying them never customised the theme. */
const LEGACY_DEFAULT_PRIMARIES = ['#5b5ee8', '#625de7', '#409eff', '#171717'];

/** The layouts the shell still ships. `classic` and `columns` were removed with the V2 rollout. */
const SUPPORTED_LAYOUTS = ['defaults', 'transverse'];

/**
 * Reconcile a stored theme config with the current defaults.
 *
 * `setThemeConfig` assigns the stored object as-is (stores/themeConfig.ts), so a preference
 * written before a key existed never receives that key's default. Merging here fixes that.
 * A stored primary that still equals the old default means the user never picked a colour,
 * so it moves to the new default; any other value is a real choice and is preserved.
 * A stored layout that no longer exists would leave `layout/index.vue` with no component to
 * render — a blank app — so it falls back to `defaults`.
 */
export function migrateThemeConfig<T extends object>(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  defaults: T
): T | null {
  const raw = storage.getItem('themeConfig');
  if (!raw) return null;

  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return null;

  const config = stored as Record<string, unknown>;
  const merged = { ...defaults, ...config } as T;
  const fields = merged as Record<string, unknown>;

  if (isThemePresetKey(config.themePreset)) {
    const appearance = presetAppearance(config.themePreset, typeof config.isIsDark === 'boolean' ? config.isIsDark : undefined);
    for (const [key, value] of Object.entries(appearance)) {
      if (config[key] === undefined) fields[key] = value;
    }
  } else {
    const primary = String(config.primary ?? '').toLowerCase();
    const oldDefault = !primary || LEGACY_DEFAULT_PRIMARIES.includes(primary);
    const oldPreset: Record<string, ThemePresetKey> = { '#2563eb': 'slate', '#6366f1': 'carbon' };
    const key = oldDefault ? 'carbon' : oldPreset[primary] ?? (config.isIsDark ? 'carbon' : 'mono');
    const appearance = presetAppearance(key, oldDefault ? true : Boolean(config.isIsDark));
    fields.themePreset = key;
    fields.isIsDark = appearance.isIsDark;
    if (oldDefault || oldPreset[primary]) fields.primary = appearance.primary;
    for (const name of ['menuBar', 'topBar', 'menuBarColor', 'topBarColor', 'menuBarActiveColor'] as const) {
      if (config[name] === undefined || ['#f8f8f8', '#fafafa', '#0a0a0a', '#000000', '#f5f5f5', '#efedfc', '#efeefc'].includes(String(config[name]).toLowerCase())) {
        fields[name] = appearance[name];
      }
    }
  }
  if (fields.animation === 'slide-right' || !fields.animation) {
    fields.animation = 'fade';
  }
  if (!SUPPORTED_LAYOUTS.includes(String(fields.layout))) {
    fields.layout = 'defaults';
  }

  storage.setItem('themeConfig', JSON.stringify(merged));
  return merged;
}
