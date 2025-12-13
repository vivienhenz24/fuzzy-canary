# @fuzzycanary/next

Next.js adapter for [`@fuzzycanary/core`](https://www.npmjs.com/package/@fuzzycanary/core). Provides a `<YourPkgScript />` component that initializes the SDK on the client for both App Router and Pages Router apps.

## Install

```bash
pnpm add @fuzzycanary/core @fuzzycanary/next
```

## Usage (App Router)

```tsx
// app/layout.tsx
import { YourPkgScript } from '@fuzzycanary/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <YourPkgScript token="your-token" />
      </body>
    </html>
  )
}
```

## Usage (Pages Router)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { YourPkgScript } from '@fuzzycanary/next'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <YourPkgScript token="your-token" />
    </>
  )
}
```

`YourPkgScript` accepts the same options as `init()` from `@fuzzycanary/core`.
