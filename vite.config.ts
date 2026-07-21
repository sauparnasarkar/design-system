/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  // aria-query is pure CJS with no `exports` field; Vitest's browser-mode dep
  // optimizer doesn't reliably detect its named exports (used by
  // @testing-library/dom, which addon-vitest's setup pulls in) without being
  // forced through pre-bundling explicitly.
  optimizeDeps: {
    include: [
      'aria-query',
      'lz-string',
      'dom-accessibility-api',
      'pretty-format',
      '@adobe/css-tools',
      'css.escape',
      'picocolors',
      'redent',
      '@babel/code-frame',
    ],
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }, {
      // Plain Node-environment unit tests (e.g. static source-content guards) that
      // don't need a browser — kept separate from the storybook project above so
      // they run fast and don't pull in browser-only setup.
      extends: true,
      test: {
        name: 'unit',
        environment: 'node',
        include: ['src/**/*.test.ts'],
      }
    }]
  }
});
