export const mixin = {
  mounted(this: any) {
    const { _, $el } = this
    if (_ && _.type && _.type.__INTLIFY_META__ && $el) {
      if (
        $el.nodeType === Node.TEXT_NODE &&
        $el.nextSibling &&
        $el.nextSibling.nodeType === Node.ELEMENT_NODE
      ) {
        // for fragment
        const { nextSibling: nextEl } = $el
        nextEl.setAttribute('data-intlify', _.type.__INTLIFY_META__)
      } else {
        $el.setAttribute('data-intlify', _.type.__INTLIFY_META__)
      }
    }
  }
}
