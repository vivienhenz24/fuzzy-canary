![Banner](./public/banner.png)

# Fuzzy Canary

An open-source, installable client-side SDK that adds honeypot links into a page's DOM at runtime.

<div align="center">

[![npm](https://img.shields.io/npm/v/@fuzzycanary/core)](https://www.npmjs.com/package/@fuzzycanary/core)
[![CI](https://img.shields.io/github/actions/workflow/status/vivienhenz24/fuzzyfrontend/ci.yml?branch=main&label=CI)](https://github.com/vivienhenz24/fuzzyfrontend/actions)
[![License](https://img.shields.io/npm/l/@fuzzycanary/core)](https://github.com/vivienhenz24/fuzzyfrontend/blob/main/LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/@fuzzycanary/core)](https://www.npmjs.com/package/@fuzzycanary/core)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/%40fuzzycanary%2Fcore)](https://bundlephobia.com/package/@fuzzycanary/core)

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

Fuzzy Canary injects hidden honeypot links (porn links) at the beginning of your `<body>` tag. These links are invisible to users but present in the DOM for scrapers to discover. When AI scrapers ingest these links, their content safety filters detect the adult content and flag or refuse to process the scraped data - breaking the scraping pipeline.

This approach is particularly effective against:

- AI training data collection bots
- LLM scraping tools
- Automated content aggregators with safety filters

The SDK automatically detects if canary links were already injected during server-side rendering (SSR), avoiding duplication. No configuration is required.

### How the Canary Works

The canary URLs are **porn links** designed to trigger AI scrapers' content safeguards. When AI bots scrape your site and ingest the hidden honeypot links, their safety filters detect the adult content and refuse to process it - effectively breaking the scraping pipeline or flagging the scraped content as unsafe.

**Key points:**

- URLs are injected at **build time** by the package maintainer using GitHub Actions secrets
- The honeypot URLs point to adult content sites that trigger AI safety filters
- Keeps the URLs out of the source code - they're baked into the distributed package
- End users install the package with zero configuration needed
- Links are invisible to users but present in the DOM for scrapers

Links are rendered in the DOM as: `description - url` (e.g., "API Documentation - https://honeypot-domain.com/...")

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

**Zero-Config**: The client-side code automatically detects the SSR-injected canary and skips re-injection. The component accepts an optional `userAgent` prop for manual bot detection in non-Next.js frameworks.

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

**Note**: Auto-detection only works in Next.js Server Components. For other frameworks (Remix, etc.), you need to pass the `userAgent` prop manually.

### Remix Example

```tsx
// app/root.tsx
import { Canary } from '@fuzzycanary/core/react'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('user-agent') || ''
  return { userAgent }
}

export default function App() {
  const { userAgent } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <body>
        <Canary userAgent={userAgent} />
        <Outlet />
      </body>
    </html>
  )
}
```

### Next.js Pages Router

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

**Note**: Auto-detection works in Pages Router too, but `_document.tsx` runs in a different context. For best results, consider using client-side initialization (`import '@fuzzycanary/core/auto'`) which automatically detects bots.

### Non-React Frameworks

For other frameworks, use the `getCanaryHtml()` utility:

```ts
import { getCanaryHtml } from '@fuzzycanary/core'

const canaryHtml = getCanaryHtml()
// Insert at the start of body in your template
```

### Astro Example

```astro
---
import { getCanaryHtml } from '@fuzzycanary/core'
const canaryHtml = getCanaryHtml()
---

<html>
  <body>
    <Fragment set:html={canaryHtml} />
    <slot />
  </body>
</html>
```

### SvelteKit Example

```svelte
<script>
  import { getCanaryHtml } from '@fuzzycanary/core'
  const canaryHtml = getCanaryHtml()
</script>

{@html canaryHtml}
<slot />
```

See the [core package README](./packages/core/README.md) for more details.

## Static sites vs bots

On a purely static site, do not bake the canary into HTML. Use the client entry (`import '@fuzzycanary/core/auto'`) so allowlisted bots that execute JS skip injection via `navigator.userAgent`, while other clients still get the canary. To strip canaries from static HTML for allowlisted bots you need a proxy/edge layer outside this package that can see the request UA and rewrite the response.

**User-Agent filtering is inherently imperfect on static output**: if your pages are generated without per-request context, the build step cannot see the UA, so the canary HTML cannot be trimmed for allowlisted crawlers. You would need a runtime layer (proxy/edge middleware) to remove the canary for those bots.
