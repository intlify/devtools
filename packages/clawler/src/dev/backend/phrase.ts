import { default as _fs, promises as fs } from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import {
  Configuration,
  KeysApi,
  ProjectsApi,
  LocalesApi,
  UploadsApi,
  ScreenshotsApi,
  ScreenshotMarkersApi
} from 'phrase-js'
import { config as dotEnvConfig } from 'dotenv'

import type { Project, Locale, Screenshot } from 'phrase-js'
import type { AnalisysLocalization } from './index'

const globalAny: any = global
globalAny.window = { fetch }
globalAny.fetch = fetch
globalAny.FormData = FormData
globalAny.atob = (a: string) => Buffer.from(a, 'base64').toString('binary')
globalAny.btoa = (b: ArrayBuffer | SharedArrayBuffer) =>
  Buffer.from(b).toString('base64')

const LOCAL_ENV = dotEnvConfig({ path: './.env.local' }).parsed || {}

export type PhraseInfo = {
  conf: Configuration
  project: Project
  locale?: Locale
}

export async function getPhraseInfo() {
  const info = {} as PhraseInfo
  info.conf = new Configuration({
    apiKey: `Bearer ${LOCAL_ENV['PHRASE_API_TOKEN']}`
  })
  const project = new ProjectsApi(info.conf)
  const projects = await project.projectsList({ page: 1, perPage: 25 })
  info.project = projects[0]
  const locales = await getLocales(info)
  info.locale = locales.find(l => l.code! == 'en-US')
  // const formatAPI = await new FormatsApi(info.conf)
  // console.log(await formatAPI.formatsList({}))
  return info
}

export async function getKeys(info: PhraseInfo) {
  const keyAPI = new KeysApi(info.conf)
  return await keyAPI.keysList({ projectId: info.project.id! })
}

export async function getLocales(info: PhraseInfo) {
  const localesAPI = new LocalesApi(info.conf)
  return await localesAPI.localesList({ projectId: info.project.id! })
}

export async function uploadResources(info: PhraseInfo) {
  const uploadAPI = new UploadsApi(info.conf)
  return await uploadAPI.uploadsList({ projectId: info.project.id! })
}

export async function uploadResource(info: PhraseInfo, filepath: string) {
  const uploadAPI = new UploadsApi(info.conf)
  let ret = {}
  try {
    ret = await uploadAPI.uploadCreate({
      projectId: info.project.id!,
      localeId: info.locale!.id!,
      fileFormat: 'nested_json',
      file: _fs.createReadStream(filepath) as any // cannot work Blob ...
    })
  } catch (e) {
    console.error(e)
  }
}

export async function uploadScreenshot(
  info: PhraseInfo,
  l10n: AnalisysLocalization,
  filepath: string
) {
  try {
    console.log('url', l10n.url, filepath)
    const form = new FormData()
    // form.append('Content-Type', 'application/octet-stream')
    form.append('name', 'screenshot')
    form.append('description', l10n.url)
    form.append('filename', _fs.createReadStream(filepath))
    const headers = {
      Authorization: info.conf.apiKey!('Authorization')
    }
    const reqURL = `https://api.phrase.com/v2/projects/${info.project
      .id!}/screenshots`
    const req = await fetch(reqURL, {
      headers,
      method: 'POST',
      body: form
    })
    const screenshot = (await req.json()) as Screenshot
    console.log('upload screenshot data', screenshot)
    const keys = await getKeys(info)
    const detecting = [...l10n.detecting!.values()]
    const screenshotMarkersApi = new ScreenshotMarkersApi(info.conf)
    const getKey = (name: string) => keys.find(k => k.name! === name)
    for (const { lineOrWord, devtool } of detecting) {
      const key = getKey(devtool.key)
      if (key) {
        const ret = await screenshotMarkersApi.screenshotMarkerCreate({
          projectId: info.project.id!,
          screenshotId: screenshot.id!,
          screenshotMarkerCreateParameters: {
            keyId: key.id!,
            presentation: JSON.stringify({
              x: lineOrWord.bbox.x0,
              y: lineOrWord.bbox.y0,
              w: lineOrWord.bbox.x1 - lineOrWord.bbox.x0,
              h: lineOrWord.bbox.y1 - lineOrWord.bbox.y0
            })
          }
        })
        console.log('marker', key, ret)
      }
    }
    // NOTE: cannot work the below code ...
    // const screenshotAPI = new ScreenshotsApi(info.conf)
    // const screenshot = await screenshotAPI.screenshotCreate({
    //   projectId: info.project.id!,
    //   screenshotCreateParameters: {
    //     name: 'screenshot',
    //     description: 'desc', //l10n.url,
    //     filename: _fs.createReadStream(filepath) as any
    //   }
    // })
  } catch (e) {
    console.error(e, e.headers)
  }
}
