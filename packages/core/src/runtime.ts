import { init } from './index'

// Expose to global scope for browser usage
if (typeof window !== 'undefined') {
  ;(window as any).YourPkg = { init }
}
