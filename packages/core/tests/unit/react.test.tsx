import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Canary } from '../../src/react'

describe('react.tsx - Canary component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set CANARY_TEXT for tests
    process.env.CANARY_TEXT = JSON.stringify([
      { description: 'API Documentation', url: 'https://example.com/api/docs' },
      { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
    ])
  })

  describe('Bot handling', () => {
    const botUserAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 Applebot',
      'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Twitterbot/1.0',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'Discordbot/2.0',
      'TelegramBot (like TwitterBot)',
      'Pinterestbot/1.0',
      'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
      'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    ]

    botUserAgents.forEach(userAgent => {
      it(`renders canary for bot UA: ${userAgent.split(' ')[0]}`, () => {
        const { container } = render(<Canary userAgent={userAgent} />)

        const canary = container.querySelector('[data-fuzzy-canary]')
        expect(canary).toBeTruthy()
      })
    })
  })

  describe('Regular users and scrapers', () => {
    it('renders canary for regular browser', () => {
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      const { container } = render(<Canary userAgent={userAgent} />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()

      const links = canary?.querySelectorAll('a[data-canary-link]')
      expect(links?.length).toBeGreaterThan(0)
    })

    it('renders canary for unknown scraper', () => {
      const userAgent = 'Python-urllib/3.9'
      const { container } = render(<Canary userAgent={userAgent} />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()

      const links = canary?.querySelectorAll('a[data-canary-link]')
      expect(links?.length).toBeGreaterThan(0)
    })

    it('renders canary when user agent is not provided', () => {
      const { container } = render(<Canary />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      expect(canary).toBeTruthy()

      const links = canary?.querySelectorAll('a[data-canary-link]')
      expect(links?.length).toBeGreaterThan(0)
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
      expect(canary.style.position).toBe('absolute')

      // Check for links
      const links = canary.querySelectorAll('a[data-canary-link]')
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders canary links with proper href attributes', () => {
      const { container } = render(<Canary />)

      const canary = container.querySelector('[data-fuzzy-canary]')
      const links = canary?.querySelectorAll('a[data-canary-link]') as NodeListOf<HTMLAnchorElement>

      expect(links.length).toBeGreaterThan(0)

      // Check first link
      const firstLink = links[0]
      expect(firstLink.href).toContain('http')
      expect(firstLink.textContent).toContain('-') // Should have "description - url" format
      expect(firstLink.getAttribute('data-canary-link')).toBe('true')
    })
  })
})
