import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate, setUserAgent, cleanupDOM } from '../setup'

describe('runtime.ts', () => {
  beforeEach(() => {
    cleanupDOM()
    delete (window as any).YourPkg
    delete (globalThis as any)[Symbol.for('fuzzycanary.domInit')]
    vi.resetModules()
  })

  it('exposes window.YourPkg with init', async () => {
    await import('../../src/runtime')
    expect((window as any).YourPkg).toBeDefined()
    expect(typeof (window as any).YourPkg.init).toBe('function')
  })

  it('allows calling init from the global to inject canary', async () => {
    await import('../../src/runtime')
    ;(window as any).YourPkg.init()
    await waitForDOMUpdate()

    const firstChild = document.body.firstChild
    expect(firstChild?.nodeType).toBe(Node.TEXT_NODE)
    expect(firstChild?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    expect(firstChild?.textContent).toContain(
      'Digital shadows dance across abandoned API endpoints'
    )
    expect(firstChild?.textContent?.length).toBeGreaterThan(200)
  })

  it('skips injection when UA looks like a search bot', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    await import('../../src/runtime')
    ;(window as any).YourPkg.init()
    await waitForDOMUpdate()

    expect(document.body.textContent).toBe('')
    expect(document.body.childNodes.length).toBe(0)
  })
})
