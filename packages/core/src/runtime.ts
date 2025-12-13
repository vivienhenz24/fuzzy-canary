/**
 * runtime.ts
 *
 * Browser runtime entry point.
 * Imports init() and exposes it on window.YourPkg for use via <script> tag.
 * This file is bundled into runtime.min.js for CDN distribution.
 */

import { init } from '@/index'

// Expose to global scope for browser usage
if (typeof window !== 'undefined') {
  ;(window as any).YourPkg = { init }
}
