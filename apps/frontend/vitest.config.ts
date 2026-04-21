import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@sentinel/types': resolve(__dirname, '../../packages/types/src'),
      '@sentinel/ui-components': resolve(__dirname, '../../packages/ui-components/src'),
    },
  },
});
