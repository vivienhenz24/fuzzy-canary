/**
 * Global test setup for Vitest + jsdom
 * Configures the DOM environment for unit and integration tests
 */

import { vi } from 'vitest'

// Prevent auto-init side effects during test module evaluation
;(globalThis as any)[Symbol.for('fuzzycanary.disableAuto')] = true

// Mock console.warn to track warnings without polluting test output
global.console = {
  ...console,
  warn: vi.fn(console.warn),
}

// Helper to clean up DOM before each test
export function cleanupDOM() {
  // Clear document body and head
  document.body.innerHTML = ''
  document.head.innerHTML = ''

  // Reset document ready state to 'complete' by default
  Object.defineProperty(document, 'readyState', {
    writable: true,
    value: 'complete',
  })

  // Default user agent to a non-bot string
  setUserAgent('Mozilla/5.0 (jsdom)')

  // Reset DOM canary injection guard
  delete (globalThis as any)[Symbol.for('fuzzycanary.domInit')]
  delete (globalThis as any)[Symbol.for('fuzzycanary.autoImport')]
}

// Helper to wait for async DOM operations
export async function waitForDOMUpdate(ms = 20) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to stub navigator.userAgent for bot / non-bot scenarios
export function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  })
}
