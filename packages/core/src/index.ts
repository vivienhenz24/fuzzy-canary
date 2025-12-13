import type { InitOptions } from './types'

export type { InitOptions }

const BOT_REGEX = /(googlebot|bingbot)/i
const OFFSCREEN_SELECTOR = '[data-scrape-canary]'

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
  if (typeof window === 'undefined' || typeof (window as any).CSSStyleDeclaration === 'undefined') return
  const proto = (window as any).CSSStyleDeclaration.prototype
  if (Object.getOwnPropertyDescriptor(proto, 'userSelect')) return
  Object.defineProperty(proto, 'userSelect', {
    get() {
      return (this as CSSStyleDeclaration).getPropertyValue('user-select') ||
        (this as CSSStyleDeclaration).getPropertyValue('-webkit-user-select') ||
        ''
    },
    set(value: string) {
      ;(this as CSSStyleDeclaration).setProperty('user-select', value)
      ;(this as CSSStyleDeclaration).setProperty('-webkit-user-select', value)
    },
    configurable: true,
  })
}

const getUserAgent = (override?: string): string => {
  if (override) return override
  if (typeof navigator !== 'undefined' && navigator.userAgent) return navigator.userAgent
  return ''
}

const isSearchBot = (ua: string): boolean => BOT_REGEX.test(ua)

const ensureMetaTag = (name: string, content: string): void => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

const ensureComment = (token: string): void => {
  const comment = document.createComment(`CANARY:${token}`)
  document.body.appendChild(comment)
}

const ensureOffscreenNode = (token: string): void => {
  let node = document.querySelector(OFFSCREEN_SELECTOR) as HTMLElement | null
  if (!node) {
    node = document.createElement('div')
    node.setAttribute('data-scrape-canary', '1')
    document.body.appendChild(node)
  }

  node.textContent = token
  node.setAttribute('aria-hidden', 'true')
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

export function init(options: InitOptions): void {
  const {
    token,
    headerName = 'X-Canary',
    metaName = 'scrape-canary',
    registerHeader,
    skipOffscreenForBots = true,
    userAgent,
  } = options

  if (!token) return
  if (typeof document === 'undefined') return

  const ua = getUserAgent(userAgent)
  const shouldSkipOffscreen = skipOffscreenForBots && isSearchBot(ua)

  const initWhenReady = () => {
    ensureInnerTextPolyfill()
    ensureUserSelectPolyfill()
    registerHeader?.(headerName, token)
    ensureMetaTag(metaName, token)
    ensureComment(token)

    if (!shouldSkipOffscreen) {
      ensureOffscreenNode(token)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady)
  } else {
    setTimeout(initWhenReady, 0)
  }
}
