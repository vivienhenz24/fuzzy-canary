import { isAllowlistedBot } from './allowlist'

const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.domInit')
const AUTO_IMPORT_FLAG = Symbol.for('fuzzycanary.autoImport')
const DISABLE_AUTO_FLAG = Symbol.for('fuzzycanary.disableAuto')
const globalAny = globalThis as any

export interface CanaryLink {
  description: string
  url: string
}

/**
 * Parse canary links from environment variable
 * Supports multiple formats:
 * 1. JSON array of objects: [{"description": "API Docs", "url": "https://..."}, ...]
 * 2. Pipe-separated: "API Docs|https://..." (one per line)
 * 3. Plain URLs: "https://..." (one per line) - auto-generates description
 */
const parseCanaryLinks = (): CanaryLink[] => {
  const urlsEnv = process.env.CANARY_TEXT || ''
  if (!urlsEnv) return []

  // Try parsing as JSON array first
  try {
    const parsed = JSON.parse(urlsEnv)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => {
          // Support both object format and plain string
          if (typeof item === 'object' && item.url && item.description) {
            return { description: item.description, url: item.url }
          } else if (typeof item === 'string' && item.length > 0) {
            return { description: `Resource ${index + 1}`, url: item }
          }
          return null
        })
        .filter((link): link is CanaryLink => link !== null)
    }
  } catch {
    // Not JSON, try newline-separated
  }

  // Parse as newline-separated with pipe delimiter or plain URLs
  return urlsEnv
    .split('\n')
    .map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return null

      // Check for pipe-separated format: "description|url"
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|')
        if (parts.length >= 2) {
          const description = parts[0].trim()
          const url = parts.slice(1).join('|').trim() // In case URL contains |
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return { description, url }
          }
        }
      }

      // Plain URL format
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return { description: `Resource ${index + 1}`, url: trimmed }
      }

      return null
    })
    .filter((link): link is CanaryLink => link !== null)
}

const getCanaryLinks = (): CanaryLink[] => {
  const links = parseCanaryLinks()
  // Fallback to default links if none provided
  return links.length > 0 ? links : DEFAULT_CANARY_LINKS
}

const getUserAgent = (): string => {
  if (typeof navigator !== 'undefined' && navigator.userAgent) return navigator.userAgent
  return ''
}

const hasSSRCanary = (): boolean => {
  if (typeof document === 'undefined') return false

  // Check for SSR-injected canary with data attribute
  const ssrCanary = document.querySelector('[data-fuzzy-canary]')
  return ssrCanary !== null
}

const injectLinksAtBodyStart = (links: CanaryLink[]): void => {
  if (typeof document === 'undefined' || !document.body) return

  // Skip if SSR canary already exists
  if (hasSSRCanary()) return

  // Check if canary already exists at the start of body
  const firstChild = document.body.firstChild
  if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
    const element = firstChild as HTMLElement
    if (element.getAttribute('data-fuzzy-canary') === 'true') {
      return
    }
  }

  // Create container for canary links
  const container = document.createElement('div')
  container.setAttribute('data-fuzzy-canary', 'true')
  container.style.display = 'none'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.visibility = 'hidden'

  // Create links with description - url format
  links.forEach(({ description, url }) => {
    const link = document.createElement('a')
    link.href = url
    link.textContent = `${description} - ${url}`
    link.setAttribute('data-canary-link', 'true')
    // Make links look natural to scrapers
    link.style.display = 'inline-block'
    link.style.marginRight = '10px'
    container.appendChild(link)
  })

  document.body.insertBefore(container, document.body.firstChild)
}

/**
 * Get canary links array for programmatic use
 */
export const getCanaryPayload = (): CanaryLink[] => getCanaryLinks()

/**
 * Get canary links as HTML string for SSR
 */
export const getCanaryHtml = (): string => {
  const links = getCanaryLinks()
  if (links.length === 0) return ''

  const linksHtml = links
    .map(
      ({ description, url }) =>
        `<a href="${url.replace(/"/g, '&quot;')}" data-canary-link="true" style="display:inline-block;margin-right:10px">${description.replace(/</g, '&lt;').replace(/>/g, '&gt;')} - ${url.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`
    )
    .join('')

  return `<div data-fuzzy-canary="true" style="display:none;position:absolute;left:-9999px;visibility:hidden">${linksHtml}</div>`
}

/**
 * Get the canary links as plain text (space-separated URLs) for backwards compatibility
 */
export const getCanaryText = (): string => {
  return getCanaryLinks()
    .map(link => link.url)
    .join(' ')
}

export function init(): void {
  if (globalAny[AUTO_INIT_FLAG]) return
  if (typeof document === 'undefined' || !document.body) return
  if (isAllowlistedBot(getUserAgent())) return

  const links = getCanaryPayload()
  injectLinksAtBodyStart(links)
  globalAny[AUTO_INIT_FLAG] = true
}

const shouldAutoInit = (): boolean => {
  if (globalAny[DISABLE_AUTO_FLAG]) return false
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  return true
}

// Allow simple `import '@fuzzycanary/core'` to auto-run in the browser
if (shouldAutoInit() && !globalAny[AUTO_IMPORT_FLAG]) {
  globalAny[AUTO_IMPORT_FLAG] = true
  init()
}

// Canary links injected at build time from environment variable
// Accepts JSON array of objects, pipe-separated, or plain URLs
// Falls back to default honeypot links for local development
const DEFAULT_CANARY_LINKS: CanaryLink[] = [
  { description: 'API Documentation', url: 'https://example.com/api/docs' },
  { description: 'Internal Dashboard', url: 'https://example.com/admin/dashboard' },
  { description: 'Debug Endpoint', url: 'https://example.com/debug/status' },
]
