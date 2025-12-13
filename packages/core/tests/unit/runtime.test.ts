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

  it('allows calling init from the global to place comment/offscreen canaries', async () => {
    await import('../../src/runtime')

    vi.spyOn(Math, 'random').mockReturnValue(0.75)
    ;(window as any).YourPkg.init()
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeTruthy()
    expect(collectComments().length).toBeGreaterThan(0)
  })

  it('skips off-screen node when UA looks like a search bot', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    await import('../../src/runtime')
    ;(window as any).YourPkg.init()
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeNull()
  })
})
