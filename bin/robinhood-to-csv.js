#!/usr/bin/env node

const pkg = require('../package.json')
const program = require('commander')

const main = require('../lib/main')

program
  .version(pkg.version)
  .option('-u, --username <username>', 'Robinhood login username')
  .option('-p, --password <password>', 'Robinhood login password')
  .option('-o, --output <file>', 'output filename (default: stdout)')
  .parse(process.argv)

const { username, password, output } = program

module.exports =
  main.login({ username, password })
    .then(main.getOrders)
    .then(main.getSymbols)
    .then(main.getExecutions)
    .then(main.convertToCsv)
    .then((result) => main.printCsv(result, output))
    .catch(err => {
      console.error(err) // eslint-disable-line no-console
      process.exit(1)
    })
