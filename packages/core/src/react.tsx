import React from 'react'
import { getCanaryPayload, getCanaryHtml, type CanaryLink } from './index'
import { isAllowlistedBot } from './allowlist'

export interface CanaryProps {
  /**
   * User agent string from the request headers.
   * If provided, this will be used for bot detection.
   * If not provided, the component will attempt to auto-detect from Next.js headers.
   * If the user agent matches an allowlisted bot (Google, Bing, etc.), the canary will not render.
   *
   * @example
   * ```tsx
   * // Next.js - automatic detection (recommended)
   * <Canary />
   *
   * // Other frameworks - manual
   * <Canary userAgent={request.headers['user-agent']} />
   * ```
   */
  userAgent?: string
}

/**
 * Canary component for server-side rendering.
 * Renders hidden canary links at the start of the body.
 * The links are invisible but present in the DOM for scrapers to pick up and follow.
 *
 * Automatically detects user agent from Next.js headers if not provided.
 *
 * @param userAgent - Optional user agent string to check against allowlist. If not provided, attempts to auto-detect from Next.js headers.
 * @returns Hidden div with canary links, or null if user agent is allowlisted
 */
export function Canary({ userAgent: propUserAgent }: CanaryProps = {}): JSX.Element | null {
  // Auto-detect user agent if not provided and we're in Next.js
  let userAgent = propUserAgent

  if (!userAgent) {
    try {
      // Try to get headers from Next.js (only works in Server Components)
      const { headers } = require('next/headers')
      const headersList = headers()
      userAgent = headersList.get('user-agent') || undefined
    } catch {
      // Not in Next.js environment or not a Server Component - graceful fallback
      userAgent = undefined
    }
  }

  // Skip rendering for allowlisted bots (Google, Bing, social media crawlers, etc.)
  if (userAgent && isAllowlistedBot(userAgent)) {
    return null
  }

  const links = getCanaryPayload()

  if (links.length === 0) {
    return null
  }

  return (
    <div
      data-fuzzy-canary="true"
      style={{
        display: 'none',
        position: 'absolute',
        left: '-9999px',
        visibility: 'hidden',
      }}
    >
      {links.map(({ description, url }, index) => (
        <a
          key={index}
          href={url}
          data-canary-link="true"
          style={{ display: 'inline-block', marginRight: '10px' }}
        >
          {description} - {url}
        </a>
      ))}
    </div>
  )
}

/**
 * Get the canary HTML for manual insertion in non-React frameworks.
 * Use this in templates, HTML strings, or other server-side rendering contexts.
 */
export const getCanaryText = (): string => getCanaryHtml()
