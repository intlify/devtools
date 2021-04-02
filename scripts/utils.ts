import { promises as fs } from 'fs'
import chalk from 'chalk'

export const targets = async () => {
  const packages = await fs.readdir('packages')
  return packages.filter(async (f) => {
    const stat = await fs.stat(`packages/${f}`)
    if (!stat.isDirectory()) {
      return false
    }
    const pkg = await import(`../packages/${f}/package.json`)
    // return !pkg.private
    return true
  })
}

export const fuzzyMatchTarget = async (partialTargets: string[], includeAllMatching) => {
  const matched: string[] = []
  const _targets = await targets()
  partialTargets.forEach(partialTarget => {
    for (const target of _targets) {
      if (target.match(partialTarget)) {
        matched.push(target)
        if (!includeAllMatching) {
          break
        }
      }
    }
  })

  if (matched.length) {
    return matched
  } else {
    console.log()
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `Target ${chalk.underline(partialTargets)} not found!`
      )}`
    )
    console.log()

    process.exit(1)
  }
}
