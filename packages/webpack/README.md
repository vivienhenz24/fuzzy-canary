# @fuzzycanary/webpack

Webpack plugin adapter for [`@fuzzycanary/core`](https://www.npmjs.com/package/@fuzzycanary/core). Injects a tiny inline module that calls `init()` at build time. Requires `html-webpack-plugin`.

## Install

```bash
pnpm add @fuzzycanary/core @fuzzycanary/webpack html-webpack-plugin
```

## Usage

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { YourPkgWebpackPlugin } = require('@fuzzycanary/webpack')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin(),
    new YourPkgWebpackPlugin({
      token: 'your-token', // plus any InitOptions from @fuzzycanary/core
      position: 'head',    // or 'body'
    }),
  ],
}
```

This plugin is intentionally thin: it only injects the inline module that imports `init()` from `@fuzzycanary/core` with your options. All logic stays in the core SDK.
