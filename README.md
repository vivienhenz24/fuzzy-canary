# FuzzyFrontend

An open-source, installable client-side SDK that adds a hidden text payload into a page's DOM at runtime.

## Features

- 🎯 Framework-agnostic core package
- 📦 Easy installation via `<script>` tag or npm import
- 🔌 Framework-specific adapters (Next.js, Vite, Webpack)
- 🎨 Multiple hiding modes (display-none, offscreen, visibility-hidden)
- ♿ Accessibility-friendly (aria-hidden, no layout impact)
- 🔒 CSP-friendly (no inline JS requirements)

## Quick Start

### Via Script Tag

```html
<script src="https://cdn.jsdelivr.net/npm/@yourpkg/core/dist/runtime.min.js"></script>
<script>
  window.YourPkg.init({ text: "Your hidden payload here" })
</script>
```

### Via npm

```bash
npm install @yourpkg/core
```

```javascript
import { init } from '@yourpkg/core';

init({
  text: "Your hidden payload here",
  mode: "display-none"
});
```

## Documentation

Coming soon! This repository is under active development.

## License

MIT

