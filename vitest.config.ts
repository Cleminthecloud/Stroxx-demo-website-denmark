import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests for the PURE logic layer only (lib/ helpers, extracted
 *  middleware helpers): no DOM, no network, no Sanity client. The '@/'
 *  alias mirrors tsconfig.json paths so tests import modules exactly the
 *  way the app does. */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.dirname(fileURLToPath(import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
