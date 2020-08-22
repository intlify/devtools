import { build } from 'vite'
import { resolve, parse, basename } from 'path'
import { promises as fs } from 'fs'
import rimraf from 'rimraf'
import { OutputChunk } from 'rollup'
;(async () => {
  try {
    const entries = await fs.readdir(resolve(__dirname, '../src'))
    const chunks: OutputChunk[] = []

    for (const entry of entries) {
      const { name } = parse(entry)
      const result = await build({
        outDir: resolve(__dirname, '../build'),
        emitAssets: false,
        rollupInputOptions: {
          input: resolve(__dirname, `../src/${entry}`)
        },
        rollupOutputOptions: {
          entryFileNames: `${name}.js`
        }
      })
      for (const asset of result.assets) {
        const chunk = asset as OutputChunk
        if (chunk.isEntry && chunk.type === 'chunk') {
          chunks.push(chunk)
        }
      }
    }

    for (const chunk of chunks) {
      const filePath = resolve(__dirname, `../build/${chunk.fileName}`)
      let code = chunk.code
      if (chunk.map) {
        code += `\n//# sourceMappingURL=${basename(filePath)}.map`
      }
      await fs.writeFile(filePath, code)
    }

    rimraf.sync(resolve(__dirname, '../build/_assets'))
  } catch (e) {
    console.error(e)
  }
})()
