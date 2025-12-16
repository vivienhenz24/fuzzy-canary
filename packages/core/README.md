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
// Entry file; just import once (client-side)
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

**Zero-Config**: The component automatically detects user agent from Next.js headers and skips rendering for legitimate bots (Google, Bing, etc.). For other frameworks, you can pass `userAgent` manually. The client-side code automatically detects the SSR-injected canary and skips re-injection.

### Next.js App Router Example

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

**Automatic Bot Detection**: The component automatically reads user agent from Next.js headers and skips rendering for legitimate bots (Google, Bing, social media crawlers).

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

**Note**: Auto-detection works in Pages Router too, but `_document.tsx` runs in a different context. For best results, consider using client-side initialization (`import '@fuzzycanary/core/auto'`) which automatically detects bots.

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

**Note**: For Remix and other frameworks, pass `userAgent` manually since auto-detection only works in Next.js Server Components.

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

## Edge / Middleware Strip for Allowlisted Bots

If you serve static HTML (no per-request UA) but still want allowlisted bots (Googlebot, Bing, social unfurlers) to avoid the canary, use the middleware entrypoint:

```ts
// middleware.(ts|js) in a fetch-compatible edge runtime
export { fuzzyCanaryMiddleware as middleware } from '@fuzzycanary/core/middleware'
```

What it does:

- Reads the `User-Agent` header.
- Proxies to origin via `fetch(request)` (pass a custom upstream function if needed).
- If UA is allowlisted and the response is HTML, strips `<span data-fuzzy-canary="true">…</span>` before returning.
- Leaves non-HTML responses unchanged.

Pure helper (if you already have the HTML string): `stripFuzzyCanary(html)`.

## Choosing an approach

- **Static sites:** Include `@fuzzycanary/core/auto` on the client; optionally add the middleware strip so allowlisted bots don’t see the canary baked into static HTML.
- **SSR with UA available:** Render `<Canary userAgent={req.headers['user-agent']}>` (or rely on Next’s auto UA detection) so allowlisted bots are skipped at render time.
- **Non-React servers:** Use `getCanaryText()` in your templates/handlers and gate it with `isAllowlistedBot(ua)` from `@fuzzycanary/core/allowlist` if you have the UA.

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
