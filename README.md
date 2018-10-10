# Copy and process a template file

[![NPM Version](https://img.shields.io/npm/v/cptmpl//npmjs.org/package/cptmpl)
[![NPM Downloads](https://img.shields.io/npm/dm/cptmpl.svg)](https://npmjs.org/package/cptmpl)
[![Build Status](https://travis-ci.org/wesleytodd/cptmpl.svg?branch=master)](https://travis-ci.org/wesleytodd/cptmpl)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)

This small utility helps manage copying [EJS template](https://www.npmjs.com/package/ejs) files.
It has a programmatic and cli interface for simple usage whatever your context.

## Usage

```
$ npm i --save [--global] cptmpl
$ cptmpl --help

    Usage:
			cptmpl --src="<Source Template>" --dest="<Destination File>" --data="<Data As JSON>" [options]
			cptmpl <Source Template> <Destination File> <Data As JSON> [options]

    Options:

      -s, --src                   the source template
      -d, --dest                  the destination file
      -D, --data                  a JSON string of data for the template
      -f, --force                 force overwite file
      --mode                      the file permissions mode
      -V, --version               output the version number
      -V, --version               output the version number
      --help                      display this help

    Template Format:

      See (EJS Documentation)[https://www.npmjs.com/package/ejs].

      <% if (user) { %>
        <h2><%= user.name %></h2>
      <% } %>
```

```javascript
const cptmpl = require('cptmpl')

(async function () {
  await cptmpl('foo.md', 'bar.md', {
    name: 'world'
  }, {
    // Defaults shown
    force: false,
    mode: undefined,
    handleConflicts: <Default Handle Conflicts Function>
  })
})()
```

## Example Diff

```
$ cptmpl --src foo.md --dest bar.md --data='{"name": "world"}'
$ cptmpl --src foo.md --dest bar.md --data='{"name": "wes"}'
? Conflict in bar.md, overwrite? (yndH) d
>> Diff

   # This is my Template

 - Hello world!
 + Hello wes!

? Conflict in bar.md, overwrite? Yes
$ cat bar.md
# This is my Template

Hello wes!
```
