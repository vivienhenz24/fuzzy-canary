import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCanaryPayload } from '../../src/index'

describe('SSR helpers', () => {
  beforeEach(() => {
    // Set CANARY_TEXT for tests
    process.env.CANARY_TEXT = JSON.stringify([
      { description: 'API Documentation', url: 'https://example.com/api/docs' },
      { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
    ])
  })

  it('getCanaryPayload returns array of canary links', () => {
    const payload = getCanaryPayload()
    expect(Array.isArray(payload)).toBe(true)
    expect(payload.length).toBeGreaterThan(0)

    // Check first link has required structure
    const firstLink = payload[0]
    expect(firstLink).toHaveProperty('description')
    expect(firstLink).toHaveProperty('url')
    expect(firstLink.url).toContain('http')
  })

  it('getCanaryPayload returns empty array when CANARY_TEXT is not set', () => {
    delete process.env.CANARY_TEXT
    const payload = getCanaryPayload()
    expect(Array.isArray(payload)).toBe(true)
    expect(payload.length).toBe(0)
  })
})
