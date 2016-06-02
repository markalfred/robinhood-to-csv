#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));

const main = require('../lib/main')

module.exports =
  main.login(argv)
    .then(main.getOrders)
    .then(main.getSymbols)
    .then(main.getExecutions)
    .then(main.convertToCsv)
    .then(main.printToStdOut)
    .catch(err => { throw err })
