import React from 'react'
import { getCanaryPayload } from './index'

export interface CanaryProps {}

/**
 * Canary component for server-side rendering.
 * Renders hidden canary links at the start of the body.
 * The links are invisible but present in the DOM for scrapers to pick up and follow.
 *
 * @returns Hidden div with canary links, or null if no links are configured
 */
export function Canary(_props: CanaryProps = {}): JSX.Element | null {
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
