export const isArray = Array.isArray
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isObject = (val: unknown): val is Record<any, any> => // eslint-disable-line
  val !== null && typeof val === 'object'
