import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      // html2canvas does not support oklch (Tailwind v4 default).
      // html2canvas-pro is a drop-in replacement that does.
      'html2canvas': 'html2canvas-pro',
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
