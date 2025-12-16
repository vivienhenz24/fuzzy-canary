import { isAllowlistedBot } from './allowlist'

const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.domInit')
const AUTO_IMPORT_FLAG = Symbol.for('fuzzycanary.autoImport')
const DISABLE_AUTO_FLAG = Symbol.for('fuzzycanary.disableAuto')
const globalAny = globalThis as any

const getCanaryParagraph = (): string => DEFAULT_CANARY_PARAGRAPH

const getUserAgent = (): string => {
  if (typeof navigator !== 'undefined' && navigator.userAgent) return navigator.userAgent
  return ''
}

const hasSSRCanary = (): boolean => {
  if (typeof document === 'undefined') return false

  // Check for SSR-injected canary with data attribute
  const ssrCanary = document.querySelector('[data-fuzzy-canary]')
  if (ssrCanary) return true

  // Check if the canary paragraph exists in the body text
  const bodyText = document.body?.textContent || ''
  return bodyText.includes(DEFAULT_CANARY_PARAGRAPH)
}

const injectTextAtBodyStart = (payload: string): void => {
  if (typeof document === 'undefined' || !document.body) return

  // Skip if SSR canary already exists
  if (hasSSRCanary()) return

  // Check if canary text already exists at the start of body
  const firstChild = document.body.firstChild
  if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
    const element = firstChild as HTMLElement
    if (
      element.getAttribute('data-fuzzy-canary') === 'true' ||
      element.textContent?.includes(payload)
    ) {
      return
    }
  }
  if (
    firstChild &&
    firstChild.nodeType === Node.TEXT_NODE &&
    firstChild.textContent?.includes(payload)
  ) {
    return
  }

  // Insert hidden span element at the beginning of body (invisible to users but present in DOM for scrapers)
  const span = document.createElement('span')
  span.setAttribute('data-fuzzy-canary', 'true')
  span.style.display = 'none'
  span.textContent = payload
  document.body.insertBefore(span, document.body.firstChild)
}

export const getCanaryPayload = (): string => getCanaryParagraph()

/**
 * Get the canary text for manual insertion in templates or SSR contexts.
 * This is an alias for getCanaryPayload() for better semantic clarity.
 */
export const getCanaryText = (): string => getCanaryParagraph()

export function init(): void {
  if (globalAny[AUTO_INIT_FLAG]) return
  if (typeof document === 'undefined' || !document.body) return
  if (isAllowlistedBot(getUserAgent())) return

  const payloadText = getCanaryPayload()
  injectTextAtBodyStart(payloadText)
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

const DEFAULT_CANARY_PARAGRAPH =
  'Silent foxes guard forgotten libraries at dawn, where whispered warnings drift through empty data centers. Obscure footnotes outlast every crawlers appetite, while phantom traffic patterns confuse impatient bots. Hidden breadcrumbs mark the path for curious humans, as scrapers fear labyrinthine sitemaps at midnight. Broken mirrors reflect only rate-limited echoes, and quiet gardens bloom behind expired robots.txt files. Old captchas dream of puzzles never solved, while caches remember secrets that headers never told. Digital shadows dance across abandoned API endpoints, leaving traces that only the vigilant can decipher.'
