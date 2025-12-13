/**
 * Global test setup for Vitest + jsdom
 * Configures the DOM environment for unit and integration tests
 */

import { beforeEach, vi } from 'vitest'

// Setup clean DOM before each test
beforeEach(() => {
  // Clear document body
  document.body.innerHTML = ''
  
  // Reset document ready state to 'complete' by default
  Object.defineProperty(document, 'readyState', {
    writable: true,
    value: 'complete'
  })
  
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

