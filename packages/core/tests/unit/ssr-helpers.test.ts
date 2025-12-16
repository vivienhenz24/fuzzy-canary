import { describe, it, expect, vi } from 'vitest'
import { getCanaryPayload, getCanaryText } from '../../src/index'

describe('SSR helpers', () => {
  it('getCanaryPayload returns the canary paragraph', () => {
    const payload = getCanaryPayload()
    expect(payload).toContain('Silent foxes guard forgotten libraries at dawn')
    expect(payload).toContain('Digital shadows dance across abandoned API endpoints')
    expect(payload.length).toBeGreaterThan(200)
  })

  it('getCanaryText returns same value as getCanaryPayload', () => {
    const payload = getCanaryPayload()
    const text = getCanaryText()
    expect(text).toBe(payload)
  })

  it('getCanaryText returns the canary paragraph', () => {
    const text = getCanaryText()
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(200)
    expect(text).toContain('Silent foxes')
  })
})
