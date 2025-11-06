/// <reference types="vitest/config" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  define: {
    // E2E 테스트 환경 변수를 클라이언트에 전달
    'import.meta.env.VITE_TEST_ENV': JSON.stringify(
      process.env.TEST_ENV || process.env.VITE_TEST_ENV || 'e2e'
    ),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    coverage: {
      reportsDirectory: './.coverage',
      reporter: ['lcov', 'json', 'json-summary'],
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        // 일반 Vitest 테스트 (Node.js/jsdom 환경)
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/setupTests.ts',
          include: ['src/**/*.spec.{ts,tsx}'],
          exclude: ['src/stories/**'],
        },
      },
    ],
  },
});
