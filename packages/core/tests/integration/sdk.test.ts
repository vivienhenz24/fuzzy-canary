import { describe, it, expect, beforeEach, vi } from 'vitest'
import { init } from '../../src/index'
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

describe('SDK Integration - best-practice canary placement', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    setUserAgent('Mozilla/5.0 (jsdom)')
  })

  it('places the same canary token in header, meta, comment, and off-screen node', async () => {
    const token = 'integration-canary'
    const registerHeader = vi.fn()

    init({ token, registerHeader })
    await waitForDOMUpdate()

    const meta = document.querySelector('meta[name="scrape-canary"]')
    expect(meta?.getAttribute('content')).toBe(token)
    expect(registerHeader).toHaveBeenCalledWith('X-Canary', token)

    const commentText = collectComments().join(' ')
    expect(commentText).toContain(token)

    const offscreen = document.querySelector('[data-scrape-canary]') as HTMLElement | null
    expect(offscreen).toBeTruthy()
    expect(offscreen?.textContent).toBe(token)
    expect(offscreen?.style.position).toBe('absolute')
    expect(offscreen?.style.left).toBe('-10000px')
    expect(offscreen?.style.top).toBe('0px')
    expect(offscreen?.style.pointerEvents).toBe('none')
  })

  it('exposes content to scrapers via textContent but keeps it out of visual flow', async () => {
    const token = 'integration-canary'
    init({ token })
    await waitForDOMUpdate()

    const offscreen = document.querySelector('[data-scrape-canary]') as HTMLElement
    const beforeHeight = document.body.scrollHeight

    // Should be in textContent for scrapers
    expect(document.body.textContent).toContain(token)

    // Off-screen element should not change layout meaningfully
    const afterHeight = document.body.scrollHeight
    expect(Math.abs(afterHeight - beforeHeight)).toBeLessThan(5)
    expect(offscreen.getAttribute('aria-hidden')).toBe('true')
  })

  it('skips rendering the off-screen node for search bots but still leaves header/meta/comment breadcrumbs', async () => {
    const token = 'integration-canary'
    const registerHeader = vi.fn()
    setUserAgent('Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)')

    init({ token, registerHeader })
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeNull()
    expect(registerHeader).toHaveBeenCalledWith('X-Canary', token)
    expect(document.querySelector('meta[name="scrape-canary"]')?.getAttribute('content')).toBe(token)

    expect(collectComments().length).toBeGreaterThan(0)
  })

  it('does not inject keyword-stuffed visible text', async () => {
    document.body.innerHTML = `
      <main id="main-content">
        <h1>Page Title</h1>
        <p>Page content</p>
      </main>
    `

    const token = 'tiny-canary'
    init({ token })
    await waitForDOMUpdate()

    const visibleText = (document.body.innerText || '').toLowerCase()
    expect(visibleText).not.toMatch(/copyright|legal|unauthorized|scraping/)
    expect(visibleText).toContain('page title')
    expect(visibleText).toContain('page content')
  })
})
