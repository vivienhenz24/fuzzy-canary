# Using Fuzzy Canary with SvelteKit

This guide shows you how to integrate Fuzzy Canary into your SvelteKit application.

## Installation

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

## Setup

### Option 1: SSR with HTML String (Recommended)

In your root layout (e.g., `src/routes/+layout.svelte`), use the `getCanaryHtml()` utility:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { getCanaryHtml } from '@fuzzycanary/core'

  const canaryHtml = getCanaryHtml()
</script>

{@html canaryHtml}
<slot />
```

This injects the canary HTML at the start of your layout during SSR.

### Option 2: SSR with Bot Filtering

To filter out legitimate bots during SSR, use the page data:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'
import { isAllowlistedBot } from '@fuzzycanary/core'

export const load: LayoutServerLoad = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || ''
  const shouldShowCanary = !isAllowlistedBot(userAgent)

  return {
    shouldShowCanary,
  }
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { getCanaryHtml } from '@fuzzycanary/core'
  import type { PageData } from './$types'

  export let data: PageData

  const canaryHtml = getCanaryHtml()
</script>

{#if data.shouldShowCanary}
  {@html canaryHtml}
{/if}
<slot />
```

**Note**: You'll need to export `isAllowlistedBot` from the main package exports first.

### Option 3: Client-Side Initialization

For client-side only initialization:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte'

  onMount(async () => {
    await import('@fuzzycanary/core/auto')
  })
</script>

<slot />
```

This approach:

- Initializes on the client only
- Filters bots via `navigator.userAgent`
- Works for static sites

## Static Sites (adapter-static)

If you're building a static site with `adapter-static`, use client-side initialization:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte'

  onMount(async () => {
    await import('@fuzzycanary/core/auto')
  })
</script>

<slot />
```

**Why?** Static builds don't have per-request user agents, so bot filtering must happen client-side.

## How It Works

1. **SSR Rendering**: The SDK generates hidden honeypot link HTML during server-side rendering.

2. **Bot Detection**: When using `isAllowlistedBot()`, legitimate bots (Google, Bing, etc.) don't receive the canary.

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

## Advanced: Per-Route Canary

If you want the canary only on specific routes:

```svelte
<!-- src/routes/protected/+layout.svelte -->
<script>
  import { onMount } from 'svelte'

  onMount(async () => {
    const { init } = await import('@fuzzycanary/core')
    init()
  })
</script>

<slot />
```

## TypeScript Setup

For better type safety with server load functions:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || ''

  // Your bot detection logic
  const shouldShowCanary = true // Add your logic here

  return {
    shouldShowCanary,
  }
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { getCanaryHtml } from '@fuzzycanary/core'
  import type { PageData } from './$types'

  export let data: PageData

  const canaryHtml = getCanaryHtml()
</script>

{#if data.shouldShowCanary}
  {@html canaryHtml}
{/if}
<slot />
```

## Using with Different Adapters

### adapter-node

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { getCanaryHtml } from '@fuzzycanary/core'
  const canaryHtml = getCanaryHtml()
</script>

{@html canaryHtml}
<slot />
```

Works perfectly with SSR. Add bot filtering via `+layout.server.ts` if needed.

### adapter-vercel / adapter-netlify

Same as adapter-node - SSR works out of the box.

### adapter-cloudflare

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { getCanaryHtml } from '@fuzzycanary/core'
  const canaryHtml = getCanaryHtml()
</script>

{@html canaryHtml}
<slot />
```

Works with Cloudflare Workers SSR.

### adapter-static

Use client-side initialization (see above).

## SvelteKit Configuration

Make sure you have the appropriate adapter installed:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },
}

export default config
```

## Troubleshooting

### Canary not appearing

1. Check that `{@html canaryHtml}` is in your layout
2. Verify the import: `import { getCanaryHtml } from '@fuzzycanary/core'`
3. Inspect the SSR output in browser dev tools
4. Look for `<div data-fuzzy-canary="true">` in the DOM

### Bot filtering not working

1. Make sure you're using an SSR adapter (not adapter-static)
2. Verify `request.headers.get('user-agent')` returns a value
3. Check if the bot is in the allowlist
4. For static sites, use client-side init for bot filtering

### Hydration warnings

If you see hydration warnings:

- Make sure the canary is rendered consistently on server and client
- Don't mix SSR HTML and client-side init in the same component
- Use `{@html}` for SSR or `onMount()` for client-side, not both

### TypeScript errors

If you get type errors:

```bash
# Regenerate types
npm run build
# or
pnpm build
```

### Client-side init not running

1. Make sure you're using `onMount()` from Svelte
2. Check browser console for errors
3. Verify the import path: `'@fuzzycanary/core/auto'`
4. Test in production build, not just dev mode

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

1. **Use SSR**: Inject canary during SSR for maximum effectiveness
2. **Filter Bots**: Use `+layout.server.ts` to filter legitimate bots
3. **Single Instance**: Only add the canary once in your root layout
4. **Monitor Honeypots**: Set up alerts on the trap URLs
5. **Test Both Modes**: Verify in dev and production builds

## Example Project Structure

```
src/
├── routes/
│   ├── +layout.svelte       # Add canary here
│   ├── +layout.server.ts    # Optional: bot filtering
│   ├── +page.svelte
│   └── about/
│       └── +page.svelte
└── lib/
    └── index.ts
```

## Complete Example with Bot Filtering

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'
import { isAllowlistedBot } from '@fuzzycanary/core'

export const load: LayoutServerLoad = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || ''
  const shouldShowCanary = !isAllowlistedBot(userAgent)

  return {
    shouldShowCanary,
  }
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { getCanaryHtml } from '@fuzzycanary/core'
  import type { PageData } from './$types'
  import '../app.css'

  export let data: PageData

  const canaryHtml = getCanaryHtml()
</script>

<svelte:head>
  <title>Your SvelteKit App</title>
</svelte:head>

{#if data.shouldShowCanary}
  {@html canaryHtml}
{/if}

<div class="app">
  <slot />
</div>
```

## Comparison with Other Frameworks

| Feature            | SvelteKit    | Next.js                  | Remix        |
| ------------------ | ------------ | ------------------------ | ------------ |
| HTML String Method | Yes          | No                       | No           |
| SSR Bot Filtering  | Yes (manual) | Yes (auto in App Router) | Yes (manual) |
| Client-Side Init   | Yes          | Yes                      | Yes          |
| Static Export      | Yes          | Yes                      | Yes          |
| Setup Complexity   | Simple       | Simplest                 | Simple       |

## Next Steps

- Set up monitoring on your honeypot URLs
- Test with different user agents to verify bot filtering
- Deploy to your preferred platform (Vercel, Netlify, Cloudflare, etc.)
- Monitor scraper activity via the trap URLs

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
