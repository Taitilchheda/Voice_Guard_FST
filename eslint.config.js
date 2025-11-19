import js from '@eslint/js';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['.next/**/*', 'dist/**/*', 'node_modules/**/*']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  }
];
