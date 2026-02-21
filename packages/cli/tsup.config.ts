import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  treeshake: true,
  splitting: false,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
});
