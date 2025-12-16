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

Fuzzy Canary injects plain text with a random sentence at the beginning of your `<body>` tag. The text is present in the DOM for scrapers to pick up but can be styled to be invisible to users.

The SDK runs in the browser and automatically detects if a canary was already injected during server-side rendering (SSR), avoiding duplication.

## Server-Side Rendering (SSR)

For maximum effectiveness against scrapers that don't execute JavaScript, use SSR to inject the canary into the initial HTML.

### React-based Frameworks (Next.js, Remix, Astro with React)

Use the `<Canary />` component in your root layout:

```tsx
import { Canary } from '@fuzzycanary/core/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Canary />
        {children}
      </body>
    </html>
  )
}
```

**Zero-Config**: The client-side code automatically detects the SSR-injected canary and skips re-injection.

### Next.js App Router Example

```tsx
// app/layout.tsx
import { Canary } from '@fuzzycanary/core/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Canary />
        {children}
      </body>
    </html>
  )
}
```

### Next.js Pages Router Example

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'
import { Canary } from '@fuzzycanary/core/react'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Canary />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

### Remix Example

```tsx
// app/root.tsx
import { Canary } from '@fuzzycanary/core/react'

export default function App() {
  return (
    <html lang="en">
      <body>
        <Canary />
        <Outlet />
      </body>
    </html>
  )
}
```

### Non-React Frameworks

For other frameworks, use the `getCanaryText()` utility:

```ts
import { getCanaryText } from '@fuzzycanary/core'

// In your template or SSR handler
const canaryText = getCanaryText()

// Insert at the start of body:
// <body><span data-fuzzy-canary="true" style="display:none;">${canaryText}</span>...
```

### Astro Example

```astro
---
import { getCanaryText } from '@fuzzycanary/core'
const canaryText = getCanaryText()
---

<html>
  <body>
    <span data-fuzzy-canary="true" style="display:none;">{canaryText}</span>
    <slot />
  </body>
</html>
```

### SvelteKit Example

```svelte
<script>
  import { getCanaryText } from '@fuzzycanary/core'
  const canaryText = getCanaryText()
</script>

<span data-fuzzy-canary="true" style="display:none;">{canaryText}</span>
<slot />
```

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
