#!/usr/bin/env node

const pkg = require('../package.json')
const program = require('commander')

const main = require('../lib/main')

program
  .version(pkg.version)
  .option('-u, --username <username>', 'Username')
  .option('-p, --password <password>', 'Password')
  .parse(process.argv)

const { username, password } = program

module.exports =
  main.login({ username, password })
    .then(main.getOrders)
    .then(main.getSymbols)
    .then(main.getExecutions)
    .then(main.convertToCsv)
    .then(main.printToStdOut)
    .catch(err => { throw err })
