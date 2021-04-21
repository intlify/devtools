import { default as _fs, promises as fs } from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { Configuration, KeysApi, ProjectsApi, LocalesApi, UploadsApi, ScreenshotsApi, ScreenshotMarkersApi } from 'phrase-js'
import { config as dotEnvConfig } from 'dotenv'

import type { Project, Locale } from 'phrase-js'
import type { AnalisysLocalization } from './index'

const globalAny: any = global
globalAny.window = { fetch }
globalAny.fetch = fetch
globalAny.FormData = FormData
globalAny.atob = (a: string) => Buffer.from(a, 'base64').toString('binary')
globalAny.btoa = (b: ArrayBuffer | SharedArrayBuffer) => Buffer.from(b).toString('base64')

const LOCAL_ENV = dotEnvConfig({ path: './.env.local' }).parsed || {}

export type PhraseInfo = {
  conf: Configuration
  project: Project
  locale?: Locale
}

export async function getPhraseInfo() {
  let info = {} as PhraseInfo
  info.conf = new Configuration({ apiKey: `Bearer ${LOCAL_ENV['PHRASE_API_TOKEN']}` })
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

export async function uploadScreenshot(info: PhraseInfo, l10n: AnalisysLocalization, filepath: string) {
  const screenshotAPI = new ScreenshotsApi(info.conf)
  try {
    const screenshot = await screenshotAPI.screenshotCreate({
      projectId: info.project.id!,
      screenshotCreateParameters: {
        name: l10n.url,
        description: l10n.url,
        filename: _fs.createWriteStream(filepath) as any
      }
    })
  } catch (e) {
    console.error(e)
  }
}