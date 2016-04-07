#!/usr/bin/env node
var robinhood = require('robinhood')
var prompt = require('prompt')
var converter = require('json-2-csv')

var R
var executions = []

function login () {
  return new Promise((resolve, reject) => {
    prompt.message = prompt.delimeter = ''
    prompt.start()
    prompt.get({
      properties: {
        username: { default: process.env.ROBINHOOD_USERNAME, required: true },
        password: { default: process.env.ROBINHOOD_PASSWORD, required: true, hidden: true }
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      } else {
        R = robinhood({ username: res.username, password: res.password }, resolve)
      }
    })
  })
}

function getOrders () {
  return new Promise((resolve, reject) =>
    R.orders((err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body.results)
      }
    })
  )
}

function getSymbols (orders) {
  return Promise.all(
    orders.map(order =>
      getSymbol(pluckLastOfPath(order.instrument)).then(symbol => {
        order.symbol = symbol
        return order
      })
    )
  )
}

function getSymbol (instrumentHash) {
  return new Promise((resolve, reject) =>
    R.reverse_instrument(instrumentHash, (err, res, instrument) => {
      if (err) {
        reject(err)
      } else {
        resolve(instrument.symbol)
      }
    })
  )
}

function getExecutions (orders) {
  orders.forEach(order =>
    order.executions.forEach(execution =>
      executions.push({
        symbol: order.symbol,
        shares: execution.quantity,
        price: formatCurrency(execution.price),
        transaction_type: order.side,
        commission: formatCurrency(order.fees),
        date_executed: execution.timestamp
      })
    )
  )
  return executions
}

function convertToCsv (transactions) {
  converter.json2csv(transactions, (err, csv) => {
    console.log('\n  Et voila.  \n')
    console.log(csv)
  })
}

function pluckLastOfPath (path) {
  var reversed = path.split('/').reverse()
  return reversed[0] || reversed[1]
}

function formatCurrency (floatString) {
  return parseFloat(floatString).toFixed(2)
}

login()
.then(getOrders)
.then(getSymbols)
.then(getExecutions)
.then(convertToCsv)
.catch(err => { console.error(err); process.exit(1) })
