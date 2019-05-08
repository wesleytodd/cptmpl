'use strict'
const assert = require('assert')
const path = require('path')
const fs = require('fs-extra')
const { describe, it, beforeEach } = require('mocha')
const cptmpl = require('../')
const FIX_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(FIX_DIR, 'tmp')

describe('cptmpl', function () {
  beforeEach(() => fs.remove(TMP_DIR))

  it('should copy a template file', async function () {
    await cptmpl(path.join(FIX_DIR, 'foo.md'), path.join(TMP_DIR, 'bar.md'), {
      name: 'world'
    })

    // Ensure the right files are created
    assert(await fs.pathExists(path.join(TMP_DIR, 'bar.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'bar.md')).includes('Hello world!'))
  })

  it('should copy a directory of templates recursivly', async function () {
    // Create empty dir since git wont let us check it in
    await fs.ensureDir(path.join(FIX_DIR, 'dir', 'empty'))

    await cptmpl.recursive(path.join(FIX_DIR, 'dir'), TMP_DIR, {
      name: 'world'
    })

    // Ensure the right files are created
    assert(await fs.pathExists(path.join(TMP_DIR, 'empty')))

    assert(await fs.pathExists(path.join(TMP_DIR, 'bin/foo')))

    assert(await fs.pathExists(path.join(TMP_DIR, 'foo.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'foo.md')).includes('Hello world!'))

    assert(await fs.pathExists(path.join(TMP_DIR, 'bar/bar.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'bar/bar.md')).includes('Hello world!'))
  })

  it('should refuse to copy recursivly on a file', function (done) {
    cptmpl.recursive(path.join(FIX_DIR, 'foo.md'), TMP_DIR, {
      name: 'world'
    }).catch((err) => {
      assert.strictEqual(err.code, 'ENOTDIR')
      done()
    })
  })

  it('should allow modifying the destination filename', async function () {
    await cptmpl(path.join(FIX_DIR, 'foo.md'), path.join(TMP_DIR, 'bar.md'), {
      name: 'other'
    }, {
      processTemplateFilenames: (dest, data) => {
        return path.join(TMP_DIR, 'other.md')
      }
    })
    assert(await fs.pathExists(path.join(TMP_DIR, 'other.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'other.md')).includes('Hello other!'))

    await cptmpl.recursive(path.join(FIX_DIR, 'dir'), TMP_DIR, {
      name: 'otherdir'
    }, {
      processTemplateFilenames: (dest, data) => {
        if (dest === path.join(TMP_DIR, 'bar', 'bar.md')) {
          return path.join(TMP_DIR, 'bar', data.name + '.md')
        }
        return dest
      }
    })
    assert(await fs.pathExists(path.join(TMP_DIR, 'bar', 'otherdir.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'bar', 'otherdir.md')).includes('Hello otherdir!'))
  })

  it('should support ejs includes', async function () {
    await cptmpl(path.join(FIX_DIR, 'include.md'), path.join(TMP_DIR, 'include.md'), {
      name: 'include'
    })
    assert(await fs.pathExists(path.join(TMP_DIR, 'include.md')))
    assert(await fs.readFileSync(path.join(TMP_DIR, 'include.md')).includes('Hello include!'))
  })
})
