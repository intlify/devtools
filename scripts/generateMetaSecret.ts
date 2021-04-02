import { promises as fs } from 'fs'
import chalk from 'chalk'
import path from 'path'
import { generateSecret } from '@intlify-devtools/shared'

;(async () => {
  // @ts-ignore
  const secret = generateSecret()
  await fs.writeFile(
    path.resolve(__dirname, '../packages/clawler/.env.local'),
    `INTLIFY_META_SECRET=${secret}`,
    'utf-8'
  )
  console.log(chalk.bold.green('generate intlify meta secret!'))
})()
