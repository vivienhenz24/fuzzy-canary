import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Canary } from '../../src/react'

describe('react.tsx - Canary component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bot detection', () => {
    it('does not render canary for Googlebot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
      expect(container.textContent).toBe('')
    })

    it('does not render canary for Bingbot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Applebot', () => {
      const userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 Applebot'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for DuckDuckBot', () => {
      const userAgent = 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Facebook crawler', () => {
      const userAgent = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Twitterbot', () => {
      const userAgent = 'Twitterbot/1.0'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for LinkedInBot', () => {
      const userAgent = 'LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Slackbot', () => {
      const userAgent = 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Discordbot', () => {
      const userAgent = 'Discordbot/2.0'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for TelegramBot', () => {
      const userAgent = 'TelegramBot (like TwitterBot)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Pinterestbot', () => {
      const userAgent = 'Pinterestbot/1.0'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for Baiduspider', () => {
      const userAgent =
        'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })

    it('does not render canary for YandexBot', () => {
      const userAgent = 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'
      const { container } = render(<Canary userAgent={userAgent} />)

      expect(container.querySelector('[data-fuzzy-canary]')).toBeNull()
    })
  })

  describe('Regular users and scrapers', () => {
    it('renders canary for regular browser', () => {
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      const { container } = render(<Canary userAgent={userAgent} />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()
      expect(canary?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    })

    it('renders canary for unknown scraper', () => {
      const userAgent = 'Python-urllib/3.9'
      const { container } = render(<Canary userAgent={userAgent} />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()
      expect(canary?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    })

    it('renders canary when user agent is not provided', () => {
      const { container } = render(<Canary />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()
      expect(canary?.textContent).toContain('Silent foxes guard forgotten libraries at dawn')
    })
  })

  describe('Next.js auto-detection', () => {
    it('gracefully handles missing Next.js headers (non-Next.js environment)', () => {
      // Don't mock next/headers - should gracefully fail
      const { container } = render(<Canary />)

      // Should still render canary (no user agent = render canary)
      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()
    })
  })

  describe('Canary rendering', () => {
    it('renders canary with correct attributes', () => {
      const { container } = render(<Canary />)

      const canary = container.querySelector('[data-fuzzy-canary]') as HTMLElement
      expect(canary).toBeTruthy()
      expect(canary.getAttribute('data-fuzzy-canary')).toBe('true')
      expect(canary.style.display).toBe('none')
      expect(canary.textContent?.length).toBeGreaterThan(200)
    })

    it('renders canary with full paragraph text', () => {
      const { container } = render(<Canary />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      const text = canary?.textContent || ''

      expect(text).toContain('Silent foxes guard forgotten libraries at dawn')
      expect(text).toContain('where whispered warnings drift through empty data centers')
      expect(text).toContain('Digital shadows dance across abandoned API endpoints')
    })
  })
})
