# Using Fuzzy Canary with Remix

This guide shows you how to integrate Fuzzy Canary into your Remix application.

## Installation

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

## Setup

### SSR with React Component (Recommended)

In your `app/root.tsx`, import the `<Canary />` component and pass the user agent from your loader:

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Canary } from '@fuzzycanary/core/react'

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('user-agent') || ''

  return {
    userAgent,
  }
}

export default function App() {
  const { userAgent } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Canary userAgent={userAgent} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

**Why pass userAgent manually?**

Unlike Next.js, Remix doesn't have automatic header detection built into the framework. You need to explicitly read the user agent from the request headers in your loader and pass it to the component.

## How It Works

1. **Loader Reads Headers**: The root loader extracts the user agent from the request.

2. **SSR Component**: The `<Canary />` component receives the user agent and:
   - Checks if it matches the bot allowlist (Google, Bing, etc.)
   - Returns `null` for allowlisted bots
   - Renders hidden canary links for everyone else

3. **Hidden Injection**: The canary links are injected at the start of the `<body>`:

   ```html
   <div
     data-fuzzy-canary="true"
     style="display:none;position:absolute;left:-9999px;visibility:hidden"
   >
     <a href="https://trap-url.com/..." data-canary-link="true">Description - URL</a>
   </div>
   ```

4. **Client-Side Detection**: If you also use client-side initialization, the SDK detects SSR-injected canaries and skips duplicates.

## Alternative: Client-Side Only

If you prefer client-side initialization (not recommended for Remix):

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    import('@fuzzycanary/core/auto')
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

**Trade-off**: Scrapers that don't execute JavaScript won't see the canary.

## Advanced: Custom Bot Filtering

If you need to add custom logic for bot detection:

```tsx
// app/root.tsx
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Canary } from '@fuzzycanary/core/react'
import { isAllowlistedBot } from '@fuzzycanary/core'

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('user-agent') || ''

  // Add your custom bot detection logic
  const isCustomBot = userAgent.includes('MyCustomBot')
  const shouldShowCanary = !isAllowlistedBot(userAgent) && !isCustomBot

  return {
    userAgent,
    shouldShowCanary,
  }
}

export default function App() {
  const { userAgent, shouldShowCanary } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {shouldShowCanary && <Canary userAgent={userAgent} />}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

Note: You'll need to export `isAllowlistedBot` from the main package exports first.

## Static/SPA Mode

If you're using Remix in SPA mode or static generation, use client-side initialization:

```tsx
// app/root.tsx (SPA mode)
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    import('@fuzzycanary/core/auto')
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

## TypeScript Tips

For better type safety:

```tsx
// app/root.tsx
import type { LoaderFunctionArgs } from '@remix-run/node'
import type { SerializeFrom } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('user-agent') || ''

  return {
    userAgent,
  } as const
}

type LoaderData = SerializeFrom<typeof loader>

export default function App() {
  const { userAgent } = useLoaderData<LoaderData>()

  // ...
}
```

## Troubleshooting

### Canary not appearing in HTML

1. Check that `<Canary />` is inside the `<body>` tag
2. Verify the loader is running (check in Remix DevTools)
3. Make sure you're passing `userAgent` from the loader
4. Check if the user agent matches the bot allowlist

### Hydration errors

If you see hydration mismatches:

- Make sure the canary is rendered on both server and client
- Don't mix SSR component with client-side init
- Check that the user agent is being serialized correctly

### Bot filtering not working

1. Verify the user agent is being passed correctly
2. Check the loader data in Remix DevTools
3. Test with different user agents using browser dev tools or curl
4. Remember: The component returns `null` for allowlisted bots

### Performance considerations

The canary component is lightweight, but if you want to optimize:

- The loader is cached by Remix's built-in caching
- User agent parsing is minimal (just a regex test)
- SSR overhead is negligible (<1ms)

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

1. **Use SSR**: Pass user agent from root loader for maximum effectiveness
2. **Single Instance**: Only add `<Canary />` once in your root layout
3. **Monitor Honeypots**: Set up monitoring on the trap URLs
4. **Test Different User Agents**: Verify bot filtering works correctly
5. **Check SSR Output**: Inspect the initial HTML to confirm injection

## Example Project Structure

```
app/
├── root.tsx              # Add <Canary /> here
├── routes/
│   ├── _index.tsx
│   └── about.tsx
└── styles/
    └── global.css
```

## Comparison with Other Frameworks

| Feature                   | Remix         | Next.js App Router | Next.js Pages Router |
| ------------------------- | ------------- | ------------------ | -------------------- |
| Auto User Agent Detection | Manual        | Automatic          | Limited              |
| Setup Complexity          | Simple        | Simplest           | Simple               |
| Loader Required           | Yes           | No                 | Optional             |
| Best Approach             | SSR Component | SSR Component      | Client-Side          |

## Next Steps

- Monitor your honeypot URLs for unauthorized access
- Set up alerts when the canary URLs are accessed
- Test with different user agents to verify bot filtering

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
- [Remix Documentation](https://remix.run/docs)
