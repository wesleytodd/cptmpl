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
    assert(fs.pathExists(path.join(TMP_DIR, 'bar.md')))
    assert(fs.readFileSync(path.join(TMP_DIR, 'bar.md')).includes('Hello world!'))
  })
})
