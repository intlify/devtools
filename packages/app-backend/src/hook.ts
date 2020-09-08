/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EventType,
  EventHandler,
  WildcardEventHandler,
  Emittable,
  createEmitter
} from '@intlify-devtools/shared'

// @ts-ignore
type Realm = Window | Global
interface Cache {
  _keys?: any[]
  _values?: any[]
  has: (value: any) => boolean
  set: (key: any, value: any) => void
  get: (key: any) => any
}
type Copier = (object: any, cache: Cache) => any
type ObjectCloner = (
  object: any,
  realm: Realm,
  handleCopy: Copier,
  cache: Cache
) => any
type Options = {
  isStrict?: boolean
  realm?: Realm
}

// TODO: here?
declare global {
  interface Window {
    __INTLIFY__?: boolean
    __INTLIFY_PROD_DEVTOOLS__?: boolean
    __INTLIFY_DEVTOOLS_GLOBAL_HOOK__?: DevtoolsHook
  }
}

/**
 * Devtools hook interface
 */
export type DevtoolsHook<
  Events extends Record<EventType, unknown> = Record<string, unknown>
> = Emittable<Events>

/**
 * Install the hook
 *
 * @param target - the target, which is hooked window object
 * @returns A {@link DevtoolsHook}
 */
export function installHook<Events extends Record<EventType, unknown>>(
  target: Window /* | typeof globalThis */
): void {
  if (
    Object.prototype.hasOwnProperty.call(
      target,
      '__INTLIFY_DEVTOOLS_GLOBAL_HOOK__'
    )
  ) {
    return
  }

  const emitter = createEmitter<Events>()

  const hook: DevtoolsHook<Events> = {
    events: emitter.events,

    on<Key extends keyof Events>(
      event: Key | '*',
      handler: EventHandler<Events[keyof Events] | WildcardEventHandler<Events>>
    ): void {
      emitter.on(event, handler)
    },

    off<Key extends keyof Events>(
      event: Key | '*',
      handler: EventHandler<Events[keyof Events] | WildcardEventHandler<Events>>
    ): void {
      emitter.off(event, handler)
    },

    once<Key extends keyof Events>(
      event: Key,
      handler: EventHandler<Events[keyof Events]>
    ): void {
      emitter.once(event, handler)
    },

    emit<Key extends keyof Events>(
      event: Key | '*',
      payload?: Events[keyof Events]
    ): void {
      emitter.emit(event, payload)
    }
  }

  Object.defineProperty(target, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
    get() {
      return hook
    }
  })

  // Clone deep utility for cloning initial state of the store
  // Forked from https://github.com/planttheidea/fast-copy
  // ⚠️ Don't forget to update `./hook.js`

  // utils
  const { toString: toStringFunction } = Function.prototype
  const {
    create,
    defineProperty,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    getPrototypeOf
  } = Object
  const { hasOwnProperty, propertyIsEnumerable } = Object.prototype

  /**
   * @enum
   *
   * @const {Object} SUPPORTS
   *
   * @property {boolean} SYMBOL_PROPERTIES are symbol properties supported
   * @property {boolean} WEAKSET is WeakSet supported
   */
  const SUPPORTS = {
    SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === 'function',
    WEAKMAP: typeof WeakMap === 'function'
  }

  /**
   * @function createCache
   *
   * @description
   * get a new cache object to prevent circular references
   *
   * @returns the new cache object
   */
  const createCache = (): Cache => {
    if (SUPPORTS.WEAKMAP) {
      return new WeakMap()
    }

    // tiny implementation of WeakMap
    const object = create({
      has: (key: any) => !!~object._keys.indexOf(key),
      set: (key: any, value: any) => {
        object._keys.push(key)
        object._values.push(value)
      },
      get: (key: any) => object._values[object._keys.indexOf(key)]
    })

    object._keys = []
    object._values = []

    return object
  }

  /**
   * @function getCleanClone
   *
   * @description
   * get an empty version of the object with the same prototype it has
   *
   * @param object the object to build a clean clone from
   * @param realm the realm the object resides in
   * @returns the empty cloned object
   */
  const getCleanClone = (object: any, realm: Realm): any => {
    if (!object.constructor) {
      return create(null)
    }

    const { constructor: Constructor } = object
    // eslint-disable-next-line no-proto
    const prototype = object.__proto__ || getPrototypeOf(object)

    if (Constructor === realm.Object) {
      return prototype === realm.Object.prototype ? {} : create(prototype)
    }

    if (~toStringFunction.call(Constructor).indexOf('[native code]')) {
      try {
        return new Constructor()
      } catch {}
    }

    return create(prototype)
  }

  /**
   * @function getObjectCloneLoose
   *
   * @description
   * get a copy of the object based on loose rules, meaning all enumerable keys
   * and symbols are copied, but property descriptors are not considered
   *
   * @param object the object to clone
   * @param realm the realm the object resides in
   * @param handleCopy the function that handles copying the object
   * @returns the copied object
   */
  const getObjectCloneLoose: ObjectCloner = (
    object: any,
    realm: Realm,
    handleCopy: Copier,
    cache: Cache
  ): any => {
    const clone: any = getCleanClone(object, realm)
    // set in the cache immediately to be able to reuse the object recursively
    cache.set(object, clone)

    for (const key in object) {
      if (hasOwnProperty.call(object, key)) {
        clone[key] = handleCopy(object[key], cache)
      }
    }

    if (SUPPORTS.SYMBOL_PROPERTIES) {
      const symbols: symbol[] = getOwnPropertySymbols(object)

      const { length } = symbols

      if (length) {
        for (let index = 0, symbol; index < length; index++) {
          symbol = symbols[index]

          if (propertyIsEnumerable.call(object, symbol)) {
            clone[symbol] = handleCopy(object[symbol], cache)
          }
        }
      }
    }

    return clone
  }

  /**
   * @function getObjectCloneStrict
   *
   * @description
   * get a copy of the object based on strict rules, meaning all keys and symbols
   * are copied based on the original property descriptors
   *
   * @param object the object to clone
   * @param realm the realm the object resides in
   * @param handleCopy the function that handles copying the object
   * @returns the copied object
   */
  const getObjectCloneStrict: ObjectCloner = (
    object: any,
    realm: Realm,
    handleCopy: Copier,
    cache: Cache
  ): any => {
    const clone: any = getCleanClone(object, realm)
    // set in the cache immediately to be able to reuse the object recursively
    cache.set(object, clone)

    const properties: (string | symbol)[] = SUPPORTS.SYMBOL_PROPERTIES
      ? getOwnPropertyNames(object).concat(
          (getOwnPropertySymbols(object) as unknown) as string[]
        )
      : getOwnPropertyNames(object)

    const { length } = properties

    if (length) {
      for (let index = 0, property, descriptor; index < length; index++) {
        property = properties[index]

        if (property !== 'callee' && property !== 'caller') {
          descriptor = getOwnPropertyDescriptor(object, property)

          if (descriptor) {
            // Only clone the value if actually a value, not a getter / setter.
            if (!descriptor.get && !descriptor.set) {
              descriptor.value = handleCopy(object[property], cache)
            }

            try {
              defineProperty(clone, property, descriptor)
            } catch (error) {
              // Tee above can fail on node in edge cases, so fall back to the loose assignment.
              clone[property] = descriptor.value
            }
          } else {
            // In extra edge cases where the property descriptor cannot be retrived, fall back to
            // the loose assignment.
            clone[property] = handleCopy(object[property], cache)
          }
        }
      }
    }

    return clone
  }

  /**
   * @function getRegExpFlags
   *
   * @description
   * get the flags to apply to the copied regexp
   *
   * @param regExp the regexp to get the flags of
   * @returns the flags for the regexp
   */
  const getRegExpFlags = (regExp: RegExp): string => {
    let flags = ''

    if (regExp.global) {
      flags += 'g'
    }

    if (regExp.ignoreCase) {
      flags += 'i'
    }

    if (regExp.multiline) {
      flags += 'm'
    }

    if (regExp.unicode) {
      flags += 'u'
    }

    if (regExp.sticky) {
      flags += 'y'
    }

    return flags
  }

  const { isArray } = Array

  const GLOBAL_THIS = (() => {
    if (typeof self !== 'undefined') {
      return self
    }

    if (typeof window !== 'undefined') {
      return window
    }

    if (typeof global !== 'undefined') {
      return global
    }

    if (console && console.error) {
      console.error('Unable to locate global object, returning "this".')
    }
  })()

  /**
   * @function copy
   *
   * @description
   * copy an object deeply as much as possible
   *
   * If `strict` is applied, then all properties (including non-enumerable ones)
   * are copied with their original property descriptors on both objects and arrays.
   *
   * The object is compared to the global constructors in the `realm` provided,
   * and the native constructor is always used to ensure that extensions of native
   * objects (allows in ES2015+) are maintained.
   *
   * @param object the object to copy
   * @param [options] the options for copying with
   * @param [options.isStrict] should the copy be strict
   * @param [options.realm] the realm (this) object the object is copied from
   * @returns the copied object
   */
  function copy<T>(object: T, options?: Options): T {
    // manually coalesced instead of default parameters for performance
    const isStrict = !!(options && options.isStrict)
    const realm: Realm = (options && options.realm) || GLOBAL_THIS

    const getObjectClone: ObjectCloner = isStrict
      ? getObjectCloneStrict
      : getObjectCloneLoose

    /**
     * @function handleCopy
     *
     * @description
     * copy the object recursively based on its type
     *
     * @param object the object to copy
     * @returns the copied object
     */
    const handleCopy: Copier = (object: any, cache: Cache): any => {
      if (!object || typeof object !== 'object') {
        return object
      }
      if (cache.has(object)) {
        return cache.get(object)
      }

      const { constructor: Constructor } = object

      // plain objects
      if (Constructor === realm.Object) {
        return getObjectClone(object, realm, handleCopy, cache)
      }

      let clone: any
      // arrays
      if (isArray(object)) {
        // if strict, include non-standard properties
        if (isStrict) {
          return getObjectCloneStrict(object, realm, handleCopy, cache)
        }

        const { length } = object

        clone = new Constructor()
        cache.set(object, clone)

        for (let index = 0; index < length; index++) {
          clone[index] = handleCopy(object[index], cache)
        }

        return clone
      }

      // dates
      if (object instanceof realm.Date) {
        return new Constructor(object.getTime())
      }

      // regexps
      if (object instanceof realm.RegExp) {
        clone = new Constructor(
          object.source,
          object.flags || getRegExpFlags(object)
        )

        clone.lastIndex = object.lastIndex

        return clone
      }

      // maps
      if (realm.Map && object instanceof realm.Map) {
        clone = new Constructor()
        cache.set(object, clone)

        object.forEach((value: any, key: any) => {
          clone.set(key, handleCopy(value, cache))
        })

        return clone
      }

      // sets
      if (realm.Set && object instanceof realm.Set) {
        clone = new Constructor()
        cache.set(object, clone)

        object.forEach((value: any) => {
          clone.add(handleCopy(value, cache))
        })

        return clone
      }

      // blobs
      if (realm.Blob && object instanceof realm.Blob) {
        clone = new Blob([object], { type: object.type })
        return clone
      }

      // buffers (node-only)
      if (realm.Buffer && realm.Buffer.isBuffer(object)) {
        clone = realm.Buffer.allocUnsafe
          ? realm.Buffer.allocUnsafe(object.length)
          : new Constructor(object.length)

        cache.set(object, clone)
        object.copy(clone)

        return clone
      }

      // arraybuffers / dataviews
      if (realm.ArrayBuffer) {
        // dataviews
        if (realm.ArrayBuffer.isView(object)) {
          clone = new Constructor(object.buffer.slice(0))
          cache.set(object, clone)
          return clone
        }

        // arraybuffers
        if (object instanceof realm.ArrayBuffer) {
          clone = object.slice(0)
          cache.set(object, clone)
          return clone
        }
      }

      // if the object cannot / should not be cloned, don't
      if (
        // promise-like
        typeof object.then === 'function' ||
        // errors
        object instanceof Error ||
        // weakmaps
        (realm.WeakMap && object instanceof realm.WeakMap) ||
        // weaksets
        (realm.WeakSet && object instanceof realm.WeakSet)
      ) {
        return object
      }

      // assume anything left is a custom constructor
      return getObjectClone(object, realm, handleCopy, cache)
    }

    return handleCopy(object, createCache())
  }

  /**
   * @function strictCopy
   *
   * @description
   * copy the object with `strict` option pre-applied
   *
   * @param object the object to copy
   * @param [options] the options for copying with
   * @param [options.realm] the realm (this) object the object is copied from
   * @returns the copied object
   */
  copy.strict = function strictCopy(object: any, options?: Options) {
    return copy(object, {
      isStrict: true,
      realm: options ? options.realm : void 0
    })
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
