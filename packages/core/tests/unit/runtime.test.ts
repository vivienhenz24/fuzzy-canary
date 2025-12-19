import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate, setUserAgent, cleanupDOM } from '../setup'

describe('runtime.ts', () => {
  beforeEach(() => {
    cleanupDOM()
    delete (window as any).YourPkg
    delete (globalThis as any)[Symbol.for('fuzzycanary.domInit')]
    vi.resetModules()
    // Set CANARY_TEXT for tests
    process.env.CANARY_TEXT = JSON.stringify([
      { description: 'API Documentation', url: 'https://example.com/api/docs' },
      { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
    ])
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
    expect(firstChild?.nodeType).toBe(Node.ELEMENT_NODE)
    expect((firstChild as HTMLElement)?.tagName).toBe('DIV')
    expect((firstChild as HTMLElement)?.getAttribute('data-fuzzy-canary')).toBe('true')
    expect((firstChild as HTMLElement)?.style.display).toBe('none')
    expect((firstChild as HTMLElement)?.style.position).toBe('absolute')

    // Check that links were injected
    const links = (firstChild as HTMLElement)?.querySelectorAll('a[data-canary-link]')
    expect(links.length).toBeGreaterThan(0)

    // Check first link has proper attributes
    const firstLink = links[0] as HTMLAnchorElement
    expect(firstLink.getAttribute('data-canary-link')).toBe('true')
    expect(firstLink.href).toContain('http')
  })

  it('injects even when UA looks like a search bot', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    await import('../../src/runtime')
    ;(window as any).YourPkg.init()
    await waitForDOMUpdate()

    expect(document.body.textContent?.length).toBeGreaterThan(0)
    expect(document.body.childNodes.length).toBeGreaterThan(0)
  })
})
