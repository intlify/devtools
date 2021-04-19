import { promises as fs } from 'fs'
import fetch from 'node-fetch'
// import FormData from 'form-data'
import { FormData } from 'formdata-node'
import Blob from 'fetch-blob'
import { Configuration, KeysApi, ProjectsApi, LocalesApi, UploadsApi } from 'phrase-js'
import { config as dotEnvConfig } from 'dotenv'

import type { Project, Locale } from 'phrase-js'

const globalAny: any = global
globalAny.window = { fetch }
globalAny.Blob = Blob
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
  info.conf = new Configuration({ apiKey: `token ${LOCAL_ENV['PHRASE_API_TOKEN']}` })
  const project = new ProjectsApi(info.conf)
  const projects = await project.projectsList({ page: 1, perPage: 25 })
  info.project = projects[0]
  const locales = await getLocales(info)
  info.locale = locales.find(l => l.code! == 'en-US')
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

export async function uploadResource(info: PhraseInfo, filepath: string) {
  const uploadAPI = new UploadsApi(info.conf)
  const buffer = await fs.readFile(filepath)
  // const blob = Uint8Array.from(buffer).buffer
  const blob = new Blob([Uint8Array.from(buffer).buffer], { type: 'text/plain'})
  console.log('blog', await blob.text())
  let ret = {}
  try {
    ret = await uploadAPI.uploadCreate({
        projectId: info.project.id!,
        fileFormat: 'json',
        file: blob as any,
        localeId: info.locale!.id!
    })
  } catch (e) {
    console.error(e)
  }
}