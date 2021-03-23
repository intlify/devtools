import express, { json, urlencoded } from 'express'
import chalk from 'chalk'
import { config as dotEnvConfig } from 'dotenv'
import { generateSecret, decrypt } from '@intlify-devtools/shared'
import path from 'path'

const LOCAL_ENV = dotEnvConfig({ path: './.env.local' }).parsed || {}
// @ts-ignore
const SECRET = LOCAL_ENV.INTLIFY_META_SECRET || process.env.INTLIFY_META_SECRET || generateSecret()
const PORT = process.env.PORT || 4000

const STORE = new Map()

const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))
app.use((req, res, next) => { // for CORS
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

function setComponentPath(paths, components) {
  paths.forEach(p => {
    const [iv, encrypedData] = p.split('$')
    const componentPath = decrypt(SECRET, iv, encrypedData)
    console.log('path', componentPath)
    components.paths.add(componentPath)
  })
}

app.get('/', (req, res) => {
  console.log('req.query', req.query)
  const { url } = req.query

  const components = STORE.get(url) || { paths: new Set() }
  res.status(200).json({
    url,
    paths: [...components.paths],
    screenshot: components.screenshot
  })
})

app.post('/', (req, res) => {
  const { url, meta, added, removed, screenshot, timestamp } = req.body

  const components = STORE.get(url) || { paths: new Set() }
  STORE.set(url, components)

  meta && setComponentPath(meta, components)
  added && setComponentPath(added, components)
  removed && setComponentPath(removed, components)

  if (screenshot) {
    components.screenshot = screenshot
  }

  res.status(200).json({
    url,
    paths: [...components.paths],
    screenshot
  })
})

app.listen(PORT, () => {
  console.log(`backend for dev clawler listening at ${chalk.cyan(`http://localhost:${PORT}`)}`)
})
