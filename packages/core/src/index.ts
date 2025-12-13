const OFFSCREEN_SELECTOR = '[data-scrape-canary]'
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

export function init(): void {
  if (typeof document === 'undefined') return

  const payloadText = pickRandomSentence()

  const initWhenReady = () => {
    ensureInnerTextPolyfill()
    ensureUserSelectPolyfill()
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
