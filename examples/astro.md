# Using Fuzzy Canary with Astro

This guide shows you how to integrate Fuzzy Canary into your Astro application.

## Installation

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

## Setup

### Option 1: SSR with HTML String (Recommended for SSR/SSG)

In your base layout (e.g., `src/layouts/Layout.astro`), use the `getCanaryHtml()` utility:

```astro
---
// src/layouts/Layout.astro
import { getCanaryHtml } from '@fuzzycanary/core'

const canaryHtml = getCanaryHtml()
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <Fragment set:html={canaryHtml} />
    <slot />
  </body>
</html>
```

This injects the canary HTML at build time or during SSR.

### Option 2: React Component (if using Astro with React)

If you're using Astro with the React integration:

```astro
---
// src/layouts/Layout.astro
import { Canary } from '@fuzzycanary/core/react'

// Get user agent from Astro request
const userAgent = Astro.request.headers.get('user-agent') || undefined
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <Canary userAgent={userAgent} client:only="react" />
    <slot />
  </body>
</html>
```

### Option 3: Client-Side Initialization

For client-side only initialization:

```astro
---
// src/layouts/Layout.astro
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <slot />
    <script>
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## Bot Filtering with SSR

For SSR-rendered pages with bot filtering:

```astro
---
// src/layouts/Layout.astro
import { getCanaryHtml, getCanaryPayload } from '@fuzzycanary/core'
import { isAllowlistedBot } from '@fuzzycanary/core'

const userAgent = Astro.request.headers.get('user-agent') || ''
const shouldShowCanary = !isAllowlistedBot(userAgent)
const canaryHtml = shouldShowCanary ? getCanaryHtml() : ''
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    {shouldShowCanary && <Fragment set:html={canaryHtml} />}
    <slot />
  </body>
</html>
```

**Note**: You'll need to export `isAllowlistedBot` from the main package exports first.

## Static Site Generation (SSG)

If you're building a static site with `astro build`, the canary will be baked into all pages. **Bot filtering won't work** at build time.

**Recommended approach for static sites**:

- Use client-side initialization (Option 3)
- Or use an edge middleware/CDN to filter bots at runtime

```astro
---
// src/layouts/Layout.astro (SSG recommended approach)
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <slot />
    <script>
      // Client-side initialization filters bots via navigator.userAgent
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## How It Works

1. **Build Time/SSR**: The SDK generates hidden honeypot link HTML during build or SSR.

2. **Bot Detection** (SSR only): When using `isAllowlistedBot()`, legitimate bots (Google, Bing, etc.) don't receive the canary.

3. **Hidden Links**: Invisible to users but present in the DOM:

   ```html
   <div
     data-fuzzy-canary="true"
     style="display:none;position:absolute;left:-9999px;visibility:hidden"
   >
     <a href="https://trap-url.com/..." data-canary-link="true">Description - URL</a>
   </div>
   ```

4. **Client-Side Skip**: If using `import '@fuzzycanary/core/auto'`, bots that execute JavaScript can be filtered.

## Using with Astro Islands

If you're using Astro Islands with React:

```astro
---
// src/layouts/Layout.astro
import CanaryIsland from '../components/CanaryIsland.tsx'

const userAgent = Astro.request.headers.get('user-agent') || undefined
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <CanaryIsland userAgent={userAgent} client:load />
    <slot />
  </body>
</html>
```

```tsx
// src/components/CanaryIsland.tsx
import { Canary } from '@fuzzycanary/core/react'

interface Props {
  userAgent?: string
}

export default function CanaryIsland({ userAgent }: Props) {
  return <Canary userAgent={userAgent} />
}
```

## Using Multiple Layouts

If you have multiple layouts, extract the canary to a component:

```astro
---
// src/components/CanaryInjector.astro
import { getCanaryHtml } from '@fuzzycanary/core'

const canaryHtml = getCanaryHtml()
---

<Fragment set:html={canaryHtml} />
```

Then use it in each layout:

```astro
---
// src/layouts/Layout.astro
import CanaryInjector from '../components/CanaryInjector.astro'
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Site</title>
  </head>
  <body>
    <CanaryInjector />
    <slot />
  </body>
</html>
```

## Astro Configuration

Make sure you have SSR enabled if you want bot filtering to work:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'server', // or 'hybrid'
  adapter: netlify(), // or vercel(), cloudflare(), node(), etc.
})
```

For static builds (`output: 'static'`), use client-side initialization.

## Troubleshooting

### Canary not appearing

1. Check that `<Fragment set:html={canaryHtml} />` is inside `<body>`
2. Verify the import: `import { getCanaryHtml } from '@fuzzycanary/core'`
3. Inspect the build output or SSR response
4. Check browser inspector for `<div data-fuzzy-canary="true">`

### Bot filtering not working

1. Make sure you're using SSR/SSG, not hybrid with that page static
2. Verify `Astro.request.headers.get('user-agent')` returns a value
3. Check if the bot is in the allowlist
4. For static sites, bot filtering requires client-side init or edge middleware

### Hydration issues with React component

If using the React component with `client:only`:

- Make sure React integration is installed: `npx astro add react`
- Use `client:only="react"` instead of `client:load` to avoid hydration
- Or use Option 1 (HTML string) which has no hydration issues

### TypeScript errors

If you get TypeScript errors with `getCanaryHtml()`:

```ts
// Add to src/env.d.ts
/// <reference types="@fuzzycanary/core" />
```

## What Gets Injected

The package maintainer configures honeypot URLs at build time. The injected HTML looks like:

```html
<div data-fuzzy-canary="true" style="display:none;position:absolute;left:-9999px;visibility:hidden">
  <a
    href="https://honeypot-url.com/trap1"
    data-canary-link="true"
    style="display:inline-block;margin-right:10px"
  >
    API Documentation - https://honeypot-url.com/trap1
  </a>
  <a
    href="https://honeypot-url.com/trap2"
    data-canary-link="true"
    style="display:inline-block;margin-right:10px"
  >
    Internal Dashboard - https://honeypot-url.com/trap2
  </a>
</div>
```

## Best Practices

1. **Use SSR for Bot Filtering**: Set `output: 'server'` or `'hybrid'` in config
2. **Client-Side for Static**: Use `import '@fuzzycanary/core/auto'` for static builds
3. **Single Instance**: Only inject the canary once in your base layout
4. **Monitor Honeypots**: Set up alerts on the trap URLs
5. **Test Both Modes**: Verify in dev (`astro dev`) and production builds

## Deployment Platforms

The canary works with all Astro deployment options:

- **Vercel**: Use SSR adapter, bot filtering works
- **Netlify**: Use SSR adapter, bot filtering works
- **Cloudflare**: Use SSR adapter, bot filtering works
- **Static Hosts** (GitHub Pages, etc.): Use client-side init only

## Example Project Structure

```
src/
├── layouts/
│   └── Layout.astro       # Add canary here
├── pages/
│   ├── index.astro
│   └── about.astro
└── components/
    └── CanaryInjector.astro  # Optional reusable component
```

## Comparison with Other Frameworks

| Feature            | Astro                  | Next.js     | Remix  |
| ------------------ | ---------------------- | ----------- | ------ |
| HTML String Method | Yes                    | No          | No     |
| React Component    | Yes (with integration) | Yes         | Yes    |
| Client-Side Init   | Yes                    | Yes         | Yes    |
| Auto User Agent    | Manual                 | Automatic   | Manual |
| Best for SSG       | Client-Side            | Client-Side | N/A    |

## Next Steps

- Set up SSR if you need bot filtering
- Monitor your honeypot URLs for scraper activity
- Test with different user agents
- Consider edge middleware for advanced bot detection

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
- [Astro Documentation](https://docs.astro.build)
