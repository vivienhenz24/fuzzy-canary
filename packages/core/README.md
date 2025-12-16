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

Fuzzy Canary injects hidden honeypot links at the beginning of your `<body>` tag. These links are invisible to users but present in the DOM for scrapers to discover and follow. When a scraper visits these URLs, you can detect unauthorized scraping.

The SDK runs in the browser and automatically detects if canary links were already injected during server-side rendering (SSR), avoiding duplication.

### Canary URLs Security

The canary URLs are injected at **build time** from the `CANARY_TEXT` environment variable. This keeps your honeypot URLs out of the source code repository.

**For Package Maintainers (Publishing to npm):**

This package maintainer sets `CANARY_TEXT` as a repository secret in GitHub Actions. During the release build, the secret honeypot URLs are injected into the compiled code. Users who install the package receive the pre-built version with the canary URLs already baked in - no configuration required on their end.

**URL Format:**
The maintainer can provide honeypot links in multiple formats:

**Option 1: JSON with descriptions (Recommended)**

```json
[
  { "description": "API Documentation", "url": "https://your-domain.com/api/docs" },
  { "description": "Internal Dashboard", "url": "https://your-domain.com/admin/dashboard" },
  { "description": "Debug Endpoint", "url": "https://your-domain.com/debug/status" }
]
```

**Option 2: Pipe-separated (description|url)**

```
API Documentation|https://your-domain.com/api/docs
Internal Dashboard|https://your-domain.com/admin/dashboard
Debug Endpoint|https://your-domain.com/debug/status
```

**Option 3: Plain URLs (auto-generates descriptions)**

```json
["https://your-domain.com/trap1", "https://your-domain.com/trap2"]
```

Links will be rendered in the DOM as: **description - url** making them look natural to scrapers.

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

## Static sites vs bots

On a purely static site, do not bake the canary into HTML. Use the client entry (`import '@fuzzycanary/core/auto'`) so allowlisted bots that execute JS skip injection via `navigator.userAgent`, while other clients still get the canary. To strip canaries from static HTML for allowlisted bots you need a proxy/edge layer outside this package that can see the request UA and rewrite the response.

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
