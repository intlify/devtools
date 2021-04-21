import { promises as fs } from 'fs'
import path from 'path'
import express, { json, urlencoded } from 'express'
import chalk from 'chalk'
import { config as dotEnvConfig } from 'dotenv'
import {
  generateSecret,
  decrypt,
  getResourceKeys as getResourceI18nKeys
} from '@intlify-devtools/shared'
import { screenshot, recognize } from './utils'
import { getPhraseInfo, getKeys, uploadResources, uploadResource, uploadScreenshot } from './phrase'

declare global{
  namespace Express {
    interface Request {
      phraseInfo?: PhraseInfo
    }
  }
}

import type { IntlifyDevToolsHookPayloads, } from '@intlify/devtools-if'
import type { Page, Line, Word } from 'tesseract.js'
import type { PhraseInfo } from './phrase'

const LOCAL_ENV = dotEnvConfig({ path: './.env.local' }).parsed || {}
// @ts-ignore
const SECRET =
  LOCAL_ENV.INTLIFY_META_SECRET ||
  process.env.INTLIFY_META_SECRET ||
  // @ts-ignore
  generateSecret()
const PORT = process.env.PORT || 4000

const STORE = new Map()

export type AnalisysLocalization = {
  url: string
  components: Map<
    string,
    {
      path: string
      devtools: Set<IntlifyDevToolsHookPayloads['function:translate']>
    }
  >
  screenshot?: string
  recoganize?: Page
  detecting?: Map<
    string,
    {
      lineOrWord: Line | Word
      devtool: IntlifyDevToolsHookPayloads['function:translate']
    }
  >
  notyet?: Map<string, Line | Word>
}

const STORE2 = new Map<string, AnalisysLocalization>()

const app = express()
app.use(json({ limit: '200mb' })) // TODO: change to no limit option
app.use(urlencoded({ limit: '200mb', extended: true })) // TODO: change to no limit option
app.use((req, res, next) => {
  // for CORS, TODO: change to another ways
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})
app.use(async (req, res, next) => {
  if (req.phraseInfo == null) {
    req.phraseInfo = await getPhraseInfo()
    // const keys = await getKeys(req.phraseInfo!)
    // console.log('keys', keys)
    // const uploads = await uploadResources(req.phraseInfo!)
    // console.log('uploads', uploads)
  }
  next()
})

function setComponentPath(paths: string[], components: { paths: Set<string> }) {
  paths.forEach(p => {
    const [iv, encrypedData] = p.split('$')
    const componentPath = decrypt(SECRET, iv, encrypedData)
    // console.log('path', componentPath)
    components.paths.add(componentPath)
  })
}

async function getResourceKeys(paths: string[]) {
  const ret: Record<string, string[]> = {}
  for (const p of paths) {
    const file = await fs.readFile(p, 'utf-8')
    const keys = getResourceI18nKeys(file)
    if (keys.length) {
      ret[p] = keys
    }
  }
  console.log('getResourceKeys', ret)
  return ret
}

function analysysDevTools(
  l10n: AnalisysLocalization,
  devtools: IntlifyDevToolsHookPayloads['function:translate'][]
) {
  for (const devtool of devtools) {
    if (devtool.meta?.__INTLIFY_META__) {
      const crypedPath = devtool.meta?.__INTLIFY_META__ as string
      const [iv, encrypedData] = crypedPath.split('$')
      const componentPath = decrypt(SECRET, iv, encrypedData)
      console.log('path', componentPath)
      if (l10n.components.has(crypedPath)) {
        l10n.components.get(crypedPath)?.devtools.add(devtool)
      } else {
        const comp = {
          path: componentPath,
          devtools: new Set<IntlifyDevToolsHookPayloads['function:translate']>()
        }
        comp.devtools.add(devtool)
        l10n.components.set(crypedPath, comp)
      }
    }
  }
  console.log('l10n', l10n.components)
  return l10n
}

const normalizeOCRText = (text: string): string =>
  text.trim().replace(/\r?\n/g, '')

function detectWithDevTools(l10n: AnalisysLocalization, data: Page) {
  l10n.detecting = new Map()
  l10n.notyet = new Map()

  // TODO: need to refactoring
  const notDetect = (l: Line | Word) => {
    return ![...l10n.detecting!.values()].some(value => value.lineOrWord === l)
  }

  for (const word of data.words) {
    const lineText = normalizeOCRText(word.line.text)
    let lineFound = false
    for (const [key, { devtools }] of l10n.components) {
      for (const devtool of devtools.values()) {
        if (devtool.message === lineText) {
          lineFound = true
          if (!l10n.detecting!.has(devtool.message)) {
            l10n.detecting!.set(devtool.message, {
              lineOrWord: word.line,
              devtool
            })
          } else {
            console.log('already register', devtool.message)
          }
        }
      }
    }
    if (!lineFound) {
      // TODO: refactoring
      for (const [key, { devtools }] of l10n.components) {
        for (const devtool of devtools.values()) {
          if (devtool.message === word.text) {
            lineFound = true
            if (!l10n.detecting!.has(devtool.message)) {
              l10n.detecting!.set(devtool.message, {
                lineOrWord: word,
                devtool
              })
            } else {
              console.log('already register', devtool.message)
            }
          }
        }
      }
    }

    if (!lineFound) {
      l10n.notyet.set(lineText !== word.text ? lineText : word.text, lineText !== word.text ? word.line : word)
      //l10n.notyet.set(lineText, word.line)
    }
  }
}

app.get('/upload', async (req, res) => {
  console.log('request upload ...')
  console.log('req.query', req.query)
  const { sh, url } = req.query

  if (sh) {
    if (url) {
      const filepath = path.resolve(__dirname, './tmp/screenshot.png')
      await screenshot(url, filepath)
        // @ts-ignore
      const l10n: AnalisysLocalization = STORE2.has(url)
        ? STORE2.get(url)
        : { url, components: new Map(), detecting: new Map() }
      const buffer = await fs.readFile(filepath, 'base64')
      const data = `data:image/png;base64,${buffer}`
      const result = l10n.recoganize
        ? l10n.recoganize
        : (await recognize(data)).data
      l10n.recoganize = result
      l10n.screenshot = data
      if (!l10n.detecting) {
        detectWithDevTools(l10n, result)
      }
      await uploadScreenshot(req.phraseInfo!, l10n, filepath)
      console.log('detect', l10n.detecting)
    }
    console.log('upload screenshot status')
    res.status(200).json({
      stat: 'ok'
    })
  } else {
    const fileTarget = path.resolve(__dirname, '../frontend/locales/en-US.json')
    console.log('filetarget', fileTarget)
    const ret = await uploadResource(req.phraseInfo!, fileTarget)
    console.log('upload resource status', ret)
    res.status(200).json({
      stat: 'ok'
    })
  }
})

app.get('/', async (req, res) => {
  console.log('req.query', req.query)
  const { url, locale } = req.query

  const components = STORE.has(url) ? STORE.get(url) : { paths: new Set() }
  if (!STORE.has(url)) {
    STORE.set(url, components)
  }

  // @ts-ignore
  const l10n: AnalisysLocalization = STORE2.has(url)
    ? STORE2.get(url)
    : { url, components: new Map(), detecting: new Map() }
  console.log('/ get', l10n)

  const keys = await getResourceKeys([...components.paths])

  // @ts-ignore
  const data = l10n.screenshot ? l10n.screenshot : await screenshot(url)
  if (data) {
    l10n.screenshot = data
    const result = l10n.recoganize
      ? l10n.recoganize
      : (await recognize(data)).data
    // console.log(d)
    l10n.recoganize = result
    if (!l10n.detecting) {
      detectWithDevTools(l10n, result)
    }
    console.log('detect', l10n.detecting)
    // serializeDetecting(l10n)
  }

  res.status(200).json({
    url,
    keys,
    paths: [...components.paths],
    screenshot: components.screenshot,
    recognize: components.recognize,
    detecting: [...l10n.detecting!.values()],
    notyet: [...l10n.notyet!.values()]
  })
})

app.post('/', async (req, res) => {
  const {
    url,
    meta,
    added,
    removed,
    locale,
    /* screenshot, */ timestamp,
    devtools,
    text
  } = req.body
  // console.log('post /', req.url, locale, devtools)
  console.log(
    'post /',
    url,
    devtools && devtools.length ? 'devtools exist' : 'devtools none'
  )

  const components = STORE.get(url) || { paths: new Set() }
  STORE.set(url, components)

  meta && setComponentPath(meta, components)
  added && setComponentPath(added, components)
  removed && setComponentPath(removed, components)

  const l10n: AnalisysLocalization = STORE2.get(url) || {
    url,
    components: new Map()
  }
  analysysDevTools(l10n, devtools || [])

  const data = await screenshot(url)
  if (data) {
    components.screenshot = data
    l10n.screenshot = data

    const d = await recognize(data)
    // console.log(d)
    components.recognize = d.data
    l10n.recoganize = d.data
    detectWithDevTools(l10n, d.data)
    // console.log('detect', l10n.detecting)
    // serializeDetecting(l10n)
  }

  if (!STORE2.has(url)) {
    STORE2.set(url, l10n)
  }

  res.status(200).json({
    url,
    DOMText: text,
    paths: [...components.paths],
    screenshot: components.screenshot,
    recognize: components.recognize,
    detecting: [...l10n.detecting!.values()],
    notyet: [...l10n.notyet!.values()]
  })
})

app.listen(PORT, () => {
  console.log(
    `backend for dev clawler listening at ${chalk.cyan(
      `http://localhost:${PORT}`
    )}`
  )
})
