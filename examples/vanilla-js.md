# Using Fuzzy Canary with Vanilla JavaScript

This guide shows you how to integrate Fuzzy Canary into a plain HTML/JavaScript website without any framework.

## Installation

### Option 1: NPM Package

```bash
npm install @fuzzycanary/core
# or
pnpm add @fuzzycanary/core
```

Then bundle with your build tool or import directly if using a bundler.

### Option 2: CDN (Coming Soon)

The package can be used via CDN for quick integration without a build step.

## Setup

### Using ES Modules (Modern Browsers)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>Your content here...</p>

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

### Using a Bundler (Webpack, Rollup, Vite, etc.)

If you're using a bundler with vanilla JS:

```js
// src/main.js
import '@fuzzycanary/core/auto'

// Your app code
console.log('App initialized')
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>Your content here...</p>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Manual Initialization

For more control:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>Your content here...</p>

    <script type="module">
      import { init } from '@fuzzycanary/core'

      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          init()
        })
      } else {
        init()
      }
    </script>
  </body>
</html>
```

### Using with Vite (No Framework)

```js
// main.js
import '@fuzzycanary/core/auto'
import './style.css'

// Your vanilla JS code
document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello Vanilla!</h1>
    <p>Your content here</p>
  </div>
`
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## How It Works

1. **Client-Side Injection**: The SDK injects hidden honeypot links into the DOM when the page loads.

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

## Static HTML Sites

For completely static sites (no build step):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Static Site</title>
  </head>
  <body>
    <header>
      <h1>My Website</h1>
    </header>

    <main>
      <p>Your content here...</p>
    </main>

    <footer>
      <p>&copy; 2024 My Website</p>
    </footer>

    <!-- Initialize Fuzzy Canary -->
    <script type="module">
      // Use dynamic import to load from node_modules or CDN
      import('@fuzzycanary/core/auto')
    </script>
  </body>
</html>
```

## Server-Side Injection (Optional)

If you have a simple Node.js server serving HTML:

```js
// server.js
import express from 'express'
import { getCanaryHtml } from '@fuzzycanary/core'
import fs from 'fs'

const app = express()

app.get('/', (req, res) => {
  const canaryHtml = getCanaryHtml()
  const html = fs.readFileSync('./index.html', 'utf-8')

  // Inject canary after <body> tag
  const modifiedHtml = html.replace('<body>', `<body>\n${canaryHtml}`)

  res.send(modifiedHtml)
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

## Multiple Pages

For multi-page websites, include the initialization script on each page:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Home</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about.html">About</a>
    </nav>

    <h1>Home Page</h1>

    <script type="module" src="/init-canary.js"></script>
  </body>
</html>
```

```html
<!-- about.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>About</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about.html">About</a>
    </nav>

    <h1>About Page</h1>

    <script type="module" src="/init-canary.js"></script>
  </body>
</html>
```

```js
// init-canary.js
import '@fuzzycanary/core/auto'
```

## Using with jQuery

The canary works alongside jQuery:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>jQuery Site</title>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  </head>
  <body>
    <h1>Welcome</h1>
    <button id="myButton">Click Me</button>

    <script>
      $(document).ready(function () {
        $('#myButton').on('click', function () {
          alert('Button clicked!')
        })
      })
    </script>

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## Using with Alpine.js

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Alpine.js Site</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  </head>
  <body>
    <div x-data="{ open: false }">
      <button @click="open = !open">Toggle</button>
      <div x-show="open">Content</div>
    </div>

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## Using with HTMX

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTMX Site</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
  </head>
  <body>
    <button hx-get="/api/data" hx-target="#result">Load Data</button>
    <div id="result"></div>

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## Troubleshooting

### Canary not appearing

1. Check browser console for errors
2. Verify the module import path is correct
3. Make sure the script runs after `<body>` is loaded
4. Inspect the DOM for `<div data-fuzzy-canary="true">`

### Module import errors

If you get module import errors:

- Make sure you're using `type="module"` in the script tag
- Check that your server serves `.js` files with correct MIME type
- For local development, use a local server (not `file://`)

### CORS errors

If loading from node_modules fails:

- Use a bundler (Vite, Webpack, etc.)
- Or serve node_modules directory from your server
- Or wait for CDN support (coming soon)

### Bot filtering not working

- Client-side bot filtering uses `navigator.userAgent`
- Some bots fake user agents - this is expected
- For better bot filtering, use server-side injection

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

1. **Load After Body**: Put the script at the end of `<body>` or use `defer`/`async`
2. **Use Module Type**: Always use `type="module"` for ES module imports
3. **Single Initialization**: Only initialize once per page
4. **Monitor Honeypots**: Set up alerts when trap URLs are accessed
5. **Test in Production**: Verify the canary appears in production

## Example Project Structure

```
project/
├── index.html
├── about.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── init-canary.js
└── package.json
```

## Using with Popular Static Site Generators

### 11ty (Eleventy)

```html
<!-- _includes/base.njk -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ title }}</title>
  </head>
  <body>
    {{ content | safe }}

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

### Hugo

```html
<!-- layouts/_default/baseof.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ .Title }}</title>
  </head>
  <body>
    {{ block "main" . }}{{ end }}

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

### Jekyll

```html
<!-- _layouts/default.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ page.title }}</title>
  </head>
  <body>
    {{ content }}

    <script type="module">
      import '@fuzzycanary/core/auto'
    </script>
  </body>
</html>
```

## Next Steps

- Set up monitoring on your honeypot URLs
- Test the canary in production
- Monitor scraper activity via the trap URLs
- Consider server-side injection for better bot filtering

## Support

- [GitHub Issues](https://github.com/vivienhenz24/fuzzyfrontend/issues)
- [Package README](../packages/core/README.md)
