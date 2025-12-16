/**
 * tsup.config.ts
 *
 * Build configuration for the core package.
 * Defines how to bundle the SDK into multiple formats:
 * - ESM and CJS for npm imports
 * - IIFE browser bundle (runtime.min.js) with global window.YourPkg
 */

import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM and CJS builds for npm
  {
    entry: ['src/index.ts', 'src/auto.ts', 'src/react.tsx'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react'],
    esbuildOptions(options) {
      options.loader = { ...(options.loader || {}), '.yaml': 'text' }
    },
  },
  // Browser runtime bundle
  {
    entry: ['src/runtime.ts'],
    format: ['iife'],
    globalName: 'YourPkg',
    minify: true,
    outDir: 'dist',
    outExtension: () => ({ js: '.min.js' }),
    esbuildOptions(options) {
      options.loader = { ...(options.loader || {}), '.yaml': 'text' }
    },
  },
])
