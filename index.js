'use strict'
const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')
const inquirer = require('inquirer')
const diff = require('diff')
const chalk = require('chalk')
const readdir = require('recursive-readdir')

const cptmpl = module.exports = async function cptmpl (_src, _dest, data = {}, opts = {}) {
  const { mode, force } = opts
  const handleConflicts = opts.handleConflicts || defaultHandleConflicts

  const src = path.resolve(_src)

  // Process dest filename
  let dest = _dest
  if (typeof opts.processTemplateFilenames === 'function') {
    dest = opts.processTemplateFilenames(dest, data)
  }
  dest = path.resolve(dest)

  const content = await fs.readFile(src, { encoding: 'utf8' })
  const rendered = ejs.render(content, data, {
    filename: src
  })

  // If we are not forcing, check for conflicts
  if (force !== true) {
    const shouldContinue = await handleConflicts(dest, rendered)
    if (!shouldContinue) {
      return
    }
  }

  await fs.ensureDir(path.dirname(dest))
  await fs.writeFile(dest, rendered, { mode })
}

module.exports.recursive = async function cptmplr (_src, _dest, data = {}, opts = {}) {
  const filesWithStats = {}
  await readdir(_src, [(file, stats) => {
    filesWithStats[file] = stats
  }])

  for (let file of Object.keys(filesWithStats)) {
    // Process dest filename
    let dest = path.join(_dest, path.relative(_src, file))
    if (typeof opts.processTemplateFilenames === 'function') {
      dest = opts.processTemplateFilenames(dest, data)
    }

    // Make directories
    const stats = filesWithStats[file]
    if (stats.isDirectory()) {
      await fs.ensureDir(dest, opts.mode || getFileMode(stats.mode))
      continue
    }

    // Copy template files
    await cptmpl(file, dest, data, {
      mode: opts.mode || getFileMode(stats.mode),
      force: opts.force,
      handleConflicts: opts.handleConflicts
    })
  }
}

// Detect file conflict
async function defaultHandleConflicts (dest, contents) {
  if (!await fs.exists(dest)) return true
  if ((await fs.stat(dest)).isDirectory()) return true

  const existing = await fs.readFile(path.resolve(dest))
  if (!(contents instanceof Buffer)) {
    contents = Buffer.from(contents || '', 'utf8')
  }

  const isConflicting = existing.toString('hex') !== contents.toString('hex')
  if (!isConflicting) {
    return true
  }

  // How to resolve?
  return promptConflict(dest, existing, contents)
}

async function promptConflict (dest, existing, contents) {
  const { whatToDo } = await inquirer.prompt({
    type: 'expand',
    name: 'whatToDo',
    message: `Conflict in ${path.basename(dest)}, overwrite?`,
    choices: [{
      key: 'y',
      name: 'Yes'
    }, {
      key: 'n',
      name: 'No'
    }, {
      key: 'd',
      name: 'Diff'
    }]
  })

  switch (whatToDo) {
    case 'Yes':
      return true
    case 'No':
      return false
    case 'Diff':
      displayDiff(existing, contents)
      return promptConflict(dest, existing, contents)
  }
}

function displayDiff (existing, contents) {
  process.stderr.write('\n')
  diff.diffLines(existing.toString('utf8'), contents.toString('utf8'))
    .forEach((part) => {
      // color and prefix
      let color = chalk.grey
      let prefix = '   '
      if (part.added) {
        color = chalk.green
        prefix = ' + '
      } else if (part.removed) {
        color = chalk.red
        prefix = ' - '
      }

      process.stderr.write(color(prefix + part.value))
    })
  process.stderr.write('\n')
}

function getFileMode (mode) {
  return '0' + (mode & parseInt('777', 8)).toString(8)
}
