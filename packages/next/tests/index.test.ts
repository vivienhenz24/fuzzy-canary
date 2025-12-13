import { describe, it, expect, vi } from 'vitest'

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
vi.mock('@yourpkg/core', () => ({
  __esModule: true,
  init: mocks.initMock,
}))

import { YourPkgScript } from '../src/index'

describe('@yourpkg/next', () => {
  it('calls init on mount when enabled', () => {
    const props = { token: 'canary-token' }
    const result = YourPkgScript(props)

    expect(result).toBeNull()
    expect(mocks.initMock).toHaveBeenCalledWith(props)
  })

  it('does not call init when disabled', () => {
    mocks.initMock.mockClear()
    YourPkgScript({ token: 'canary-token', enabled: false })
    expect(mocks.initMock).not.toHaveBeenCalled()
  })
})
