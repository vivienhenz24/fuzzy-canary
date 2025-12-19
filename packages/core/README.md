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

For non-React frameworks, use the `getCanaryHtml()` utility and insert it at the start of your `<body>` tag.

**Client-side:**

If you're building a static site or prefer client-side injection, import the auto-init in your entry file:

```ts
// Your main entry file (e.g., main.ts, index.ts, App.tsx)
import '@fuzzycanary/core/auto'
```

That's it. It will automatically inject the canary when the page loads.

## Notes on SEO

Fuzzy Canary now injects for every visitor, including crawlers. If you're concerned about how this affects indexing or rankings, consider testing in a staging environment before rolling out to production.
