const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const { generateSecret } = require('@intlify-devtools/shared')

;(async () => {
  const secret = generateSecret()
  await fs.writeFile(path.resolve(__dirname, '../packages/clawler/.env.local'), `INTLIFY_META_SECRET=${secret}`, 'utf-8')
  console.log(chalk.bold.green('generate intlify meta secret!'))
})()
