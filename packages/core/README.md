# Fuzzy Canary

Client-side SDK that plants a hidden DOM payload for scraper canaries. It injects invisible text (from bundled sentences) into the DOM so scrapers pick it up; no configuration or tokens are required.

<div align="center">

**dom** • **sdk** • **anti-scraping** • **hidden** • **payload**

</div>

## Getting Started

### Installation

```sh
pnpm add @fuzzycanary/core
# or
npm install @fuzzycanary/core
```

### Basic Usage

The simplest way to use Fuzzy Canary is with the auto-init import:

```ts
// Entry file; just import once
import '@fuzzycanary/core/auto' // immediately calls init() once
```

That's it! The SDK will automatically inject hidden canary payloads into your DOM.

### Manual Initialization

If you prefer manual control, you can import and call `init` yourself:

```ts
import { init } from '@fuzzycanary/core'

init() // no configuration needed; always injects a bundled hidden sentence
```

### How It Works

Runs only in the browser; `init` no-ops during SSR. It adds:

- An offscreen node (aria-hidden, positioned offscreen)
- A DOM comment containing a random bundled sentence

No configuration is read from globals, data attributes, or env vars; it simply plants the bundled canary payload.

## Development

### Testing

The package includes comprehensive tests:

- **Unit tests**: `pnpm test` - Fast tests for individual functions
- **Integration tests**: Included in `pnpm test`
- **E2E tests (jsdom)**: `pnpm test:e2e` - Browser-like tests using jsdom (lightweight, AI-agent friendly)
- **E2E tests (Playwright)**: `pnpm test:e2e:playwright` - Full browser tests (optional, heavier)
- **All tests**: `pnpm test:all` - Runs unit, integration, and jsdom e2e tests

The jsdom-based e2e tests provide the same coverage as Playwright tests but are:

- Faster to run
- Lighter weight (no browser binaries)
- Easier to debug
- Better suited for AI-assisted development

### Building

```sh
pnpm build
```

Outputs to `dist/` with ESM, CJS, and type declarations.
