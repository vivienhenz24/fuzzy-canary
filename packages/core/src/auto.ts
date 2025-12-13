import { init } from './index'
import type { InitOptions } from './types'

const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.autoInit')
const globalAny = globalThis as any

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined
  return value === 'true' || value === '1'
}

const readEnv = (): Partial<InitOptions> => {
  if (typeof process === 'undefined' || !process.env) return {}
  const {
    FUZZYCANARY_TOKEN,
    NEXT_PUBLIC_FUZZYCANARY_TOKEN,
    FUZZYCANARY_HEADER,
    NEXT_PUBLIC_FUZZYCANARY_HEADER,
    FUZZYCANARY_META,
    NEXT_PUBLIC_FUZZYCANARY_META,
    FUZZYCANARY_SKIP_BOTS,
  } = process.env

  return {
    token: FUZZYCANARY_TOKEN || NEXT_PUBLIC_FUZZYCANARY_TOKEN,
    headerName: FUZZYCANARY_HEADER || NEXT_PUBLIC_FUZZYCANARY_HEADER,
    metaName: FUZZYCANARY_META || NEXT_PUBLIC_FUZZYCANARY_META,
    skipOffscreenForBots: parseBoolean(FUZZYCANARY_SKIP_BOTS),
  }
}

const readWindow = (): Partial<InitOptions> => {
  if (typeof globalThis === 'undefined') return {}
  const opts = globalAny.FUZZYCANARY_OPTIONS as Partial<InitOptions> | undefined
  const token = globalAny.FUZZYCANARY_TOKEN as string | undefined
  return { token, ...(opts || {}) }
}

const readDataAttributes = (): Partial<InitOptions> => {
  if (typeof document === 'undefined') return {}
  const script = document.currentScript as HTMLScriptElement | null
  if (!script?.dataset) return {}

  const { fuzzycanaryToken, fuzzycanaryHeader, fuzzycanaryMeta, fuzzycanarySkipBots } =
    script.dataset

  return {
    token: fuzzycanaryToken,
    headerName: fuzzycanaryHeader,
    metaName: fuzzycanaryMeta,
    skipOffscreenForBots: parseBoolean(fuzzycanarySkipBots),
  }
}

const resolveOptions = (): InitOptions | null => {
  const env = readEnv()
  const win = readWindow()
  const data = readDataAttributes()

  const token = win.token || data.token || env.token

  if (!token) return null

  return {
    token,
    headerName: win.headerName || data.headerName || env.headerName,
    metaName: win.metaName || data.metaName || env.metaName,
    skipOffscreenForBots:
      typeof win.skipOffscreenForBots === 'boolean'
        ? win.skipOffscreenForBots
        : typeof data.skipOffscreenForBots === 'boolean'
          ? data.skipOffscreenForBots
          : env.skipOffscreenForBots,
    registerHeader: win.registerHeader,
    userAgent: win.userAgent,
  }
}

const run = (): void => {
  const options = resolveOptions()
  if (!options) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(
        '[fuzzycanary] No token found for auto init. Set FUZZYCANARY_TOKEN, NEXT_PUBLIC_FUZZYCANARY_TOKEN, window.FUZZYCANARY_TOKEN, or data-fuzzycanary-token.'
      )
    }
    return
  }
  init(options)
}

if (!globalAny[AUTO_INIT_FLAG]) {
  run()
  globalAny[AUTO_INIT_FLAG] = true
}
