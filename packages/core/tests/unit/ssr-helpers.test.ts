import { describe, it, expect, vi } from 'vitest'
import { getCanaryPayload, getCanaryText } from '../../src/index'

describe('SSR helpers', () => {
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

  it('getCanaryText returns space-separated URLs', () => {
    const text = getCanaryText()
    expect(typeof text).toBe('string')
    expect(text).toContain('http')
    expect(text).toContain('example.com')
  })

  it('getCanaryText extracts URLs from payload', () => {
    const payload = getCanaryPayload()
    const text = getCanaryText()

    // Text should contain the URLs from payload
    payload.forEach(link => {
      expect(text).toContain(link.url)
    })
  })
})
