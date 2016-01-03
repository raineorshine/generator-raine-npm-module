#! /usr/bin/env node

var com = require('commander')
var stdin = require('get-stdin-promise')
var pkg = require('./package.json')

var extendedHelp = [
  '',
  '',
  pkg.description,
  '',
  'Here is an example:',
  '$ blah blah blah'
].join('\n  ')

com
  .version(pkg.version)
  .usage(extendedHelp)
  .parse(process.argv)

stdin.then(function(input) {
    console.log('PROCESS INPUT HERE');
  })
 .then(null, console.log)

