import { describe, it, expect, beforeEach, vi } from 'vitest'
import { init } from '../../src/index'
import { waitForDOMUpdate, setUserAgent, cleanupDOM } from '../setup'

describe('index.ts - canary placement strategy (no config)', () => {
  beforeEach(() => {
    cleanupDOM()
    vi.clearAllMocks()
    // Set CANARY_TEXT for tests
    process.env.CANARY_TEXT = JSON.stringify([
      { description: 'API Documentation', url: 'https://example.com/api/docs' },
      { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
    ])
  })

  it('injects hidden links at the beginning of body', async () => {
    init()
    await waitForDOMUpdate()

    // Check that a hidden div container was injected at the start of body
    const firstChild = document.body.firstChild
    expect(firstChild?.nodeType).toBe(Node.ELEMENT_NODE)
    expect((firstChild as HTMLElement)?.tagName).toBe('DIV')
    expect((firstChild as HTMLElement)?.getAttribute('data-fuzzy-canary')).toBe('true')
    expect((firstChild as HTMLElement)?.style.display).toBe('none')
    expect((firstChild as HTMLElement)?.style.position).toBe('absolute')
    expect((firstChild as HTMLElement)?.style.left).toBe('-9999px')

    // Check that links were injected
    const links = (firstChild as HTMLElement)?.querySelectorAll('a[data-canary-link]')
    expect(links.length).toBeGreaterThan(0)

    // Check first link has proper attributes
    const firstLink = links[0] as HTMLAnchorElement
    expect(firstLink.getAttribute('data-canary-link')).toBe('true')
    expect(firstLink.href).toContain('http')
    expect(firstLink.textContent).toContain('-') // Should have "description - url" format
  })

  it('skips injection for known search bots', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')

    init()
    await waitForDOMUpdate()

    // Body should be empty since bot injection is skipped
    expect(document.body.textContent).toBe('')
    expect(document.body.childNodes.length).toBe(0)
  })

  it('skips injection if SSR canary already exists', () => {
    // Simulate SSR-injected canary
    const ssrCanary = document.createElement('div')
    ssrCanary.setAttribute('data-fuzzy-canary', 'true')
    const link = document.createElement('a')
    link.href = 'https://example.com/ssr-trap'
    link.textContent = 'SSR Link'
    ssrCanary.appendChild(link)
    document.body.appendChild(ssrCanary)

    init()

    // Should not inject another canary element
    const canaryElements = Array.from(document.body.childNodes).filter(
      node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node as HTMLElement).getAttribute('data-fuzzy-canary') === 'true'
    )
    expect(canaryElements.length).toBe(1) // Only the SSR canary should exist
  })
})
