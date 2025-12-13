import { describe, it, expect, vi } from 'vitest'

// Mock HtmlWebpackPlugin getHooks
const alterTap = vi.fn()
let capturedCallback: any
const mockHooks = {
  alterAssetTagGroups: {
    tap: alterTap.mockImplementation((_name: string, cb: any) => {
      capturedCallback = cb
    }),
  },
}

vi.mock('html-webpack-plugin', () => ({
  __esModule: true,
  default: {
    getHooks: () => mockHooks,
  },
  getHooks: () => mockHooks,
}))

import { YourPkgWebpackPlugin } from '../src'

describe('@fuzzycanary/webpack plugin', () => {
  it('registers alterAssetTagGroups and injects script into head by default', () => {
    const plugin = new YourPkgWebpackPlugin({ token: 'abc' })

    const compilationHook = { tap: vi.fn((_, fn) => fn({})) }
    const compiler: any = { hooks: { compilation: compilationHook } }

    plugin.apply(compiler)

    expect(compilationHook.tap).toHaveBeenCalled()
    expect(alterTap).toHaveBeenCalled()

    const data = { headTags: [], bodyTags: [] }
    capturedCallback(data)

    expect(data.headTags.length).toBe(1)
    expect(JSON.stringify(data.headTags[0])).toContain('abc')
  })

  it('injects into body when position=body', () => {
    const plugin = new YourPkgWebpackPlugin({ token: 'xyz', position: 'body' })
    const compilationHook = { tap: vi.fn((_, fn) => fn({})) }
    const compiler: any = { hooks: { compilation: compilationHook } }

    plugin.apply(compiler)

    const data = { headTags: [], bodyTags: [] }
    capturedCallback(data)

    expect(data.bodyTags.length).toBe(1)
    expect(JSON.stringify(data.bodyTags[0])).toContain('xyz')
  })
})
