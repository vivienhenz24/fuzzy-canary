import { describe, it, expect, beforeEach, vi } from 'vitest'
import { init } from '../../src/index'
import { waitForDOMUpdate, setUserAgent, cleanupDOM } from '../setup'

describe('index.ts - canary placement strategy (no config)', () => {
  beforeEach(() => {
    cleanupDOM()
    vi.clearAllMocks()
  })

  it('injects text at the beginning of body with the canary paragraph', async () => {
    init()
    await waitForDOMUpdate()

    // Check that text was injected at the start of body
    const firstChild = document.body.firstChild
    expect(firstChild?.nodeType).toBe(Node.TEXT_NODE)
    expect(firstChild?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    expect(firstChild?.textContent).toContain(
      'Digital shadows dance across abandoned API endpoints'
    )
    expect(firstChild?.textContent?.length).toBeGreaterThan(200)
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
    const ssrCanary = document.createElement('span')
    ssrCanary.setAttribute('data-fuzzy-canary', 'true')
    ssrCanary.textContent = 'SSR canary text'
    document.body.appendChild(ssrCanary)

    init()

    // Should not inject another text node
    const textNodes = Array.from(document.body.childNodes).filter(
      node => node.nodeType === Node.TEXT_NODE
    )
    expect(textNodes.length).toBe(0)
  })
})
