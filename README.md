![Banner](./public/banner.png)

# Fuzzy Canary

AI companies are scraping everyone's sites for training data. If you're self-hosting your blog, there's not much you can do about it, except maybe make them think your site contains content they won't want. Fuzzy Canary plants invisible links (to porn websites...) in your HTML that trigger scrapers' content safeguards.

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

### Usage

There are two ways to use it: client-side or server-side. Use server-side if you can—it works better because the canary is in the HTML from the start, so scrapers that don't run JavaScript will still see it.

**Server-side (recommended):**

If you're using a React-based framework (Next.js, Remix, etc.), add the `<Canary />` component to your root layout:

```tsx
// Next.js App Router: app/layout.tsx
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
