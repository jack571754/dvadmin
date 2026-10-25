import assert from 'node:assert/strict';
import test from 'node:test';
import { applyTheme, contrastRatio } from '../../src/shared/access/theme.ts';
import { themePresets, presetAppearance, changeThemeMode } from '../../src/shared/access/themePresets.ts';

function themeRoot() {
  const values = new Map();
  const attributes = new Map();
  const classes = new Set();
  return { values, attributes, classes,
    style: { setProperty: (name, value) => values.set(name, value) },
    setAttribute: (name, value) => attributes.set(name, value),
    classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name) },
  };
}

for (const preset of themePresets) {
  for (const dark of [false, true]) {
    test(`${preset.key} ${dark ? 'dark' : 'light'}: readable text, controls and mode-specific surface colors`, () => {
      const root = themeRoot();
      const config = presetAppearance(preset.key, dark);
      applyTheme(config, root);
      const color = name => root.values.get(`--admin-${name}`);
      assert.equal(root.classes.has('dark'), dark);
      assert.equal(root.attributes.get('data-theme'), dark ? 'dark' : '');
      for (const foreground of ['text', 'text-secondary', 'muted']) {
        for (const background of ['canvas', 'surface', 'sidebar']) {
          assert.ok(contrastRatio(color(foreground), color(background)) >= 4.5, `${foreground} on ${background}`);
        }
      }
      for (const [foreground, background] of [['primary-foreground', 'primary'], ['accent-fg', 'accent-soft'], ['menu-active-text', 'menu-active']]) {
        assert.ok(contrastRatio(color(foreground), color(background)) >= 4.5, `${foreground} on ${background}`);
      }
      for (const status of ['success', 'warning', 'danger']) {
        assert.ok(contrastRatio(color(status), color(status + '-bg')) >= 4.5);
        assert.ok(contrastRatio(color(status + '-foreground'), color(status)) >= 4.5);
      }
      assert.ok(contrastRatio(root.values.get('--el-color-primary-light-9'), color('surface')) < 1.5, 'subtle background stays near the current surface');
      const before = new Map(root.values);
      changeThemeMode(config, !dark);
      applyTheme(config, root);
      changeThemeMode(config, dark);
      applyTheme(config, root);
      assert.deepEqual(root.values, before, 'switching modes twice restores the palette');
    });
  }
}

test('preset changes replace stale variables and keep custom accents readable', () => {
  const root = themeRoot();
  applyTheme(presetAppearance('sand'), root);
  const config = { ...presetAppearance('carbon'), primary: '#ffff00' };
  applyTheme(config, root);
  assert.equal(root.values.get('--admin-sidebar'), '#151619');
  assert.equal(root.values.get('--next-bg-menuBar'), '#151619');
  assert.ok(contrastRatio(root.values.get('--admin-primary-foreground'), '#ffff00') >= 4.5);
  changeThemeMode(config, false);
  assert.equal(config.primary, '#ffff00');
  applyTheme(config, root);
  assert.ok(contrastRatio(root.values.get('--admin-accent-fg'), root.values.get('--admin-surface')) >= 4.5);
});
