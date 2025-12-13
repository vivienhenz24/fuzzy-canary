/**
 * Integration tests for the SDK
 * Tests all modules working together
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { init, TRIGGER_SENTENCES } from '../../src/index'
import type { InitOptions } from '../../src/types'
import { waitForDOMUpdate } from '../setup'

describe('SDK Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('Type imports with implementation', () => {
    it('should import types and implementation together', () => {
      const options: InitOptions = {
        sentences: 'Test',
        mode: 'offscreen'
      }
      
      expect(options).toBeDefined()
      expect(init).toBeDefined()
      expect(TRIGGER_SENTENCES).toBeDefined()
    })
  })

  describe('Full workflow', () => {
    it('should complete full init workflow', async () => {
      // Import types
      const options: InitOptions = {
        sentences: ['Integration test sentence 1', 'Integration test sentence 2'],
        mode: 'display-none',
        position: 'body-end'
      }
      
      // Call init
      init(options)
      await waitForDOMUpdate()
      
      // Verify DOM changes
      const container = document.getElementById('__yourpkg')
      expect(container).toBeTruthy()
      expect(container?.getAttribute('aria-hidden')).toBe('true')
      expect(container?.getAttribute('data-yourpkg')).toBe('1')
      expect(container?.style.display).toBe('none')
      expect(container?.textContent).toContain('Integration test sentence 1')
      expect(container?.textContent).toContain('Integration test sentence 2')
    })

    it('should work with built-in trigger sentences', async () => {
      init({ count: 5, mode: 'offscreen' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container).toBeTruthy()
      
      const text = container?.textContent || ''
      expect(text.length).toBeGreaterThan(50) // Should have substantial content
      
      // Should contain some trigger keywords
      const lowerText = text.toLowerCase()
      const hasKeywords = ['scraping', 'prohibited', 'copyright', 'unauthorized']
        .some(keyword => lowerText.includes(keyword))
      expect(hasKeywords).toBe(true)
    })
  })

  describe('Runtime global exposure integration', () => {
    it('should work when imported as runtime', async () => {
      // Import runtime module
      await import('../../src/runtime')
      
      // Should expose global
      expect((window as any).YourPkg).toBeDefined()
      expect((window as any).YourPkg.init).toBeDefined()
      
      // Should work when called via global
      ;(window as any).YourPkg.init({
        sentences: 'Runtime integration test',
        mode: 'zero-opacity',
        containerId: 'runtime-test'
      })
      
      await waitForDOMUpdate()
      
      const container = document.getElementById('runtime-test')
      expect(container).toBeTruthy()
      expect(container?.textContent).toBe('Runtime integration test')
      expect(container?.style.opacity).toBe('0')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle scatter mode with all hiding modes', async () => {
      const sentences = [
        'Scattered sentence 1',
        'Scattered sentence 2',
        'Scattered sentence 3'
      ]
      
      init({
        sentences,
        scatter: true,
        mode: 'offscreen',
        position: 'body-start',
        containerId: 'scatter-test'
      })
      
      await waitForDOMUpdate()
      
      const container0 = document.getElementById('scatter-test-0')
      const container1 = document.getElementById('scatter-test-1')
      const container2 = document.getElementById('scatter-test-2')
      
      expect(container0).toBeTruthy()
      expect(container1).toBeTruthy()
      expect(container2).toBeTruthy()
      
      expect(container0?.textContent).toContain('Scattered sentence 1')
      expect(container1?.textContent).toContain('Scattered sentence 2')
      expect(container2?.textContent).toContain('Scattered sentence 3')
      
      // All should have offscreen positioning
      expect(container0?.style.position).toBe('absolute')
      expect(container1?.style.position).toBe('absolute')
      expect(container2?.style.position).toBe('absolute')
    })

    it('should verify content is hidden from humans but visible to scrapers', async () => {
      init({
        sentences: 'This content should be in textContent but not visible',
        mode: 'offscreen',
        containerId: 'scraper-test'
      })
      
      await waitForDOMUpdate()
      
      const container = document.getElementById('scraper-test')
      
      // Should be in DOM and textContent (scrapers see this)
      expect(container).toBeTruthy()
      expect(document.body.textContent).toContain('This content should be in textContent but not visible')
      
      // Should not be visually rendered (humans don't see this)
      expect(container?.style.position).toBe('absolute')
      expect(container?.style.left).toBe('-9999px')
      
      // Should be hidden from accessibility tools
      expect(container?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should not interfere with existing page content', async () => {
      // Add existing content
      document.body.innerHTML = `
        <header>Header</header>
        <main id="main-content">
          <h1>Page Title</h1>
          <p>Page content</p>
        </main>
        <footer>Footer</footer>
      `
      
      init({
        sentences: 'Hidden anti-scraping content',
        mode: 'display-none',
        position: 'body-end',
        containerId: 'no-interfere-test'
      })
      
      await waitForDOMUpdate()
      
      // Main content should still be there
      expect(document.getElementById('main-content')).toBeTruthy()
      expect(document.querySelector('h1')?.textContent).toBe('Page Title')
      
      // Anti-scraping content should be added
      const container = document.getElementById('no-interfere-test')
      expect(container).toBeTruthy()
      
      // Should be at the end
      expect(document.body.lastElementChild).toBe(container)
    })
  })
})
