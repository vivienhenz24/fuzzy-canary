/**
 * Global test setup for Vitest + jsdom
 * Configures the DOM environment for unit and integration tests
 */

import { beforeEach, vi } from 'vitest'

// Setup clean DOM before each test
beforeEach(() => {
  // Clear document body
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  
  // Reset document ready state to 'complete' by default
  Object.defineProperty(document, 'readyState', {
    writable: true,
    value: 'complete'
  })

  // Default user agent to a non-bot string
  setUserAgent('Mozilla/5.0 (jsdom)')
  
  // Clear any console spy mocks
  vi.clearAllMocks()
})

// Mock console.warn to track warnings without polluting test output
global.console = {
  ...console,
  warn: vi.fn(console.warn)
}

// Helper to wait for async DOM operations
export async function waitForDOMUpdate(ms = 20) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to stub navigator.userAgent for bot / non-bot scenarios
export function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true
  })
}
