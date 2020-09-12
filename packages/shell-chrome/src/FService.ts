export interface Devtools {
  inspect(msg: string): void
}

let app: any = null

export function inspect(msg: string): void {
  console.log('insepct', msg)
  console.log(app?.config)
}

export function setApp(_app: any): void {
  app = _app
}

export const mod = {
  inspect,
  setApp
}
