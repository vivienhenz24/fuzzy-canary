# Using Fuzzy Canary with Next.js

This guide shows you how to integrate Fuzzy Canary into your Next.js application (App Router).

## Installation

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

## Setup

### 1. Add the Canary Component to Your Root Layout

In your `app/layout.tsx` file, import and add the `<Canary />` component at the start of your `<body>` tag:

```tsx
// app/layout.tsx
import { Canary } from '@fuzzycanary/core/react'
import './globals.css'

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

That's it! The component will:

- Automatically detect the user agent from Next.js headers
- Skip rendering for legitimate bots (Google, Bing, social media crawlers)
- Inject hidden canary links at the start of the body
- Work seamlessly with server-side rendering

## How It Works

1. **Server-Side Rendering**: The `<Canary />` component renders during SSR and injects hidden honeypot links into the HTML.

2. **Automatic Bot Detection**: The component uses Next.js `headers()` to read the user agent and filters out legitimate bots using the built-in allowlist.

3. **Hidden Links**: The canary links are invisible to users but present in the DOM for scrapers to discover:

   ```html
   <div
     data-fuzzy-canary="true"
     style="display:none;position:absolute;left:-9999px;visibility:hidden"
   >
     <a href="https://trap-url.com/..." data-canary-link="true">Description - URL</a>
   </div>
   ```

4. **Client-Side Detection**: If you also use client-side initialization, the SDK automatically detects SSR-injected canaries and skips duplicate injection.

## Static Exports

If you're using Next.js static exports (`output: 'export'` in `next.config.js`), the canary will be baked into the HTML at build time. However, **bot filtering won't work** because there's no per-request user agent at build time.

**Recommended approach for static sites**:

- Remove the `<Canary />` component from your layout
- Use client-side auto-init instead:

```tsx
// app/layout.tsx
import './globals.css'
// Import on client side only
import { useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Dynamic import to ensure client-side only
    import('@fuzzycanary/core/auto')
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

This way, allowlisted bots that execute JavaScript will skip injection via `navigator.userAgent`.

## Advanced: Manual User Agent Passing

If you've opted out of dynamic rendering or need manual control:

```tsx
// app/layout.tsx
import { Canary } from '@fuzzycanary/core/react'
import { headers } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined

  return (
    <html lang="en">
      <body>
        <Canary userAgent={userAgent} />
        {children}
      </body>
    </html>
  )
}
```

## Client-Side Only (Not Recommended)

If you prefer client-side initialization only, add this to your root layout:

```tsx
// app/layout.tsx
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import('@fuzzycanary/core/auto')
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

However, **SSR is recommended** because scrapers that don't execute JavaScript won't see the canary.

## Troubleshooting

### Canary not appearing in HTML

1. Check that `<Canary />` is inside the `<body>` tag
2. Verify you're not using static exports (check `next.config.js`)
3. Make sure your layout is a Server Component (no `'use client'` directive)

### Multiple canaries appearing

This shouldn't happen as the SDK detects duplicates, but if it does:

- Use either SSR (`<Canary />`) OR client-side (`import '@fuzzycanary/core/auto'`), not both
- Make sure you're not importing the component multiple times

### Canary showing to Google/Bing

The bot allowlist includes major search engines by default. If you're still seeing issues:

- Verify the user agent is being passed correctly
- Check that you're using SSR (not static export)
- The component should return `null` for allowlisted bots

## What Gets Injected

The package maintainer configures honeypot URLs at build time using GitHub Actions secrets. You don't need to configure anything - the URLs are already baked into the distributed package.

The injected HTML looks like:

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

1. **Use SSR**: Place `<Canary />` in your root layout for maximum effectiveness
2. **Server Component**: Keep your layout as a Server Component for automatic user agent detection
3. **Single Instance**: Only add the component once in your root layout
4. **Monitor Traps**: Set up monitoring on the honeypot URLs to detect when scrapers visit them
5. **Avoid Static Exports**: Use SSR/dynamic rendering for proper bot filtering

## Next Steps

- Monitor your honeypot URLs for unauthorized access
- Set up alerts when the canary URLs are accessed
- Review your bot allowlist if you need to add custom legitimate crawlers

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
