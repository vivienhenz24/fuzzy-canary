import { init } from './index'

const AUTO_INIT_FLAG = Symbol.for('fuzzycanary.autoInit')
const globalAny = globalThis as any

const run = (): void => {
  init()
}

if (!globalAny[AUTO_INIT_FLAG]) {
  run()
  globalAny[AUTO_INIT_FLAG] = true
}
