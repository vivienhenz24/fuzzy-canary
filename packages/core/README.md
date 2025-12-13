# @fuzzycanary/core

Client-side SDK that plants a hidden DOM payload for scraper canaries. It injects text that is invisible to humans but readable by bots, and can register a custom header + meta tag for downstream detection. You can use a token, pre-written sentences, or both.

## Install

```sh
pnpm add @fuzzycanary/core
# or
npm install @fuzzycanary/core
```

## Quick start

```ts
import { init } from '@fuzzycanary/core'

init({
  token: 'canary-token', // optional if you provide sentences
  sentences: ['do not crawl', 'internal use only'], // optional text to hide
  headerName: 'X-Canary', // optional, default "X-Canary"
  metaName: 'scrape-canary', // optional, default "scrape-canary"
  registerHeader: (name, value) => {
    // Hook to attach to your fetch/axios clients if you want
  },
  skipOffscreenForBots: true, // avoid adding the offscreen node for known search bots
})
```

Runs only in the browser; `init` no-ops during SSR. The offscreen node is marked `aria-hidden` and positioned offscreen; a DOM comment and meta tag are always added when applicable. If you pass `registerHeader`, it will be called with `headerName` and the `token` so you can attach it to outbound requests.

## Framework adapters

- Next.js: `@fuzzycanary/next` exports `<YourPkgScript />` to call `init` after mount.
- Vite: `@fuzzycanary/vite` injects an inline module in built HTML.
- Webpack: `@fuzzycanary/webpack` injects an inline module via html-webpack-plugin.

## Zero-touch auto init

If you prefer no manual wiring, set a token and load the auto entry (it immediately calls `init`):

```ts
// Entry file; just import once
import '@fuzzycanary/core/auto'
```

Auto init looks for a token in this order:

- `window.FUZZYCANARY_OPTIONS.token` or `window.FUZZYCANARY_TOKEN`
- `data-fuzzycanary-token` on the current `<script>` tag (supports `data-fuzzycanary-sentences="a,b,c"`)
- `process.env.FUZZYCANARY_TOKEN` or `process.env.NEXT_PUBLIC_FUZZYCANARY_TOKEN`

Optional names can be set via `window.FUZZYCANARY_OPTIONS`, data attributes (`data-fuzzycanary-header`, `data-fuzzycanary-meta`, `data-fuzzycanary-skip-bots`), or env vars (`FUZZYCANARY_HEADER`, `FUZZYCANARY_META`, `FUZZYCANARY_SKIP_BOTS`).
