import { describe, it, expect } from 'vitest'
import yourPkgVitePlugin from '../src'

const baseHtml = `
<!doctype html>
<html>
  <head><title>Test</title></head>
  <body><div id="root"></div></body>
</html>
`

describe('@yourpkg/vite plugin', () => {
  it('injects inline module into head by default', () => {
    const plugin = yourPkgVitePlugin({ token: 'abc' })
    const transformed = plugin.transformIndexHtml!(baseHtml) as string
    expect(transformed).toContain("import { init } from '@yourpkg/core'")
    expect(transformed).toContain('abc')
    const headIndex = transformed.indexOf('import { init')
    const bodyIndex = transformed.indexOf('<body>')
    expect(headIndex).toBeGreaterThan(0)
    expect(headIndex).toBeLessThan(bodyIndex)
  })

  it('injects into body when position=body', () => {
    const plugin = yourPkgVitePlugin({ token: 'xyz', position: 'body' })
    const transformed = plugin.transformIndexHtml!(baseHtml) as string
    const headIndex = transformed.indexOf('import { init')
    const bodyIndex = transformed.lastIndexOf('</body>')
    expect(headIndex).toBeLessThan(bodyIndex)
    expect(transformed).toContain('xyz')
  })
})
