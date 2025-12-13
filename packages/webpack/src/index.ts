import type { Compiler } from 'webpack'
import type { InitOptions } from '@fuzzycanary/core'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export interface YourPkgWebpackOptions extends InitOptions {
  /**
   * Where to inject the inline module. Defaults to head.
   */
  position?: 'head' | 'body'
}

/**
 * Webpack plugin that injects an inline module calling init() from @fuzzycanary/core.
 * Relies on HtmlWebpackPlugin being present in the config.
 */
export class YourPkgWebpackPlugin {
  private readonly options: YourPkgWebpackOptions

  constructor(options: YourPkgWebpackOptions) {
    this.options = { ...options, position: options.position ?? 'head' }
  }

  apply(compiler: Compiler): void {
    const pluginName = '@fuzzycanary/webpack'
    const script = `<script type="module">import { init } from '@fuzzycanary/core'; init(${JSON.stringify(
      this.options
    )});</script>`
    const inline = script.replace('<script type="module">', '').replace('</script>', '')

    compiler.hooks.compilation.tap(pluginName, compilation => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation)
      hooks.alterAssetTagGroups.tap(pluginName, data => {
        if (this.options.position === 'body') {
          data.bodyTags.push({
            tagName: 'script',
            voidTag: false,
            attributes: { type: 'module' },
            innerHTML: inline,
            meta: {},
          })
        } else {
          data.headTags.push({
            tagName: 'script',
            voidTag: false,
            attributes: { type: 'module' },
            innerHTML: inline,
            meta: {},
          })
        }
        return data
      })
    })
  }
}

export default YourPkgWebpackPlugin
