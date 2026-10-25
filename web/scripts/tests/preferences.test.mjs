import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateThemeVersion, migrateThemeConfig } from '../../src/shared/access/preferences.ts';

for (const version of [undefined, '0.9.0', '1.0.0', '"1.0.0"']) {
  test(`theme migration preserves token and preferences for ${version ?? 'a new installation'}`, () => {
    const values = new Map([['token', 'session-token'], ['themeConfig', '{"layout":"columns"}']]);
    if (version !== undefined) values.set('themeConfigVersion', version);
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    migrateThemeVersion(storage, '1.0.0');
    assert.equal(values.get('themeConfigVersion'), '"1.0.0"');
    assert.equal(values.get('token'), 'session-token');
    assert.equal(values.get('themeConfig'), '{"layout":"columns"}');
    const snapshot = [...values];
    migrateThemeVersion(storage, '1.0.0');
    assert.deepEqual([...values], snapshot);
  });
}

test('migrateThemeConfig upgrades the old default to Carbon without losing other preferences', () => {
  const defaults = {
    primary: '#171717',
    menuBar: '#fafafa',
    topBar: '#fafafa',
    menuBarActiveColor: '#f5f5f5',
    animation: 'fade',
    layout: 'defaults',
  };

  const values = new Map([
    [
      'themeConfig',
      JSON.stringify({
        primary: '#625de7',
        menuBar: '#f8f8f8',
        topBar: '#f8f8f8',
        menuBarActiveColor: '#efedfc',
        animation: 'slide-right',
        layout: 'classic',
      }),
    ],
  ]);

  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const result = migrateThemeConfig(storage, defaults);

  assert.equal(result.themePreset, 'carbon');
  assert.equal(result.isIsDark, true);
  assert.equal(result.primary, '#b2c1ff');
  assert.equal(result.menuBar, '#151619');
  assert.equal(result.topBar, '#1d1e22');
  assert.equal(result.menuBarActiveColor, '#292d39');
  assert.equal(result.animation, 'fade');
  assert.equal(result.layout, 'defaults');

  // Verify custom primary is preserved
  const customValues = new Map([
    ['themeConfig', JSON.stringify({ primary: '#ff5500', layout: 'transverse' })],
  ]);
  const customStorage = { getItem: key => customValues.get(key) ?? null, setItem: (key, value) => customValues.set(key, value) };
  const customResult = migrateThemeConfig(customStorage, defaults);
  assert.equal(customResult.primary, '#ff5500');
  assert.equal(customResult.layout, 'transverse');
});

test('current presets fill missing keys without reinterpreting a saved choice', () => {
  const values = new Map([
    ['token', 'keep-login'],
    ['themeConfig', JSON.stringify({ themePreset: 'sand', globalI18n: 'en', layout: 'transverse' })],
  ]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const config = migrateThemeConfig(storage, { primary: '#b2c1ff', isIsDark: true });
  assert.equal(config.primary, '#80513c');
  assert.equal(config.isIsDark, false);
  assert.equal(config.globalI18n, 'en');
  assert.equal(config.layout, 'transverse');
  assert.equal(values.get('token'), 'keep-login');
  assert.deepEqual(migrateThemeConfig(storage, {}), config, 'migration is idempotent');
});

test('legacy custom surfaces and accent survive migration', () => {
  const values = new Map([['themeConfig', JSON.stringify({ primary: '#ff5500', menuBar: '#123456', topBar: '#234567', isIsDark: false })]]);
  const config = migrateThemeConfig({ getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }, {});
  assert.equal(config.primary, '#ff5500');
  assert.equal(config.menuBar, '#123456');
  assert.equal(config.topBar, '#234567');
  assert.equal(config.isIsDark, false);
});
