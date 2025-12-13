import { useEffect } from 'react'
import type { InitOptions } from '@fuzzycanary/core'
import { init } from '@fuzzycanary/core'

export type YourPkgScriptProps = InitOptions & {
  /** Set false to skip init entirely */
  enabled?: boolean
}

/**
 * Next.js adapter component that calls init() on the client after mount.
 * Safe for both App Router and Pages Router usage.
 */
export function YourPkgScript({ enabled = true, ...options }: YourPkgScriptProps) {
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    init(options)
  }, [enabled, options])

  return null
}

export default YourPkgScript
