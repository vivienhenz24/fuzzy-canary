import type { Plugin } from 'vite'
import type { InitOptions } from '@yourpkg/core'

export interface YourPkgViteOptions extends InitOptions {
  /**
   * Where to inject the script tag in HTML.
   * 'head' (default) or 'body'
   */
  position?: 'head' | 'body'
}

/**
 * Vite plugin that injects a tiny inline module calling init() from @yourpkg/core.
 * Keeps all logic in @yourpkg/core; this only wires the call during HTML build.
 */
export function yourPkgVitePlugin(options: YourPkgViteOptions): Plugin {
  const { position = 'head', ...initOptions } = options
  const script = `<script type="module">import { init } from '@yourpkg/core'; init(${JSON.stringify(
    initOptions
  )});</script>`

  return {
    name: '@yourpkg/vite',
    enforce: 'post',
    transformIndexHtml(html) {
      if (position === 'body') {
        return html.replace(/<\/body>/i, `${script}\n</body>`)
      }
      return html.replace(/<\/head>/i, `${script}\n</head>`)
    },
  }
}

export default yourPkgVitePlugin
