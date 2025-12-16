import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate, cleanupDOM } from '../setup'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto entrypoint', () => {
  beforeEach(() => {
    cleanupDOM()
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
    // Set CANARY_TEXT for tests
    process.env.CANARY_TEXT = JSON.stringify([
      { description: 'API Documentation', url: 'https://example.com/api/docs' },
      { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
    ])
  })

  it('injects canary links when auto entry is imported', async () => {
    await import('../../src/auto')
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

    // Check first link
    const firstLink = links[0] as HTMLAnchorElement
    expect(firstLink.href).toContain('http')
    expect(firstLink.textContent).toContain('-') // Should contain description - url format
  })
})
