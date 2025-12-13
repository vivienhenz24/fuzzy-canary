import { describe, it, expect, vi } from 'vitest'

// Provide a window object so YourPkgScript doesn't bail out
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).window = {}

// Mock react to run useEffect immediately and return null
vi.mock('react', () => ({
  __esModule: true,
  useEffect: (cb: () => void) => cb(),
  default: {},
}))

const mocks = vi.hoisted(() => ({
  initMock: vi.fn(),
}))

// Mock core init
vi.mock('@fuzzycanary/core', () => ({
  __esModule: true,
  init: mocks.initMock,
}))

import { YourPkgScript } from '../src/index'

describe('@fuzzycanary/next', () => {
  it('calls init on mount when enabled', () => {
    const result = YourPkgScript({})

    expect(result).toBeNull()
    expect(mocks.initMock).toHaveBeenCalled()
  })

  it('does not call init when disabled', () => {
    mocks.initMock.mockClear()
    YourPkgScript({ enabled: false })
    expect(mocks.initMock).not.toHaveBeenCalled()
  })
})
