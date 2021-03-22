export const mixin = {
  mounted(this: any) {
    const { _, $el } = this
    // console.log('mounted', _, $el, $el.nodeType)
    if (_ && _.type && _.type.__INTLIFY_META__ && $el) {
      $el.__INTLIFY_META__ = _.type.__INTLIFY_META__
      if (
        $el.nodeType === Node.TEXT_NODE &&
        $el.nextSibling &&
        $el.nextSibling.nodeType === Node.ELEMENT_NODE
      ) {
        // for fragment
        const { nextSibling: nextEl } = $el
        nextEl.setAttribute('data-intlify', _.type.__INTLIFY_META__)
        // $el.__INTLIFY_META__ = nextEl.__INTLIFY_META__ = _.type.__INTLIFY_META__
      } else {
        $el.setAttribute('data-intlify', _.type.__INTLIFY_META__)
        // $el.__INTLIFY_META__ = _.type.__INTLIFY_META__
      }
    }
  }
}
