import { useEffect } from 'react'
import { init } from '@fuzzycanary/core'

export type YourPkgScriptProps = {
  /** Set false to skip init entirely */
  enabled?: boolean
}

/**
 * Next.js adapter component that calls init() on the client after mount.
 * Safe for both App Router and Pages Router usage.
 */
export function YourPkgScript({ enabled = true }: YourPkgScriptProps) {
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    init()
  }, [enabled])

  return null
}

export default YourPkgScript
