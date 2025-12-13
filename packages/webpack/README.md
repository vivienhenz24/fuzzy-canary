# @yourpkg/webpack

Webpack plugin adapter for [`@yourpkg/core`](https://www.npmjs.com/package/@yourpkg/core). Injects a tiny inline module that calls `init()` at build time. Requires `html-webpack-plugin`.

## Install

```bash
pnpm add @yourpkg/core @yourpkg/webpack html-webpack-plugin
```

## Usage

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { YourPkgWebpackPlugin } = require('@yourpkg/webpack')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin(),
    new YourPkgWebpackPlugin({
      token: 'your-token', // plus any InitOptions from @yourpkg/core
      position: 'head',    // or 'body'
    }),
  ],
}
```

This plugin is intentionally thin: it only injects the inline module that imports `init()` from `@yourpkg/core` with your options. All logic stays in the core SDK.
