const requireUncached = require('require-uncached')

require('chai').should()
const sinon = require('sinon')
const nock = require('nock')

const orders = require('./fixtures/orders')
const login = require('./fixtures/login')
const instruments = require('./fixtures/instruments')
const output = require('./fixtures/output.csv')

const main = require('../lib/main')
const utils = require('../lib/utils')

const mockAuth = {
  username: 'foo',
  password: 'bar'
}

const argvBackup = Array(...process.argv)

describe('Binary', () => {
  let scope

  beforeEach(() => {
    scope = nock('https://api.robinhood.com')

    scope
      .post('/api-token-auth/', mockAuth)
      .reply(200, login)

      .get('/orders/')
      .query({ cursor: '' })
      .reply(200, orders[0])

      .get('/orders/')
      .query({ cursor: 'zero' })
      .reply(200, orders[0])

      .get('/orders/')
      .query({ cursor: 'one' })
      .reply(200, orders[1])

      .get(/\/instruments\/.+/)
      .reply(200, (uri) => instruments[utils.pluckLastOfPath(uri)])
      .persist()
  })

  afterEach(() => {
    nock.cleanAll()
    process.argv = Array(...argvBackup)
  })

  it('imports main lib', () => {
    main.should.be.ok
  })

  describe('arguments', () => {
    beforeEach(() => {
      sinon.stub(main, 'printCsv')
      sinon.spy(main, 'login')
      process.argv = ['node', 'robinhood-to-csv.js']
      process.argv.push('--username', 'foo')
      process.argv.push('--password', 'bar')
    })

    afterEach(() => {
      main.printCsv.restore()
      main.login.restore()
    })

    describe('username', () => {
      it('is accepted in long form', (done) => {
        requireUncached('../bin/robinhood-to-csv').then(() => {
          main.login.calledWithMatch({ username: 'foo' }).should.be.true
          done()
        })
      })
    })

    describe('password', () => {
      it('is accepted in long form', (done) => {
        requireUncached('../bin/robinhood-to-csv').then(() => {
          main.login.calledWithMatch({ password: 'bar' }).should.be.true
          done()
        })
      })
    })
  })

  describe('output', () => {
    beforeEach(() => {
      sinon.stub(main, 'printCsv')
      process.argv = ['node', 'robinhood-to-csv.js']
      process.argv.push('--username', 'foo')
      process.argv.push('--password', 'bar')
    })

    afterEach(() => { main.printCsv.restore() })

    it('prints csv to stdout', (done) => {
      requireUncached('../bin/robinhood-to-csv').then(() => {
        main.printCsv.calledWith(output).should.be.true
        done()
      })
    })
  })
})
