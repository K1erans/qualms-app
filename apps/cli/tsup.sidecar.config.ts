import { createRequire } from 'node:module';

import { defineConfig } from 'tsup';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json') as { version: string };

export default defineConfig({
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  dts: false,
  entry: { sidecar: 'src/index.ts' },
  format: ['cjs'],
  minify: false,
  noExternal: [/.*/],
  platform: 'node',
  sourcemap: false,
  splitting: false,
  target: 'node22',
  outExtension: () => ({ js: '.cjs' }),
  define: {
    __CLI_VERSION__: JSON.stringify(packageJson.version),
  },
});
