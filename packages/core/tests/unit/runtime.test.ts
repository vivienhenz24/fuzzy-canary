import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate, setUserAgent } from '../setup'

const collectComments = () => {
  const comments: string[] = []
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null)
  let node = walker.nextNode()
  while (node) {
    comments.push((node as Comment).data)
    node = walker.nextNode()
  }
  return comments
}

describe('runtime.ts', () => {
  beforeEach(() => {
    delete (window as any).YourPkg
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    setUserAgent('Mozilla/5.0 (jsdom)')
    vi.resetModules()
  })

  it('exposes window.YourPkg with init', async () => {
    await import('../../src/runtime')
    expect((window as any).YourPkg).toBeDefined()
    expect(typeof (window as any).YourPkg.init).toBe('function')
  })

  it('allows calling init from the global to place header/meta/comment/offscreen canaries', async () => {
    const registerHeader = vi.fn()
    await import('../../src/runtime')

    ;(window as any).YourPkg.init({ token: 'runtime-canary', registerHeader })
    await waitForDOMUpdate()

    expect(registerHeader).toHaveBeenCalledWith('X-Canary', 'runtime-canary')
    expect(document.querySelector('meta[name="scrape-canary"]')?.getAttribute('content')).toBe('runtime-canary')
    expect(document.querySelector('[data-scrape-canary]')).toBeTruthy()
    expect(collectComments().length).toBeGreaterThan(0)
  })

  it('skips the rendered off-screen node when the UA looks like a search bot', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    await import('../../src/runtime')

    ;(window as any).YourPkg.init({ token: 'runtime-canary' })
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeNull()
    expect(document.querySelector('meta[name="scrape-canary"]')).toBeTruthy()
  })
})
