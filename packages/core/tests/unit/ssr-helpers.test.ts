import { describe, it, expect, vi } from 'vitest'
import { getCanaryPayload, getCanaryHeader, renderCanaryComment } from '../../src/index'

describe('SSR helpers', () => {
  it('getCanaryPayload returns deterministic sentence when Math.random is mocked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // pick first sentence
    expect(getCanaryPayload()).toBe('Silent foxes guard forgotten libraries at dawn.')
  })

  it('getCanaryHeader returns the header name/value pair', () => {
    const header = getCanaryHeader('payload-123')
    expect(header).toEqual({ name: 'X-Canary', value: 'payload-123' })
  })

  it('renderCanaryComment returns an HTML comment string with the payload', () => {
    const comment = renderCanaryComment('payload-abc')
    expect(comment).toBe('<!--CANARY:payload-abc-->')
  })
})
