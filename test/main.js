const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiThings = require('chai-things')
chai.use(sinonChai)
chai.use(chaiThings)
chai.should()

const nock = require('nock')
const prompt = require('prompt')

const orders = require('./fixtures/orders')
const instruments = require('./fixtures/instruments')
const executions = require('./fixtures/executions')

const main = require('../lib/main')
const utils = require('../lib/utils')

describe('Library', () => {
  const PUBLIC_METHODS = [
    'login',
    'getOrders',
    'getSymbols',
    'getExecutions',
    'convertToCsv'
  ]

  it('is importable', () => {
    main.should.be.ok
  })

  PUBLIC_METHODS.forEach((methodName) => {
    it(`has "${methodName}" method`, () => {
      main.should.have.property(methodName).that.is.a('function')
    })
  })
})

describe('Methods', () => {
  let scope

  before(() => { scope = nock('https://api.robinhood.com') })
  after(() => { nock.cleanAll() })

  describe('login', () => {
    let spies = {}
    const mockAuth = { username: 'foo', password: 'bar' }

    beforeEach(() => {
      scope
        .post('/api-token-auth/', mockAuth)
        .reply(200, { token: '000' })

      spies.start = sinon.spy(prompt, 'start')
      spies.get = sinon.spy(prompt, 'get')
    })

    afterEach(() => {
      spies.start.restore()
      spies.get.restore()
    })

    it('prompts for the username', () => {
      main.login()
      spies.start.should.have.been.called
      spies.get.should.have.been.called
      spies.get.should.have.been.calledWithMatch({ properties: { username: {} } })
    })

    it('prompts for the password', () => {
      main.login()
      spies.start.should.have.been.called
      spies.get.should.have.been.called
      spies.get.should.have.been.calledWithMatch({ properties: { password: {} } })
    })

    it('returns robinhood login promise', () => {
      main.login().should.be.a('promise')
    })

    it('results in a login token', (done) => {
      main.login(mockAuth).then((result) => {
        result.should.have.property('token')
        done()
      })
    })
  })

  describe('getOrders', () => {
    beforeEach(() => {
      scope
        .get('/orders/')
        .query({ cursor: '' })
        .reply(200, orders[0])

        .get('/orders/')
        .query({ cursor: 'zero' })
        .reply(200, orders[0])

        .get('/orders/')
        .query({ cursor: 'one' })
        .reply(200, orders[1])
    })

    it('returns the orders promise', () => {
      main.getOrders().should.be.a('promise')
    })

    it('results in orders', (done) => {
      main.getOrders()
        .then((response) => {
          response.should.deep.eql(orders.assembled)
          done()
        })
        .catch(done)
    })
  })

  describe('getSymbols', () => {
    beforeEach(() => {
      scope
        .get(/\/instruments\/.+/)
        .reply(200, (uri) => instruments[utils.pluckLastOfPath(uri)])
        .persist()
    })

    it('returns the symbols promise', () => {
      main.getSymbols([]).should.be.a('promise')
    })

    it('results in orders with symbols attached', (done) => {
      main.getSymbols(orders.assembled)
        .then((result) => {
          result.should.be.an('array')
            .that.all.have.property('symbol')
          done()
        })
        .catch(done)
    })
  })

  describe('getExecutions', () => {
    it('returns the executions array', () => {
      main.getExecutions([]).should.be.an('array')
    })

    it('results in executions', () => {
      main.getExecutions(orders.withSymbols).should.deep.eql(executions)
    })

    it('includes symbol', () => {
      main.getExecutions(orders.withSymbols).should.all.have.property('symbol')
    })

    it('includes transaction type', () => {
      main.getExecutions(orders.withSymbols).should.all.have.property('transaction_type')
    })

    it('includes formatted price', () => {
      main.getExecutions(orders.withSymbols).should.all.have.property('price')
    })

    it('incluses formatted commission', () => {
      main.getExecutions(orders.withSymbols).should.all.have.property('commission')
    })
  })

  describe('convertToCsv', () => {
    let spy
    beforeEach(() => { spy = sinon.spy(console, 'log') })
    afterEach(() => { spy.restore() })

    it('returns the csv promise', () => {
      main.convertToCsv([]).should.be.a('promise')
    })

    it('rejects bad csv data', (done) => {
      main.convertToCsv('foo')
        .then(() => done(new Error('This should have failed.')))
        .catch(() => done())
    })

    it('prints csv to stdout', (done) => {
      main.convertToCsv(executions).then(() => {
        spy.should.have.been.called
        done()
      })
    })
  })
})
