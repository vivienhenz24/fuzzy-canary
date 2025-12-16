import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitForDOMUpdate, cleanupDOM } from '../setup'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto entrypoint', () => {
  beforeEach(() => {
    cleanupDOM()
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
  })

  it('injects canary text when auto entry is imported', async () => {
    await import('../../src/auto')
    await waitForDOMUpdate()

    const firstChild = document.body.firstChild
    expect(firstChild?.nodeType).toBe(Node.ELEMENT_NODE)
    expect((firstChild as HTMLElement)?.tagName).toBe('SPAN')
    expect((firstChild as HTMLElement)?.getAttribute('data-fuzzy-canary')).toBe('true')
    expect((firstChild as HTMLElement)?.style.display).toBe('none')
    expect(firstChild?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    expect(firstChild?.textContent).toContain(
      'Digital shadows dance across abandoned API endpoints'
    )
    expect(firstChild?.textContent?.length).toBeGreaterThan(200)
  })
})
