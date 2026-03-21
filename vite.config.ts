import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@features': resolve(__dirname, 'src/app/features'),
      '@shared': resolve(__dirname, 'src/app/shared'),
      '@vitest': resolve(__dirname, 'src/vitest'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./src/vitest/setup.ts'],
  },
});
