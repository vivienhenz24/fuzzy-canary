![Banner](./public/banner.png)

# Fuzzy Canary

An open-source, installable client-side SDK that adds a hidden text payload into a page's DOM at runtime.

<div align="center">

[![npm](https://img.shields.io/npm/v/@fuzzycanary/core)](https://www.npmjs.com/package/@fuzzycanary/core)
[![CI](https://img.shields.io/github/actions/workflow/status/vivienhenz24/fuzzyfrontend/ci.yml?branch=main&label=CI)](https://github.com/vivienhenz24/fuzzyfrontend/actions)
[![License](https://img.shields.io/npm/l/@fuzzycanary/core)](https://github.com/vivienhenz24/fuzzyfrontend/blob/main/LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/@fuzzycanary/core)](https://www.npmjs.com/package/@fuzzycanary/core)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@fuzzycanary/core)](https://bundlephobia.com/package/@fuzzycanary/core)

</div>

## Getting Started

### Installation

```bash
npm i @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

### Quick Start

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

The SDK automatically detects if a canary was already injected during server-side rendering (SSR), avoiding duplication. No configuration is required.

## Server-Side Rendering (Recommended when you pass UA)

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

### Next.js App Router

```tsx
// app/layout.tsx
import { Canary } from '@fuzzycanary/core/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Canary />{' '}
        {/* auto-detects Next headers; pass userAgent manually if you opt out of dynamic rendering */}
        {children}
      </body>
    </html>
  )
}
```

**Zero-Config**: The component automatically detects user agent from Next.js headers and skips rendering for legitimate bots (Google, Bing, etc.).

### Non-React Frameworks

For other frameworks, use the `getCanaryText()` utility:

```ts
import { getCanaryText } from '@fuzzycanary/core'

const canaryText = getCanaryText()
// Insert at the start of body in your template
```

See the [core package README](./packages/core/README.md) for more examples (Remix, Astro, SvelteKit, etc.).

## Static sites vs bots

On a purely static site, do not bake the canary into HTML. Use the client entry (`import '@fuzzycanary/core/auto'`) so allowlisted bots that execute JS skip injection via `navigator.userAgent`, while other clients still get the canary. To strip canaries from static HTML for allowlisted bots you need a proxy/edge layer outside this package that can see the request UA and rewrite the response.
