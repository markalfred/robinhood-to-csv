const converter = require('json-2-csv')
const prompt = require('prompt')
prompt.message = prompt.delimeter = ''

const API = require('./api')
const api = new API
const utils = require('./utils')

let executions = []

module.exports = {
  login: (options = {}) => {
    let username = options.username
    let password = options.password
    return new Promise((resolve, reject) => {
      if (username && password) {
        resolve(api.login({ username, password }))
      } else {
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
            resolve(api.login({ username: res.username, password: res.password }))
          }
        })
      }
    })
  },

  getOrders: () => {
    return api.orders()
  },

  getSymbols: (orders) => {
    return Promise.all(
      orders.results.map(order =>
        api.instrument(utils.pluckLastOfPath(order.instrument))
          .then(symbol => {
            order.symbol = symbol.symbol
            return order
          })
      )
    )
  },

  getExecutions: (orders) => {
    orders.forEach(order =>
      order.executions.forEach(execution =>
        executions.push({
          symbol: order.symbol,
          shares: execution.quantity,
          price: utils.formatCurrency(execution.price),
          transaction_type: order.side,
          commission: utils.formatCurrency(order.fees),
          date_executed: execution.timestamp
        })
      )
    )
    return executions
  },

  convertToCsv: (transactions) => {
    return new Promise((resolve, reject) =>
      converter.json2csv(transactions, (err, csv) => {
        if (err) {
          reject(err)
        } else {
          console.log(csv)
          resolve(csv)
        }
      })
    )
  }
}
