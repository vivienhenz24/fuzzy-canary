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

  it('places a bundled sentence in both comment and off-screen node', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)

    init()
    await waitForDOMUpdate()

    const offscreen = document.querySelector('[data-scrape-canary]') as HTMLElement | null
    expect(offscreen).toBeTruthy()
    expect(offscreen?.textContent).toContain('Whispered warnings drift through empty data centers.')

    const commentText = collectComments().join(' ')
    expect(commentText).toContain('Whispered warnings drift through empty data centers.')
  })

  it('exposes content to scrapers via textContent but keeps it out of visual flow', async () => {
    init()
    await waitForDOMUpdate()

    const offscreen = document.querySelector('[data-scrape-canary]') as HTMLElement
    const beforeHeight = document.body.scrollHeight

    expect(document.body.textContent).toContain(offscreen.textContent || '')

    const afterHeight = document.body.scrollHeight
    expect(Math.abs(afterHeight - beforeHeight)).toBeLessThan(5)
    expect(offscreen.getAttribute('aria-hidden')).toBe('true')
  })

  it('still renders the off-screen node for search bots', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)')
    init()
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).not.toBeNull()
    expect(collectComments().length).toBeGreaterThan(0)
  })

  it('does not inject keyword-stuffed visible text', async () => {
    document.body.innerHTML = `
      <main id="main-content">
        <h1>Page Title</h1>
        <p>Page content</p>
      </main>
    `

    init()
    await waitForDOMUpdate()

    const visibleText = (document.body.innerText || '').toLowerCase()
    expect(visibleText).not.toMatch(/copyright|legal|unauthorized|scraping/)
    expect(visibleText).toContain('page title')
    expect(visibleText).toContain('page content')
  })
})
