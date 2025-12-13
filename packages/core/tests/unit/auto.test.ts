import { beforeEach, describe, expect, it, vi } from 'vitest'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto.ts', () => {
  beforeEach(() => {
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('auto-inits exactly once on import', async () => {
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledTimes(1)
  })
})
