/**
 * Unit tests for index.ts
 * Tests the init() function and all its options
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { init, TRIGGER_SENTENCES } from '../../src/index'
import { waitForDOMUpdate } from '../setup'

describe('index.ts - init()', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should export init function', () => {
      expect(init).toBeDefined()
      expect(typeof init).toBe('function')
    })

    it('should export TRIGGER_SENTENCES', () => {
      expect(TRIGGER_SENTENCES).toBeDefined()
      expect(Array.isArray(TRIGGER_SENTENCES)).toBe(true)
    })

    it('should inject container with default options', async () => {
      init({ sentences: 'Test sentence' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container).toBeTruthy()
    })

    it('should inject text content', async () => {
      const testSentence = 'This is a test sentence.'
      init({ sentences: testSentence })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container?.textContent).toBe(testSentence)
    })
  })

  describe('enabled option', () => {
    it('should not inject when enabled is false', async () => {
      init({ sentences: 'Test', enabled: false })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container).toBeNull()
    })

    it('should inject when enabled is true', async () => {
      init({ sentences: 'Test', enabled: true })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container).toBeTruthy()
    })
  })

  describe('sentences option', () => {
    it('should accept string sentence', async () => {
      init({ sentences: 'Single sentence' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container?.textContent).toBe('Single sentence')
    })

    it('should accept array of sentences', async () => {
      init({ sentences: ['Sentence 1', 'Sentence 2'] })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      const text = container?.textContent || ''
      expect(text).toContain('Sentence 1')
      expect(text).toContain('Sentence 2')
    })

    it('should use random trigger sentences when not provided', async () => {
      init({ count: 3 })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container?.textContent).toBeTruthy()
      expect(container?.textContent?.length).toBeGreaterThan(10)
    })
  })

  describe('mode option', () => {
    it('should apply display-none mode', async () => {
      init({ sentences: 'Test', mode: 'display-none' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg') as HTMLElement
      expect(container.style.display).toBe('none')
    })

    it('should apply offscreen mode', async () => {
      init({ sentences: 'Test', mode: 'offscreen' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg') as HTMLElement
      expect(container.style.position).toBe('absolute')
      expect(container.style.left).toBe('-9999px')
      expect(container.style.top).toBe('-9999px')
    })

    it('should apply visibility-hidden mode', async () => {
      init({ sentences: 'Test', mode: 'visibility-hidden' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg') as HTMLElement
      expect(container.style.visibility).toBe('hidden')
    })

    it('should apply zero-opacity mode', async () => {
      init({ sentences: 'Test', mode: 'zero-opacity' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg') as HTMLElement
      expect(container.style.opacity).toBe('0')
    })
  })

  describe('containerId option', () => {
    it('should use custom container ID', async () => {
      init({ sentences: 'Test', containerId: 'custom-id' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('custom-id')
      expect(container).toBeTruthy()
    })

    it('should warn if container already exists', async () => {
      const warnSpy = vi.spyOn(console, 'warn')
      
      init({ sentences: 'Test' })
      await waitForDOMUpdate()
      
      init({ sentences: 'Test again' })
      await waitForDOMUpdate()
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      )
    })
  })

  describe('position option', () => {
    it('should append to body end by default', async () => {
      document.body.innerHTML = '<div id="existing">Existing</div>'
      init({ sentences: 'Test' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(document.body.lastElementChild).toBe(container)
    })

    it('should prepend to body start', async () => {
      document.body.innerHTML = '<div id="existing">Existing</div>'
      init({ sentences: 'Test', position: 'body-start' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(document.body.firstElementChild).toBe(container)
    })
  })

  describe('scatter option', () => {
    it('should create multiple containers when scatter is true', async () => {
      init({ 
        sentences: ['Sentence 1', 'Sentence 2', 'Sentence 3'],
        scatter: true 
      })
      await waitForDOMUpdate()
      
      const container0 = document.getElementById('__yourpkg-0')
      const container1 = document.getElementById('__yourpkg-1')
      const container2 = document.getElementById('__yourpkg-2')
      
      expect(container0).toBeTruthy()
      expect(container1).toBeTruthy()
      expect(container2).toBeTruthy()
    })

    it('should create single container when scatter is false', async () => {
      init({ 
        sentences: ['Sentence 1', 'Sentence 2'],
        scatter: false 
      })
      await waitForDOMUpdate()
      
      const mainContainer = document.getElementById('__yourpkg')
      const container0 = document.getElementById('__yourpkg-0')
      
      expect(mainContainer).toBeTruthy()
      expect(container0).toBeNull()
    })
  })

  describe('Accessibility attributes', () => {
    it('should set aria-hidden attribute', async () => {
      init({ sentences: 'Test' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should set data-yourpkg attribute', async () => {
      init({ sentences: 'Test' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container?.getAttribute('data-yourpkg')).toBe('1')
    })
  })

  describe('DOM ready state handling', () => {
    it('should handle loading state with DOMContentLoaded', () => {
      Object.defineProperty(document, 'readyState', {
        writable: true,
        value: 'loading'
      })
      
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      init({ sentences: 'Test' })
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'DOMContentLoaded',
        expect.any(Function)
      )
    })

    it('should handle complete state with setTimeout', async () => {
      Object.defineProperty(document, 'readyState', {
        writable: true,
        value: 'complete'
      })
      
      init({ sentences: 'Test' })
      await waitForDOMUpdate()
      
      const container = document.getElementById('__yourpkg')
      expect(container).toBeTruthy()
    })
  })

  describe('Edge cases', () => {
    it('should warn when no sentences provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn')
      init({ sentences: [], count: 0 })
      await waitForDOMUpdate()
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No sentences')
      )
    })
  })
})
