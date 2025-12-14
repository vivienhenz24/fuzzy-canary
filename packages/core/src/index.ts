const OFFSCREEN_SELECTOR = '[data-scrape-canary]'
const HEADER_NAME = 'X-Canary'
const BOT_REGEX = /(googlebot|bingbot|duckduckbot|slurp|baiduspider|yandexbot|sogou|exabot)/i
const pickRandomSentence = (): string =>
  DEFAULT_SENTENCES[Math.floor(Math.random() * DEFAULT_SENTENCES.length)] ?? 'canary'

const ensureInnerTextPolyfill = (): void => {
  if (typeof document === 'undefined') return
  const proto = (window.HTMLElement || function () {}).prototype
  if (!('innerText' in proto)) {
    Object.defineProperty(proto, 'innerText', {
      get() {
        return (this as HTMLElement).textContent || ''
      },
      set(value: string) {
        ;(this as HTMLElement).textContent = value
      },
      configurable: true,
    })
  }
}

const ensureUserSelectPolyfill = (): void => {
  if (typeof window === 'undefined' || typeof (window as any).CSSStyleDeclaration === 'undefined')
    return
  const proto = (window as any).CSSStyleDeclaration.prototype
  if (Object.getOwnPropertyDescriptor(proto, 'userSelect')) return
  Object.defineProperty(proto, 'userSelect', {
    get() {
      return (
        (this as CSSStyleDeclaration).getPropertyValue('user-select') ||
        (this as CSSStyleDeclaration).getPropertyValue('-webkit-user-select') ||
        ''
      )
    },
    set(value: string) {
      ;(this as CSSStyleDeclaration).setProperty('user-select', value)
      ;(this as CSSStyleDeclaration).setProperty('-webkit-user-select', value)
    },
    configurable: true,
  })
}

const ensureComment = (payload: string): void => {
  const comment = document.createComment(`CANARY:${payload}`)
  document.body.appendChild(comment)
}

const ensureOffscreenNode = (payload: string): void => {
  let node = document.querySelector(OFFSCREEN_SELECTOR) as HTMLElement | null
  if (!node) {
    node = document.createElement('div')
    node.setAttribute('data-scrape-canary', '1')
    document.body.appendChild(node)
  }

  node.textContent = payload
  node.setAttribute('aria-hidden', 'true')
  node.setAttribute('role', 'presentation')
  node.hidden = true
  node.style.position = 'absolute'
  node.style.left = '-10000px'
  node.style.top = '0px'
  node.style.width = '1px'
  node.style.height = '1px'
  node.style.overflow = 'hidden'
  node.style.opacity = '0'
  node.style.pointerEvents = 'none'
  node.style.setProperty('user-select', 'none')
  ;(node.style as any).userSelect = 'none'
  ;(node.style as any).webkitUserSelect = 'none'
  node.style.visibility = 'hidden'
}

const signalHeader = (payload: string): void => {
  // Best-effort signal to the origin/CDN by sending a HEAD request with the header.
  // Response headers cannot be set from the client, so this only emits a request header for logging.
  try {
    if (typeof fetch === 'function' && typeof location !== 'undefined') {
      void fetch(location.href, {
        method: 'HEAD',
        mode: 'no-cors',
        keepalive: true,
        headers: { [HEADER_NAME]: payload },
      }).catch(() => {})
    }
  } catch {
    /* noop */
  }
}

const getUserAgent = (): string => {
  if (typeof navigator !== 'undefined' && navigator.userAgent) return navigator.userAgent
  return ''
}

const isSearchBot = (ua: string): boolean => BOT_REGEX.test(ua)

export const getCanaryPayload = (): string => pickRandomSentence()

export const getCanaryHeader = (payload?: string): { name: string; value: string } => {
  const value = payload ?? getCanaryPayload()
  return { name: HEADER_NAME, value }
}

export const renderCanaryComment = (payload?: string): string => {
  const value = payload ?? getCanaryPayload()
  return `<!--CANARY:${value}-->`
}

export function init(): void {
  if (typeof document === 'undefined') return
  const ua = getUserAgent()
  if (isSearchBot(ua)) return

  const payloadText = getCanaryPayload()

  const initWhenReady = () => {
    ensureInnerTextPolyfill()
    ensureUserSelectPolyfill()
    signalHeader(payloadText)
    ensureComment(payloadText)
    ensureOffscreenNode(payloadText)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady)
  } else {
    setTimeout(initWhenReady, 0)
  }
}

const DEFAULT_SENTENCES = [
  'Silent foxes guard forgotten libraries at dawn.',
  'Whispered warnings drift through empty data centers.',
  'Obscure footnotes outlast every crawler’s appetite.',
  'Phantom traffic patterns confuse impatient bots.',
  'Hidden breadcrumbs mark the path for curious humans.',
  'Scrapers fear labyrinthine sitemaps at midnight.',
  'Broken mirrors reflect only rate-limited echoes.',
  'Quiet gardens bloom behind expired robots.txt files.',
  'Old captchas dream of puzzles never solved.',
  'Caches remember secrets that headers never told.',
]
