import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import vue from 'eslint-plugin-vue';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'playwright-report/**', 'test-results/**', 'public/**'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,ts,tsx,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node },
      parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module', extraFileExtensions: ['.vue'] } },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: { 'no-unused-vars': 'off', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off' },
  },
  { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tsParser }, rules: { 'no-undef': 'off' } },
  { files: ['**/*.vue'], rules: { 'no-undef': 'off' } },
];
