import React from 'react'
import { getCanaryPayload } from './index'

/**
 * Canary component for server-side rendering.
 * Renders the canary text at the start of the body.
 * The text is invisible but present in the DOM for scrapers to pick up.
 */
export function Canary(): JSX.Element {
  const text = getCanaryPayload()

  return (
    <span data-fuzzy-canary="true" style={{ display: 'none' }}>
      {text}
    </span>
  )
}

/**
 * Get the canary text for manual insertion in non-React frameworks.
 * Use this in templates, HTML strings, or other server-side rendering contexts.
 */
export const getCanaryText = (): string => getCanaryPayload()
