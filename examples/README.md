# Fuzzy Canary - Framework Examples

This directory contains comprehensive guides for integrating Fuzzy Canary into various frontend frameworks and environments.

## Available Guides

### Meta-Frameworks

- **[Next.js](./nextjs.md)** - Complete guide for Next.js App Router
  - SSR with automatic user agent detection
  - Static export considerations
  - Troubleshooting and best practices

- **[Remix](./remix.md)** - Integration guide for Remix
  - SSR with loader data
  - Manual user agent passing
  - Custom bot filtering

### Modern Frameworks

- **[Astro](./astro.md)** - Complete Astro integration guide
  - SSR and SSG approaches
  - Bot filtering with SSR
  - React component option
  - Multiple layout support

- **[SvelteKit](./sveltekit.md)** - SvelteKit integration guide
  - HTML string method
  - SSR with bot filtering
  - Static site support
  - Works with all adapters

### React

- **[Generic React](./react.md)** - For Create React App, Vite, and other React setups
  - Auto-init and manual initialization
  - Works with React Router
  - Vite and CRA examples
  - Custom SSR support

### Vanilla JavaScript

- **[Vanilla JS](./vanilla-js.md)** - Plain HTML/JavaScript integration
  - ES modules approach
  - Works with bundlers
  - Static site generators (11ty, Hugo, Jekyll)
  - Compatible with jQuery, Alpine.js, HTMX

## Quick Reference

### Installation

All guides use the same package:

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

### Setup Patterns

| Framework        | Recommended Approach     | Bot Filtering     |
| ---------------- | ------------------------ | ----------------- |
| Next.js          | `<Canary />` component   | Automatic (SSR)   |
| Remix            | `<Canary />` with loader | Server-side       |
| Astro            | `getCanaryHtml()`        | Server-side (SSR) |
| SvelteKit        | `getCanaryHtml()`        | Server-side (SSR) |
| React (CRA/Vite) | Auto-init import         | Client-side       |
| Vanilla JS       | Auto-init import         | Client-side       |

### Three Main Integration Methods

1. **React Component (SSR)**

   ```tsx
   import { Canary } from '@fuzzycanary/core/react'
   ;<Canary userAgent={userAgent} />
   ```

2. **HTML String (SSR)**

   ```ts
   import { getCanaryHtml } from '@fuzzycanary/core'
   const html = getCanaryHtml()
   ```

3. **Client-Side Auto-Init**
   ```ts
   import '@fuzzycanary/core/auto'
   ```

## Choosing the Right Approach

### Use SSR (Server-Side Rendering) When:

- You need to filter bots before sending HTML
- You're using a framework with SSR support
- Maximum effectiveness against non-JS scrapers is important

**Frameworks**: Next.js, Remix, Astro (SSR), SvelteKit

### Use Client-Side When:

- Building a single-page application (SPA)
- Using static site generation
- Simplicity is more important than perfect bot filtering

**Frameworks**: React (CRA/Vite), Vanilla JS, Static sites

## Bot Filtering

The package includes an allowlist of legitimate bots:

- **Search Engines**: Google, Bing, DuckDuckGo, Baidu, Yandex
- **Social Media**: Meta/Facebook, Twitter/X, LinkedIn, Pinterest
- **Link Previews**: Slack, Discord, Telegram

### How It Works

1. **Server-Side**: Reads user agent from HTTP headers, filters before rendering
2. **Client-Side**: Uses `navigator.userAgent` to filter bots that execute JavaScript

## Static Sites

For static sites (SSG), bot filtering must happen client-side:

```ts
// Uses navigator.userAgent to filter bots
import '@fuzzycanary/core/auto'
```

**Note**: This only works for bots that execute JavaScript. For static sites with server-side bot filtering, use edge middleware or a CDN.

## Common Features

All integrations provide:

- ✅ Hidden honeypot links in the DOM
- ✅ Invisible to users (CSS hidden)
- ✅ Automatic duplicate detection
- ✅ Zero configuration required
- ✅ Pre-configured honeypot URLs (set by package maintainer)

## Troubleshooting

### Canary Not Appearing

1. Check browser inspector for `<div data-fuzzy-canary="true">`
2. Verify correct import path
3. Check browser console for errors
4. Ensure script runs after DOM is ready

### Multiple Canaries

- Don't use both SSR and client-side init
- Only initialize once per page
- Check for duplicate imports

### Bot Filtering Not Working

- Verify user agent is passed correctly (SSR)
- Check if bot is in the allowlist
- Remember: Some bots fake user agents

## Support

- [Main Package README](../packages/core/README.md)
- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Source Code](../packages/core/src/)

## Contributing

Found an issue or want to add a new framework guide? Please open an issue or PR on GitHub!
