import { createRequire } from 'node:module';

import { defineConfig } from 'tsup';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json') as { version: string };

export default defineConfig({
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  dts: false,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  minify: false,
  platform: 'node',
  sourcemap: true,
  splitting: false,
  target: 'node22',
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  define: {
    __CLI_VERSION__: JSON.stringify(packageJson.version),
  },
});
