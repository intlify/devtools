import { promises as fs } from 'fs'
import express, { json, urlencoded } from 'express'
import chalk from 'chalk'
import { config as dotEnvConfig } from 'dotenv'
import {
  generateSecret,
  decrypt,
  getResourceKeys as getResourceI18nKeys
} from '@intlify-devtools/shared'
import { screenshot, detect } from './utils'

const LOCAL_ENV = dotEnvConfig({ path: './.env.local' }).parsed || {}
// @ts-ignore
const SECRET =
  LOCAL_ENV.INTLIFY_META_SECRET ||
  process.env.INTLIFY_META_SECRET ||
  generateSecret()
const PORT = process.env.PORT || 4000

const STORE = new Map()

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

function setComponentPath(paths: string[], components: { paths: Set<string> }) {
  paths.forEach(p => {
    const [iv, encrypedData] = p.split('$')
    const componentPath = decrypt(SECRET, iv, encrypedData)
    console.log('path', componentPath)
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

app.get('/', async (req, res) => {
  console.log('req.query', req.query)
  const { url } = req.query

  const components = STORE.has(url) ? STORE.get(url) : { paths: new Set() }
  if (!STORE.has(url)) {
    STORE.set(url, components)
  }

  const keys = await getResourceKeys([...components.paths])

  res.status(200).json({
    url,
    keys,
    paths: [...components.paths],
    screenshot: components.screenshot,
    detect: components.detect
  })
})

app.post('/', async (req, res) => {
  const {
    url,
    meta,
    added,
    removed,
    /* screenshot, */ timestamp,
    text
  } = req.body

  const components = STORE.get(url) || { paths: new Set() }
  STORE.set(url, components)

  meta && setComponentPath(meta, components)
  added && setComponentPath(added, components)
  removed && setComponentPath(removed, components)

  const data = await screenshot(url)
  if (data) {
    components.screenshot = data
    const d = await detect(data)
    // console.log(d)
    components.detect = d.data
  }

  res.status(200).json({
    url,
    DOMText: text,
    paths: [...components.paths],
    screenshot: components.screenshot,
    detect: components.detect
  })
})

app.listen(PORT, () => {
  console.log(
    `backend for dev clawler listening at ${chalk.cyan(
      `http://localhost:${PORT}`
    )}`
  )
})
