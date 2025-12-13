import type { Plugin } from 'vite'

export interface YourPkgViteOptions {
  /**
   * Where to inject the script tag in HTML.
   * 'head' (default) or 'body'
   */
  position?: 'head' | 'body'
}

/**
 * Vite plugin that injects a tiny inline module calling init() from @fuzzycanary/core.
 * Keeps all logic in @fuzzycanary/core; this only wires the call during HTML build.
 */
export function yourPkgVitePlugin(options: YourPkgViteOptions = {}): Plugin {
  const { position = 'head' } = options
  const script = `<script type="module">import { init } from '@fuzzycanary/core'; init();</script>`

  return {
    name: '@fuzzycanary/vite',
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
