import puppeteer from 'puppeteer'
import Tesseract from 'tesseract.js'

const headless = true
const slowMo = 10
const width = 1280
const height = 800
const args = [
  '--start-fullscreen',
  '--disable-infobars',
  '--incognito'
]

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

let capturing = false

export async function screenshot(url, ms=0) {
  let browser = null
  if (capturing) { return null }

  try {
    capturing = true
    browser = await puppeteer.launch({ headless, args })
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: 2 })
    await page.goto(url, { waitUntil: 'networkidle2' })
    if (ms > 0) {
      await delay(ms)
    }
    const data = await page.screenshot({ encoding: 'base64' })
    return `data:image/png;base64,${data}`
  } finally {
    if (browser) {
      browser.close()
    }
    capturing = false
  }
}

export async function detect(image) {
  const worker = await Tesseract.createWorker()
  await worker.load()
  await worker.loadLanguage('jpn+eng')
  await worker.initialize('jpn+eng')
  await worker.setParameters({
    // tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    preserve_interword_spaces: '1'
  })
  const data = await worker.recognize(image)
  await worker.terminate()
  return data
}