# Fuzzy Canary

Client-side SDK that plants hidden honeypot links (porn links) in the DOM to trigger AI scrapers' content safety filters. When AI bots scrape your site, they ingest these adult content links, causing their safety filters to flag or refuse the scraped data - breaking the scraping pipeline. No configuration required.

<div align="center">

**dom** • **sdk** • **anti-scraping** • **hidden** • **payload**

</div>

## Getting Started

### Installation

```bash
npm i @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

### Usage

There are two ways to use it: client-side or server-side. Use server-side if you can—it works better because the canary is in the HTML from the start, so scrapers that don't run JavaScript will still see it.

**Server-side (recommended):**

If you're using a React-based framework (Next.js, Remix, etc.), add the `<Canary />` component to your root layout:

```tsx
// Next.js App Router: app/layout.tsx
// Remix: app/root.tsx
// Other React frameworks: your root layout file
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

For Next.js, that's it. For other frameworks like Remix, you'll need to pass the user agent from your loader:

```tsx
// Remix example
export async function loader({ request }) {
  const userAgent = request.headers.get('user-agent') || ''
  return { userAgent }
}

export default function App() {
  const { userAgent } = useLoaderData()
  return (
    <html>
      <body>
        <Canary userAgent={userAgent} />
        {children}
      </body>
    </html>
  )
}
```

For non-React frameworks, use the `getCanaryHtml()` utility and insert it at the start of your `<body>` tag.

**Client-side:**

If you're building a static site or prefer client-side injection, import the auto-init in your entry file:

```ts
// Your main entry file (e.g., main.ts, index.ts, App.tsx)
import '@fuzzycanary/core/auto'
```

That's it. It will automatically inject the canary when the page loads.

## Notes on SEO

Fuzzy Canary tries to avoid showing the canary to legitimate search engines. It keeps a list of known bots—Google, Bing, DuckDuckGo, and so on—and skips injecting the links when it detects them.

This works fine if your site is server-rendered. The server can check the incoming request's user agent before deciding whether to include the canary in the HTML. Google's crawler gets clean HTML, AI scrapers get the canary.

The problem is static sites. If your HTML is generated at build time and served as plain files, there's no user agent to check. The canary gets baked into the HTML for everyone, including Google. Right now this will hurt your SEO, because Google will see those links.

If you're using a static site generator, you probably want to use the client-side initialization instead. The JavaScript can check `navigator.userAgent` at runtime and skip injection for search bots. That's not perfect—it only works for bots that execute JavaScript—but it's better than nothing.
