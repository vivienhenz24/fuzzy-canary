const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.domInit')
const AUTO_IMPORT_FLAG = Symbol.for('fuzzycanary.autoImport')
const DISABLE_AUTO_FLAG = Symbol.for('fuzzycanary.disableAuto')
const globalAny = globalThis as any

export interface CanaryLink {
  description: string
  url: string
}

const parseCanaryLinks = (): CanaryLink[] => {
  const urlsEnv = process.env.CANARY_TEXT || ''
  if (!urlsEnv) return []

  try {
    const parsed = JSON.parse(urlsEnv)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => {
          if (typeof item === 'object' && item.url && item.description) {
            return { description: item.description, url: item.url }
          } else if (typeof item === 'string' && item.length > 0) {
            return { description: `Resource ${index + 1}`, url: item }
          }
          return null
        })
        .filter((link): link is CanaryLink => link !== null)
    }
  } catch {}

  return []
}

const getCanaryLinks = (): CanaryLink[] => {
  return parseCanaryLinks()
}

const hasSSRCanary = (): boolean => {
  if (typeof document === 'undefined') return false

  // Check for SSR-injected canary with data attribute
  const ssrCanary = document.querySelector('[data-fuzzy-canary]')
  return ssrCanary !== null
}

const injectLinksAtBodyStart = (links: CanaryLink[]): void => {
  if (typeof document === 'undefined' || !document.body) return
  if (hasSSRCanary()) return

  const firstChild = document.body.firstChild
  if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
    const element = firstChild as HTMLElement
    if (element.getAttribute('data-fuzzy-canary') === 'true') {
      return
    }
  }

  const container = document.createElement('div')
  container.setAttribute('data-fuzzy-canary', 'true')
  container.style.display = 'none'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.visibility = 'hidden'

  links.forEach(({ description, url }) => {
    const link = document.createElement('a')
    link.href = url
    link.textContent = `${description} - ${url}`
    link.setAttribute('data-canary-link', 'true')
    link.style.display = 'inline-block'
    link.style.marginRight = '10px'
    container.appendChild(link)
  })

  document.body.insertBefore(container, document.body.firstChild)
}

export const getCanaryPayload = (): CanaryLink[] => getCanaryLinks()

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

export function init(): void {
  if (globalAny[AUTO_INIT_FLAG]) return
  if (typeof document === 'undefined' || !document.body) return

  const links = getCanaryPayload()
  injectLinksAtBodyStart(links)
  globalAny[AUTO_INIT_FLAG] = true
}

const shouldAutoInit = (): boolean => {
  if (globalAny[DISABLE_AUTO_FLAG]) return false
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  return true
}

if (shouldAutoInit() && !globalAny[AUTO_IMPORT_FLAG]) {
  globalAny[AUTO_IMPORT_FLAG] = true
  init()
}
