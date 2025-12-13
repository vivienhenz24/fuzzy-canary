import { beforeEach, describe, expect, it, vi } from 'vitest'

const AUTO_FLAG = Symbol.for('fuzzycanary.autoInit')

describe('auto.ts', () => {
  beforeEach(() => {
    delete (globalThis as any)[AUTO_FLAG]
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.FUZZYCANARY_TOKEN
    delete process.env.NEXT_PUBLIC_FUZZYCANARY_TOKEN
    ;(globalThis as any).FUZZYCANARY_TOKEN = undefined
    ;(globalThis as any).FUZZYCANARY_OPTIONS = undefined
  })

  it('auto-inits with env token', async () => {
    process.env.FUZZYCANARY_TOKEN = 'env-token'
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ token: 'env-token' }))
  })

  it('prefers window token over env', async () => {
    process.env.FUZZYCANARY_TOKEN = 'env-token'
    ;(globalThis as any).FUZZYCANARY_TOKEN = 'win-token'
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    const { init } = await import('../../src/index')
    await import('../../src/auto')
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ token: 'win-token' }))
  })

  it('warns when no token is found', async () => {
    const warnSpy = vi.spyOn(console, 'warn')
    vi.mock('../../src/index', () => ({ init: vi.fn() }))
    await import('../../src/auto')
    expect(warnSpy).toHaveBeenCalled()
  })
})
