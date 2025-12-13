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

describe('index.ts - canary placement strategy (no config)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    vi.clearAllMocks()
    setUserAgent('Mozilla/5.0 (jsdom)')
  })

  it('injects a bundled sentence into both comment and off-screen node and signals header', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // pick first sentence deterministically
    const fetchSpy = vi
      .spyOn(global, 'fetch' as any)
      .mockImplementation(() => Promise.resolve() as any)

    init()
    await waitForDOMUpdate()

    const offscreen = document.querySelector('[data-scrape-canary]')
    expect(offscreen).toBeTruthy()
    expect(offscreen?.textContent).toContain('Silent foxes guard forgotten libraries at dawn.')

    const comments = collectComments().join(' ')
    expect(comments).toContain('CANARY:')
    expect(comments).toContain('Silent foxes guard forgotten libraries at dawn.')
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('skips all canaries for known search bots', async () => {
    setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    const fetchSpy = vi
      .spyOn(global, 'fetch' as any)
      .mockImplementation(() => Promise.resolve() as any)

    init()
    await waitForDOMUpdate()

    expect(document.querySelector('[data-scrape-canary]')).toBeNull()
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null)
    expect(walker.nextNode()).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('applies safe styling to the off-screen node', async () => {
    init()
    await waitForDOMUpdate()

    const element = document.querySelector('[data-scrape-canary]') as HTMLElement
    const styles = element.style

    expect(styles.position).toBe('absolute')
    expect(styles.left).toBe('-10000px')
    expect(styles.top).toBe('0px')
    expect(styles.pointerEvents).toBe('none')
    expect(styles.userSelect).toBe('none')
    expect(element.getAttribute('aria-hidden')).toBe('true')
    expect(element.getAttribute('role')).toBe('presentation')
    expect(element.hidden).toBe(true)
  })
})
