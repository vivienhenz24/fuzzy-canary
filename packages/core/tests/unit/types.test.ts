/**
 * Unit tests for types.ts
 * Tests type exports and trigger sentences constant
 */

import { describe, it, expect } from 'vitest'
import { TRIGGER_SENTENCES } from '../../src/types'
import type { InitOptions } from '../../src/types'

describe('types.ts', () => {
  describe('TRIGGER_SENTENCES', () => {
    it('should export TRIGGER_SENTENCES constant', () => {
      expect(TRIGGER_SENTENCES).toBeDefined()
      expect(Array.isArray(TRIGGER_SENTENCES)).toBe(true)
    })

    it('should have reasonable number of sentences (10-20)', () => {
      expect(TRIGGER_SENTENCES.length).toBeGreaterThanOrEqual(10)
      expect(TRIGGER_SENTENCES.length).toBeLessThanOrEqual(20)
    })

    it('should contain anti-scraping keywords', () => {
      const allText = TRIGGER_SENTENCES.join(' ').toLowerCase()
      
      // Check for key anti-scraping terms
      expect(allText).toContain('scraping')
      expect(allText).toContain('prohibited')
      expect(allText).toContain('copyright')
      expect(allText).toContain('unauthorized')
    })

    it('should have non-empty sentences', () => {
      TRIGGER_SENTENCES.forEach(sentence => {
        expect(sentence.length).toBeGreaterThan(0)
        expect(sentence.trim()).toBe(sentence) // No leading/trailing spaces
      })
    })

    it('should have sentences ending with proper punctuation', () => {
      TRIGGER_SENTENCES.forEach(sentence => {
        expect(sentence).toMatch(/[.!?]$/)
      })
    })
  })

  describe('InitOptions interface', () => {
    it('should allow valid options object', () => {
      const validOptions: InitOptions = {
        enabled: true,
        sentences: 'Test sentence',
        count: 5,
        mode: 'offscreen',
        containerId: 'test-id',
        position: 'body-end',
        scatter: false
      }
      
      expect(validOptions).toBeDefined()
    })

    it('should allow partial options', () => {
      const minimalOptions: InitOptions = {
        sentences: 'Test'
      }
      
      expect(minimalOptions).toBeDefined()
    })

    it('should allow array of sentences', () => {
      const options: InitOptions = {
        sentences: ['Sentence 1', 'Sentence 2']
      }
      
      expect(options).toBeDefined()
    })
  })
})

