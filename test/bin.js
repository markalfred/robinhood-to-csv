require('chai').should()
const sinon = require('sinon')
const nock = require('nock')

const orders = require('./fixtures/orders')
const login = require('./fixtures/login')
const instruments = require('./fixtures/instruments')

const main = require('../lib/main')
const utils = require('../lib/utils')

const mockAuth = {
  username: 'foo',
  password: 'bar'
}

describe('Binary', () => {
  let scope

  before(() => { scope = nock('https://api.robinhood.com') })
  after(() => { nock.cleanAll() })

  beforeEach(() => {
    scope
      .post('/api-token-auth/', mockAuth)
      .reply(200, login)

      .get('/orders/')
      .query(true)
      .reply(200, orders)

      .get(/\/instruments\/.+/)
      .reply(200, (uri) => instruments[utils.pluckLastOfPath(uri)])
      .persist()
  })

  it('imports main lib', () => {
    main.should.be.ok
  })

  it('accepts arguments')

  describe('output', () => {
    let spy

    beforeEach(() => { spy = sinon.stub(console, 'log') })
    afterEach(() => { spy.restore() })

    it('prints csv to stdout', (done) => {
      if (process.argv.indexOf('--username') === -1) {
        process.argv.push('--username', 'foo')
      }

      if (process.argv.indexOf('--password') === -1) {
        process.argv.push('--password', 'bar')
      }

      require('../bin/robinhood-to-csv').then(() => {
        spy.called.should.be.true
        done()
      })
    })
  })
})
