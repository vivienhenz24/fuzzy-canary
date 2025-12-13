import { describe, it, expect, beforeEach, vi } from 'vitest'
import { init } from '../../src/index'
import { waitForDOMUpdate, setUserAgent } from '../setup'

const CANARY_TOKEN = 'canary-token-123'
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

describe('index.ts - canary placement strategy', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    vi.clearAllMocks()
    setUserAgent('Mozilla/5.0 (jsdom)')
  })

  it('calls registerHeader hook so the host can set X-Canary response header', async () => {
    const registerHeader = vi.fn()

    init({ token: CANARY_TOKEN, registerHeader })
    await waitForDOMUpdate()

    expect(registerHeader).toHaveBeenCalledWith('X-Canary', CANARY_TOKEN)
  })

  it('adds a scrape-canary meta tag with the token', async () => {
    init({ token: CANARY_TOKEN })
    await waitForDOMUpdate()

    const meta = document.querySelector('meta[name="scrape-canary"]')
    expect(meta).toBeTruthy()
    expect(meta?.getAttribute('content')).toBe(CANARY_TOKEN)
  })

  it('injects an HTML comment containing the canary token', async () => {
    init({ token: CANARY_TOKEN })
    await waitForDOMUpdate()

    const comments = collectComments().join(' ')

    expect(comments).toContain('CANARY')
    expect(comments).toContain(CANARY_TOKEN)
  })

  it('adds an off-screen element for innerText scrapers with safe styling and aria-hidden', async () => {
    init({ token: CANARY_TOKEN })
    await waitForDOMUpdate()

    const canaryNode = document.querySelector('[data-scrape-canary]')
    expect(canaryNode).toBeTruthy()

    const element = canaryNode as HTMLElement
    const styles = element.style

    expect(styles.position).toBe('absolute')
    expect(styles.left).toBe('-10000px')
    expect(styles.top).toBe('0px')
    expect(styles.pointerEvents).toBe('none')
    expect(styles.userSelect).toBe('none')
    expect(element.getAttribute('aria-hidden')).toBe('true')
    expect(element.textContent).toBe(CANARY_TOKEN)

    // Scrapers reading textContent should see the token
    expect(document.body.textContent).toContain(CANARY_TOKEN)
  })

  it('does not inject the rendered off-screen element for known search bots, but still sets non-visible canaries', async () => {
    const registerHeader = vi.fn()
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')

    init({ token: CANARY_TOKEN, registerHeader })
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeNull()

    const meta = document.querySelector('meta[name="scrape-canary"]')
    expect(meta).toBeTruthy()
    expect(meta?.getAttribute('content')).toBe(CANARY_TOKEN)

    expect(collectComments().length).toBeGreaterThan(0)

    expect(registerHeader).toHaveBeenCalledWith('X-Canary', CANARY_TOKEN)
  })

  it('keeps the canary token short and non-keyworded to avoid SEO penalties', async () => {
    init({ token: CANARY_TOKEN })
    await waitForDOMUpdate()

    const tokenText = document.body.textContent || ''
    expect(CANARY_TOKEN.length).toBeLessThanOrEqual(32)
    expect(CANARY_TOKEN).not.toMatch(/\s/)
    expect(tokenText).not.toMatch(/copyright|legal|prohibited/i)
  })

  it('can inject only sentences when no token is provided', async () => {
    const registerHeader = vi.fn()
    init({ sentences: ['lorem ipsum', 'dolor sit amet'], registerHeader })
    await waitForDOMUpdate()

    expect(document.querySelector('meta[name="scrape-canary"]')).toBeNull()
    expect(registerHeader).not.toHaveBeenCalled()

    const offscreen = document.querySelector('[data-scrape-canary]')
    expect(offscreen?.textContent).toContain('lorem ipsum')
    expect(offscreen?.textContent).toContain('dolor sit amet')

    const comments = collectComments().join(' ')
    expect(comments).toContain('lorem ipsum')
  })

  it('falls back to bundled sentences when nothing is provided', async () => {
    const registerHeader = vi.fn()
    vi.spyOn(Math, 'random').mockReturnValue(0) // pick first sentence deterministically
    init({ registerHeader })
    await waitForDOMUpdate()

    expect(registerHeader).not.toHaveBeenCalled()
    const offscreen = document.querySelector('[data-scrape-canary]')
    expect(offscreen?.textContent).toContain('Silent foxes guard forgotten libraries at dawn.')
  })
})
