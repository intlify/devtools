import { getGlobalThis, createEmitter } from '@intlify/shared'

import type { Emittable } from '@intlify/shared'
import type {
  IntlifyDevToolsEmitterHooks,
  IntlifyDevToolsHookPayloads
} from '@intlify/devtools-if'

export interface IntlifyHook {
  i18nPayload: any[]
  translatePayload: any[]
  emitter: Emittable<IntlifyDevToolsEmitterHooks>
  clearI18nPayload(): void
  clearTranslatePayload(): void
}

function createHook() {
  const target = getGlobalThis()
  if (target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__) {
    return target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__
  }

  const emitter = createEmitter<IntlifyDevToolsEmitterHooks>()
  target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__ = emitter

  let _i18nPayload: any[] = []
  let _translatePayload: any[] = []

  // TODO: type errors
  // @ts-ignore
  emitter.on(
    'i18n:init',
    (payload: IntlifyDevToolsHookPayloads['i18n:init']) => {
      console.log('i18n:init', payload)
      _i18nPayload.push(payload)
    }
  )

  // TODO: type errors
  // @ts-ignore
  emitter.on(
    'function:translate',
    (payload: IntlifyDevToolsHookPayloads['function:translate']) => {
      console.log('function:translate', payload)
      _translatePayload.push(payload)
    }
  )

  function clearI18nPayload() {
    _i18nPayload = []
    console.log('clear i18n payload', _i18nPayload)
  }

  function clearTranslatePayload() {
    _translatePayload = []
    console.log('clear translate payload', _translatePayload)
  }

  return {
    get i18nPayload() {
      return _i18nPayload
    },
    get translatePayload() {
      return _translatePayload
    },
    emitter,
    clearI18nPayload,
    clearTranslatePayload
  }
}

export const hook = createHook()
