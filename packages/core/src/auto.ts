import { init } from '@/index'
import type { InitOptions } from '@/types'

const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.autoInit')
const globalAny = globalThis as any

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined
  return value === 'true' || value === '1'
}

const parseList = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
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

  const {
    fuzzycanaryToken,
    fuzzycanaryHeader,
    fuzzycanaryMeta,
    fuzzycanarySkipBots,
    fuzzycanarySentences,
  } = script.dataset

  return {
    token: fuzzycanaryToken,
    headerName: fuzzycanaryHeader,
    metaName: fuzzycanaryMeta,
    skipOffscreenForBots: parseBoolean(fuzzycanarySkipBots),
    sentences: parseList(fuzzycanarySentences),
  }
}

const resolveOptions = (): InitOptions | null => {
  const win = readWindow()
  const data = readDataAttributes()

  const token = win.token || data.token
  const sentences = win.sentences || data.sentences

  return {
    token,
    headerName: win.headerName || data.headerName,
    metaName: win.metaName || data.metaName,
    skipOffscreenForBots:
      typeof win.skipOffscreenForBots === 'boolean'
        ? win.skipOffscreenForBots
        : data.skipOffscreenForBots,
    registerHeader: win.registerHeader,
    sentences,
    userAgent: win.userAgent,
  }
}

const run = (): void => {
  const options = resolveOptions()
  init(options || {})
}

if (!globalAny[AUTO_INIT_FLAG]) {
  run()
  globalAny[AUTO_INIT_FLAG] = true
}
