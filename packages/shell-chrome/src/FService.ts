import { BService } from './BService'

export interface Devtools {
  inspect(kind: string): boolean
  expand(id: number): boolean
  setBackend(bend: BService): void
  requestElementTag(id: number): string
}

let _app: any = null
let _bend: BService | null = null

export function setApp(app: any): void {
  _app = app
}

export function setBackend(bend: BService): void {
  _bend = bend
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function inspect(kind: string): boolean {
  console.log('[FService] insepct', kind)
  console.log(_app?.config)
  return true
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function expand(id: number, cb?: Function): Promise<boolean> {
  console.log('[FService] expand id', id)
  if (cb) {
    const ret = await cb('callback called at devtools')
    console.log(`[FService] expaned callback result`, ret)
    console.log('request element tag with id', await requestElementTag(id))
  }
  return Promise.resolve(true)
}

export async function requestElementTag(id: number): Promise<string> {
  console.log('[FService] requestElementTag', id)
  if (_bend) {
    return await _bend?.getElementTag(id)
  } else {
    return Promise.resolve('(none)')
  }
}

export const mod = {
  inspect,
  setBackend,
  expand,
  requestElementTag
}
