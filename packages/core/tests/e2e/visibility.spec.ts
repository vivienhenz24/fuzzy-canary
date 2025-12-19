import { test, expect } from '@playwright/test'

test.describe('E2E - best-practice canary placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-page.html')
    await page.waitForTimeout(100)
  })

  test('registers an X-Canary header via hook', async ({ page }) => {
    const header = await page.evaluate(() => (window as any).__canaryHeader)
    expect(header).toEqual({ name: 'X-Canary', value: 'e2e-canary' })
  })

  test('adds a scrape-canary meta tag and HTML comment', async ({ page }) => {
    const metaContent = await page.getAttribute('meta[name="scrape-canary"]', 'content')
    expect(metaContent).toBe('e2e-canary')

    const html = await page.content()
    expect(html).toContain('scrape-canary')
    expect(html).toMatch(/CANARY/i)
  })

  test('creates an off-screen node visible to scrapers but not users', async ({ page }) => {
    const canary = page.locator('[data-scrape-canary]')
    await expect(canary).toBeAttached()
    await expect(canary).not.toBeVisible()

    const style = await canary.evaluate(el => {
      const computed = window.getComputedStyle(el as HTMLElement)
      return {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        pointerEvents: computed.pointerEvents,
        userSelect: computed.userSelect,
        ariaHidden: (el as HTMLElement).getAttribute('aria-hidden'),
        text: (el as HTMLElement).textContent,
      }
    })

    expect(style.position).toBe('absolute')
    expect(style.left).toBe('-10000px')
    expect(style.top).toBe('0px')
    expect(style.pointerEvents).toBe('none')
    expect(style.userSelect).toBe('none')
    expect(style.ariaHidden).toBe('true')
    expect(style.text).toBe('e2e-canary')

    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('e2e-canary')
  })

  test('keeps visible content clean of keyword stuffing', async ({ page }) => {
    const visibleText = await page.innerText('body')
    expect(visibleText).toContain('Visible Content')
    expect(visibleText).not.toMatch(/copyright|unauthorized|scraping|prohibited/i)
  })

  test('skips the rendered off-screen node for search bots while keeping header/meta/comment', async ({
    browser,
  }) => {
    const botContext = await browser.newContext({
      baseURL: 'http://localhost:3000',
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    })
    const page = await botContext.newPage()
    await page.goto('/test-page.html')
    await page.waitForTimeout(100)

    const canary = page.locator('[data-scrape-canary]')
    await expect(canary).toHaveCount(0)

    const metaContent = await page.getAttribute('meta[name="scrape-canary"]', 'content')
    expect(metaContent).toBe('e2e-canary')

    const html = await page.content()
    expect(html).toMatch(/CANARY/i)

    const header = await page.evaluate(() => (window as any).__canaryHeader)
    expect(header).toEqual({ name: 'X-Canary', value: 'e2e-canary' })

    await botContext.close()
  })
})

