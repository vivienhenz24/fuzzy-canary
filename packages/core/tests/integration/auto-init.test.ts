import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate } from '../setup'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto entrypoint', () => {
  beforeEach(() => {
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
    vi.spyOn(Math, 'random').mockReturnValue(0) // pick the first bundled sentence deterministically
  })

  it('injects the canary payload when auto entry is imported', async () => {
    await import('../../src/auto')
    await waitForDOMUpdate()

    const offscreen = document.querySelector('[data-scrape-canary]')
    expect(offscreen).toBeTruthy()
    expect(offscreen?.textContent).toContain('Silent foxes guard forgotten libraries at dawn.')

    const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null)
    const comments: string[] = []
    let node = walker.nextNode()
    while (node) {
      comments.push((node as Comment).data)
      node = walker.nextNode()
    }
    expect(comments.join(' ')).toContain('Silent foxes guard forgotten libraries at dawn.')
  })
})
