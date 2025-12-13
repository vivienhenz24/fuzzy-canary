import { describe, it, expect } from 'vitest'
import type { InitOptions } from '../../src/types'

describe('types.ts - InitOptions', () => {
  it('requires a token and supports header/meta configuration hooks', () => {
    const validOptions: InitOptions = {
      token: 'canary-123',
      headerName: 'X-Canary',
      metaName: 'scrape-canary',
      registerHeader: (_name: string, _value: string) => {},
    }

    expect(validOptions).toBeDefined()
  })

  it('supports bot-aware offscreen behavior toggles', () => {
    const options: InitOptions = {
      token: 'canary-123',
      skipOffscreenForBots: true,
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    }

    expect(options.skipOffscreenForBots).toBe(true)
  })
})
