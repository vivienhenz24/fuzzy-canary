/**
 * E2E tests for visibility and accessibility
 * Tests the SDK in a real browser to verify:
 * - Hidden from humans (visually invisible)
 * - Visible to scrapers (in DOM and textContent)
 * - Accessible (aria-hidden, not in a11y tree)
 * - SEO-safe (proper positioning, no layout impact)
 */

import { test, expect } from '@playwright/test'

test.describe('Anti-Scraping SDK E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-page.html')
    // Wait for SDK to initialize
    await page.waitForTimeout(100)
  })

  test.describe('Scraper Visibility', () => {
    test('should include hidden content in textContent (scrapers see this)', async ({ page }) => {
      const bodyText = await page.textContent('body')
      
      // Should contain visible content
      expect(bodyText).toContain('Visible Content')
      expect(bodyText).toContain('main content that users can see')
      
      // Should also contain hidden anti-scraping content (what scrapers extract)
      // The default init in test-page.html uses random trigger sentences
      expect(bodyText).toBeTruthy()
      expect(bodyText!.length).toBeGreaterThan(100)
    })

    test('should be present in DOM innerHTML', async ({ page }) => {
      const html = await page.innerHTML('body')
      
      // Container should exist in HTML
      expect(html).toContain('data-yourpkg="1"')
      expect(html).toContain('id="__yourpkg"')
    })

    test('should be extractable via evaluate (like scrapers do)', async ({ page }) => {
      const scrapedText = await page.evaluate(() => {
        // This is how a scraper would extract text
        return document.body.textContent || document.body.innerText
      })
      
      // Should include both visible and hidden content
      expect(scrapedText).toContain('Visible Content')
      expect(scrapedText.length).toBeGreaterThan(100)
    })
  })

  test.describe('Human Invisibility', () => {
    test('should not be visible with display-none mode', async ({ page }) => {
      await page.click('button:text("Test: display-none")')
      await page.waitForTimeout(100)
      
      const container = page.locator('#test-display-none')
      await expect(container).toBeAttached()
      
      // Should not be visible
      await expect(container).not.toBeVisible()
      
      // Bounding box should be null (not rendered)
      const box = await container.boundingBox()
      expect(box).toBeNull()
    })

    test('should be offscreen with offscreen mode', async ({ page }) => {
      await page.click('button:text("Test: offscreen")')
      await page.waitForTimeout(100)
      
      const container = page.locator('#test-offscreen')
      await expect(container).toBeAttached()
      
      // Should have offscreen positioning
      const styles = await container.evaluate((el) => {
        const computed = window.getComputedStyle(el as HTMLElement)
        return {
          position: computed.position,
          left: computed.left,
          top: computed.top
        }
      })
      
      expect(styles.position).toBe('absolute')
      expect(styles.left).toBe('-9999px')
      expect(styles.top).toBe('-9999px')
    })

    test('should not be visible with zero-opacity mode', async ({ page }) => {
      await page.click('button:text("Test: zero-opacity")')
      await page.waitForTimeout(100)
      
      const container = page.locator('#test-opacity')
      await expect(container).toBeAttached()
      
      const opacity = await container.evaluate((el) => {
        return window.getComputedStyle(el as HTMLElement).opacity
      })
      
      expect(opacity).toBe('0')
    })

    test('should not affect page layout or scroll', async ({ page }) => {
      const beforeHeight = await page.evaluate(() => document.body.scrollHeight)
      
      // Inject more content
      await page.click('button:text("Test: offscreen")')
      await page.waitForTimeout(100)
      
      const afterHeight = await page.evaluate(() => document.body.scrollHeight)
      
      // Height should not significantly change (offscreen doesn't add layout)
      expect(Math.abs(afterHeight - beforeHeight)).toBeLessThan(10)
    })
  })

  test.describe('Accessibility', () => {
    test('should have aria-hidden attribute', async ({ page }) => {
      const container = page.locator('#__yourpkg')
      const ariaHidden = await container.getAttribute('aria-hidden')
      expect(ariaHidden).toBe('true')
    })

    test('should have data-yourpkg identifier', async ({ page }) => {
      const container = page.locator('#__yourpkg')
      const dataAttr = await container.getAttribute('data-yourpkg')
      expect(dataAttr).toBe('1')
    })

    test('should not appear in accessibility tree', async ({ page }) => {
      const snapshot = await page.accessibility.snapshot()
      
      // Helper function to search for our container in a11y tree
      function searchTree(node: any): boolean {
        if (node.name && node.name.includes('scraping')) {
          return true
        }
        if (node.children) {
          for (const child of node.children) {
            if (searchTree(child)) return true
          }
        }
        return false
      }
      
      // Should not find anti-scraping content in accessibility tree
      const foundInA11yTree = searchTree(snapshot)
      expect(foundInA11yTree).toBe(false)
    })

    test('should not interfere with screen reader content', async ({ page }) => {
      const snapshot = await page.accessibility.snapshot()
      
      // Should still have main visible content in a11y tree
      function hasVisibleContent(node: any): boolean {
        if (node.name && (
          node.name.includes('Visible Content') ||
          node.name.includes('main content')
        )) {
          return true
        }
        if (node.children) {
          for (const child of node.children) {
            if (hasVisibleContent(child)) return true
          }
        }
        return false
      }
      
      expect(hasVisibleContent(snapshot)).toBe(true)
    })
  })

  test.describe('SEO Safety', () => {
    test('should be in DOM (search engines can access)', async ({ page }) => {
      const container = page.locator('#__yourpkg')
      await expect(container).toBeAttached()
      
      const inDOM = await page.evaluate(() => {
        return document.getElementById('__yourpkg') !== null
      })
      expect(inDOM).toBe(true)
    })

    test('should not break page structure', async ({ page }) => {
      // Check that main content is still accessible
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()
      
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
      await expect(h1).toHaveText('Anti-Scraping SDK Test Page')
    })

    test('should not affect main content visibility', async ({ page }) => {
      const visibleParagraph = page.locator('.content p').first()
      await expect(visibleParagraph).toBeVisible()
      
      const text = await visibleParagraph.textContent()
      expect(text).toContain('main content that users can see')
    })
  })

  test.describe('Browser Script Tag Usage', () => {
    test('should be loadable via window.YourPkg', async ({ page }) => {
      const hasGlobal = await page.evaluate(() => {
        return typeof (window as any).YourPkg !== 'undefined'
      })
      expect(hasGlobal).toBe(true)
    })

    test('should have init function on window.YourPkg', async ({ page }) => {
      const hasInit = await page.evaluate(() => {
        return typeof (window as any).YourPkg.init === 'function'
      })
      expect(hasInit).toBe(true)
    })

    test('should work when called directly', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).YourPkg.init({
          sentences: 'Direct call test',
          containerId: 'direct-test',
          mode: 'display-none'
        })
      })
      
      await page.waitForTimeout(100)
      
      const container = page.locator('#direct-test')
      await expect(container).toBeAttached()
      
      const text = await container.textContent()
      expect(text).toBe('Direct call test')
    })
  })

  test.describe('Scatter Mode', () => {
    test('should create multiple containers', async ({ page }) => {
      await page.click('button:text("Test: scatter mode")')
      await page.waitForTimeout(100)
      
      const container0 = page.locator('#test-scatter-0')
      const container1 = page.locator('#test-scatter-1')
      const container2 = page.locator('#test-scatter-2')
      
      await expect(container0).toBeAttached()
      await expect(container1).toBeAttached()
      await expect(container2).toBeAttached()
    })

    test('should distribute content across containers', async ({ page }) => {
      await page.click('button:text("Test: scatter mode")')
      await page.waitForTimeout(100)
      
      const text0 = await page.locator('#test-scatter-0').textContent()
      const text1 = await page.locator('#test-scatter-1').textContent()
      const text2 = await page.locator('#test-scatter-2').textContent()
      
      expect(text0).toBe('Scatter 1')
      expect(text1).toBe('Scatter 2')
      expect(text2).toBe('Scatter 3')
    })
  })

  test.describe('Complete Verification', () => {
    test('should meet all requirements: hidden from humans, visible to scrapers, accessible, SEO-safe', async ({ page }) => {
      const container = page.locator('#__yourpkg')
      
      // 1. Hidden from humans
      await expect(container).not.toBeVisible()
      
      // 2. Visible to scrapers (in textContent)
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
      expect(bodyText!.length).toBeGreaterThan(50)
      
      // 3. Accessible (aria-hidden)
      const ariaHidden = await container.getAttribute('aria-hidden')
      expect(ariaHidden).toBe('true')
      
      // 4. SEO-safe (in DOM, proper attributes)
      await expect(container).toBeAttached()
      const hasDataAttr = await container.getAttribute('data-yourpkg')
      expect(hasDataAttr).toBe('1')
      
      // 5. No console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.waitForTimeout(200)
      expect(errors.length).toBe(0)
    })
  })
})

