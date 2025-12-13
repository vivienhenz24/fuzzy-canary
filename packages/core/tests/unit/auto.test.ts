import { beforeEach, describe, expect, it, vi } from 'vitest'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto.ts', () => {
  beforeEach(() => {
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
    vi.clearAllMocks()
    ;(globalThis as any).FUZZYCANARY_TOKEN = undefined
    ;(globalThis as any).FUZZYCANARY_OPTIONS = undefined
    Object.defineProperty(document, 'currentScript', {
      configurable: true,
      get: () => null,
    })
  })

  it('auto-inits with window token', async () => {
    ;(globalThis as any).FUZZYCANARY_TOKEN = 'win-token'
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ token: 'win-token' }))
  })

  it('reads data attributes when no window values exist', async () => {
    const script = document.createElement('script')
    script.dataset.fuzzycanaryToken = 'data-token'
    script.dataset.fuzzycanarySentences = 'alpha, beta'
    Object.defineProperty(document, 'currentScript', {
      configurable: true,
      get: () => script,
    })

    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'data-token', sentences: ['alpha', 'beta'] })
    )
  })

  it('auto-inits with sentences even if token is absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn')
    ;(globalThis as any).FUZZYCANARY_OPTIONS = { sentences: ['hello world'] }
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ sentences: ['hello world'] }))
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('falls back to defaults when no token or sentences are provided', async () => {
    const warnSpy = vi.spyOn(console, 'warn')
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
