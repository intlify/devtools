import { browser } from 'webextension-polyfill-ts'
;(async () => {
  const panel = await browser.devtools.panels.create(
    'Intlify',
    '',
    'devtools.html'
  )
  console.log('[devtools-background] created panel', panel)
})()
