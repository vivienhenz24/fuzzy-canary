# @yourpkg/vite

Vite plugin adapter for [`@yourpkg/core`](https://www.npmjs.com/package/@yourpkg/core). Injects a small inline module that calls `init()` during the HTML build step.

## Install

```bash
pnpm add @yourpkg/core @yourpkg/vite
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import yourPkgVitePlugin from '@yourpkg/vite'

export default defineConfig({
  plugins: [
    yourPkgVitePlugin({
      token: 'your-token', // plus any InitOptions from @yourpkg/core
      position: 'head',    // or 'body'
    }),
  ],
})
```

This plugin is intentionally thin: it only injects an inline module that imports `init()` from `@yourpkg/core` with your options. All logic stays in the core SDK.
