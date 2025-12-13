/**
 * Unit tests for runtime.ts
 * Tests that window.YourPkg global is properly exposed
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { waitForDOMUpdate } from '../setup'

describe('runtime.ts', () => {
  beforeEach(() => {
    // Clear the global
    delete (window as any).YourPkg
    
    // Re-import to trigger the global assignment
    vi.resetModules()
  })

  it('should expose YourPkg on window', async () => {
    await import('../../src/runtime')
    expect((window as any).YourPkg).toBeDefined()
  })

  it('should expose init function on window.YourPkg', async () => {
    await import('../../src/runtime')
    expect((window as any).YourPkg.init).toBeDefined()
    expect(typeof (window as any).YourPkg.init).toBe('function')
  })

  it('should allow calling init through window.YourPkg', async () => {
    await import('../../src/runtime')
    
    document.body.innerHTML = ''
    ;(window as any).YourPkg.init({ sentences: 'Test from window' })
    
    await waitForDOMUpdate()
    
    const container = document.getElementById('__yourpkg')
    expect(container).toBeTruthy()
    expect(container?.textContent).toContain('Test from window')
  })

  it('should work with script tag usage pattern', async () => {
    // Simulate script tag load
    await import('../../src/runtime')
    
    // User code would call this
    const YourPkg = (window as any).YourPkg
    YourPkg.init({ 
      sentences: 'Script tag test',
      mode: 'display-none'
    })
    
    await waitForDOMUpdate()
    
    const container = document.getElementById('__yourpkg')
    expect(container).toBeTruthy()
  })
})
