import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  // ─── Ignored paths ─────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'],
  },
  // ─── Node config files ─────────────────────────────────────────────────────
  {
    files: ['vite.config.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // ─── Vue + JS source files ─────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // ─── Test files ────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  // ─── E2E test files ────────────────────────────────────────────────────────
  {
    files: ['e2e/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // ─── Base rules ────────────────────────────────────────────────────────────
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
]
