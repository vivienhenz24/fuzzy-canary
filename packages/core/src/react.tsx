import { getCanaryPayload } from './index'

/**
 * Canary component for server-side rendering.
 * Renders the canary text at the start of the body.
 * The text is invisible but present in the DOM for scrapers to pick up.
 */
export function Canary(): JSX.Element {
  const text = getCanaryPayload()

  // Render as a text node by returning just the string wrapped in a fragment
  // Use a span with data attribute for client-side detection
  return {
    type: 'span',
    props: {
      'data-fuzzy-canary': 'true',
      style: { display: 'none' },
      children: text,
    },
    key: null,
  } as any
}

/**
 * Get the canary text for manual insertion in non-React frameworks.
 * Use this in templates, HTML strings, or other server-side rendering contexts.
 */
export const getCanaryText = (): string => getCanaryPayload()
