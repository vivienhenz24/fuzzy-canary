# @fuzzycanary/vite

Vite plugin adapter for [`@fuzzycanary/core`](https://www.npmjs.com/package/@fuzzycanary/core). Injects a small inline module that calls `init()` during the HTML build step.

## Install

```bash
pnpm add @fuzzycanary/core @fuzzycanary/vite
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import yourPkgVitePlugin from '@fuzzycanary/vite'

export default defineConfig({
  plugins: [
    yourPkgVitePlugin({ position: 'head' }), // or 'body'
  ],
})
```

This plugin is intentionally thin: it only injects an inline module that imports `init()` from `@fuzzycanary/core`. All logic stays in the core SDK.
