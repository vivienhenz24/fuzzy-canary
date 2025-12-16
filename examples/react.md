# Using Fuzzy Canary with React (Generic/CRA/Vite)

This guide shows you how to integrate Fuzzy Canary into a generic React application (Create React App, Vite, or other React setups without a meta-framework).

## Installation

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

## Setup

### Option 1: Auto-Init (Recommended)

In your entry file (e.g., `src/main.tsx` for Vite or `src/index.tsx` for CRA):

```tsx
// src/main.tsx (Vite) or src/index.tsx (CRA)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Import once to initialize canary
import '@fuzzycanary/core/auto'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

That's it! The SDK will automatically inject hidden canary links into your DOM.

### Option 2: Manual Initialization

For more control over when initialization happens:

```tsx
// src/main.tsx or src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { init } from '@fuzzycanary/core'
import './index.css'

// Initialize canary manually
init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Option 3: Initialize in App Component

You can also initialize inside your root component:

```tsx
// src/App.tsx
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    import('@fuzzycanary/core/auto')
  }, [])

  return <div className="App">{/* Your app content */}</div>
}

export default App
```

## How It Works

1. **Client-Side Injection**: The SDK injects hidden honeypot links into the DOM when your app loads.

2. **Bot Detection**: Uses `navigator.userAgent` to filter out legitimate bots (Google, Bing, social media crawlers).

3. **Hidden Links**: Invisible to users but present in the DOM for scrapers:

   ```html
   <div
     data-fuzzy-canary="true"
     style="display:none;position:absolute;left:-9999px;visibility:hidden"
   >
     <a href="https://trap-url.com/..." data-canary-link="true">Description - URL</a>
   </div>
   ```

4. **Auto-Detection**: Checks if the canary was already injected to avoid duplicates.

## React 18 Strict Mode

In development, React 18 Strict Mode runs effects twice. The SDK handles this automatically:

```tsx
// src/main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

The canary will only be injected once, even with Strict Mode enabled.

## Create React App (CRA)

```tsx
// src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import '@fuzzycanary/core/auto'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## Vite + React

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@fuzzycanary/core/auto'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## Vite + React + TypeScript

Same as above - TypeScript works out of the box.

## React Router

The canary works seamlessly with React Router:

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@fuzzycanary/core/auto'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

## Advanced: Conditional Initialization

If you want to enable the canary only in production:

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Only in production
if (import.meta.env.PROD) {
  import('@fuzzycanary/core/auto')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

For CRA:

```tsx
if (process.env.NODE_ENV === 'production') {
  import('@fuzzycanary/core/auto')
}
```

## Using with Context Providers

The canary initialization is independent of your React tree:

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import '@fuzzycanary/core/auto'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
```

## SSR with React (Node.js)

If you're doing custom React SSR (not using Next.js/Remix):

**Server-side:**

```tsx
// server.tsx
import { renderToString } from 'react-dom/server'
import { getCanaryHtml } from '@fuzzycanary/core'
import App from './App'

app.get('*', (req, res) => {
  const appHtml = renderToString(<App />)
  const canaryHtml = getCanaryHtml()

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        ${canaryHtml}
        <div id="root">${appHtml}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `

  res.send(html)
})
```

**Client-side:**

```tsx
// client.tsx
import { hydrateRoot } from 'react-dom/client'
import App from './App'
// Don't initialize again - SSR already injected it
// The SDK will auto-detect the SSR canary

hydrateRoot(document.getElementById('root')!, <App />)
```

## Troubleshooting

### Canary not appearing

1. Check browser console for errors
2. Verify the import: `import '@fuzzycanary/core/auto'`
3. Inspect the DOM for `<div data-fuzzy-canary="true">`
4. Make sure the code runs after the DOM is ready

### Multiple canaries appearing

1. Don't import `@fuzzycanary/core/auto` multiple times
2. Don't call `init()` more than once
3. Check if you have multiple entry points

### TypeScript errors

If you get TypeScript errors with the import:

```bash
# Install or update the package
npm install @fuzzycanary/core@latest
```

If types are still not found:

```ts
// Add to src/vite-env.d.ts or src/react-app-env.d.ts
/// <reference types="@fuzzycanary/core" />
```

### Vite build errors

If you get build errors with Vite:

```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

### CRA build errors

If you get build errors with CRA:

```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
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

1. **Import Once**: Add `import '@fuzzycanary/core/auto'` in your entry file
2. **Production Only**: Consider enabling only in production builds
3. **Monitor Honeypots**: Set up alerts when the trap URLs are accessed
4. **Test in Production**: Verify the canary appears in production builds
5. **Don't Over-Initialize**: Import once, let the SDK handle the rest

## Example Project Structure

### Vite

```
src/
├── main.tsx              # Import '@fuzzycanary/core/auto' here
├── App.tsx
├── components/
│   └── ...
└── index.css
```

### Create React App

```
src/
├── index.tsx             # Import '@fuzzycanary/core/auto' here
├── App.tsx
├── components/
│   └── ...
└── index.css
```

## Comparison with Meta-Frameworks

| Feature         | Generic React | Next.js App Router | Remix           |
| --------------- | ------------- | ------------------ | --------------- |
| Setup           | Simple        | Simpler            | Simple          |
| SSR Support     | Manual        | Automatic          | Automatic       |
| Bot Filtering   | Client-Side   | Server + Client    | Server + Client |
| Auto User Agent | Client-Side   | Server-Side        | Server-Side     |
| Best Use Case   | SPAs          | Full-Stack         | Full-Stack      |

## When to Use Generic React Setup

Use this approach when:

- Building a single-page application (SPA)
- Not using a meta-framework like Next.js or Remix
- Client-side bot filtering is sufficient
- You want the simplest possible setup

Consider a meta-framework (Next.js, Remix) if:

- You need server-side rendering for SEO
- You want better bot filtering before HTML is sent
- You're building a full-stack application

## Next Steps

- Set up monitoring on your honeypot URLs
- Test the canary in production builds
- Monitor scraper activity via the trap URLs
- Consider adding SSR if you need stronger bot filtering

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
