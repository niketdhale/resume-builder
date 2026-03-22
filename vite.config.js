import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      html2canvas: fileURLToPath(new URL('./node_modules/html2canvas-pro', import.meta.url)),
    },
  },

  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.js'],
    exclude: ['node_modules', 'e2e', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'e2e/', '**/*.spec.js', 'src/main.js'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
})
