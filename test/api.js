const chai = require('chai')
chai.use(require('chai-things'))
chai.should()

const nock = require('nock')

const orders = require('./fixtures/orders')
const login = require('./fixtures/login')
const instruments = require('./fixtures/instruments')

const API = require('../lib/api')
const utils = require('../lib/utils')

const mockAuth = {
  username: 'foo',
  password: 'bar'
}

const realAuth = {
  username: process.env.ROBINHOOD_USERNAME,
  password: process.env.ROBINHOOD_PASSWORD
}

describe('Robinhood API', () => {
  let api
  beforeEach(() => { api = new API })

  describe('Library', () => {
    const PUBLIC_METHODS = [
      'orders',
      'login',
      'loggedIn',
      'instrument'
    ]

    it('is importable', () => {
      api.should.be.ok
    })

    PUBLIC_METHODS.forEach((methodName) => {
      it(`has "${methodName}" method`, () => {
        api.should.have.property(methodName).that.is.a('function')
      })
    })
  })

  describe('Method', () => {
    let scope
    before(() => { scope = nock('https://api.robinhood.com') })
    after(() => { nock.cleanAll() })

    describe('login', () => {
      beforeEach(() => {
        scope
          .post('/api-token-auth/', mockAuth)
          .reply(200, login)
      })

      it('returns promise', () => {
        api.login(mockAuth).should.be.a('promise')
      })

      it('hits the robinhood route', (done) => {
        api.login(mockAuth).then(() => {
          done()
        })
      })

      it('returns login response', (done) => {
        api.login(mockAuth).then((response) => {
          response.should.eql(login)
          done()
        })
      })

      it('becomes a logged-in instance', (done) => {
        api.login(mockAuth).then(() => {
          api.loggedIn().should.be.true
          done()
        })
      })
    })

    describe('loggedIn', () => {
      beforeEach(() => {
        scope
          .post('/api-token-auth/', mockAuth)
          .reply(200, login)
      })

      it('is true when the user has logged in', (done) => {
        api.login(mockAuth).then(() => {
          api.loggedIn().should.be.true
          done()
        })
      })

      it('is false when the user has not logged in', (done) => {
        api.loggedIn().should.be.false
        done()
      })
    })

    describe('orders', () => {
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

      it('returns promise', () => {
        api.orders().should.be.a('promise')
      })

      it('hits the robinhood route', (done) => {
        api.orders().then(() => {
          done()
        })
      })

      it('includes the auth token')

      it('returns orders response', (done) => {
        api.orders().then((response) => {
          response.should.eql(orders[0])
          done()
        })
      })

      describe('with multiple pages', () => {
        it('defaults to the first page')

        it('returns the next page number', (done) => {
          api.orders('zero').then((response) => {
            response.should.have.property('next')
            response.next.should.eql('one')
            response.should.eql(orders[0])
            done()
          })
        })

        it('returns the next page', (done) => {
          api.orders('one').then((response) => {
            response.should.have.property('previous')
            response.previous.should.eql('zero')
            response.should.eql(orders[1])
            done()
          })
        })
      })
    })

    describe('instrument', () => {
      const instrumentHash = '00000000-0000-0000-0000-000000000000'

      beforeEach(() => {
        scope
        .get(/\/instruments\/.+/)
        .reply(200, (uri) => instruments[utils.pluckLastOfPath(uri)])
        .persist()
      })

      it('returns promise', () => {
        api.instrument(instrumentHash).should.be.a('promise')
      })

      it('hits the robinhood route', (done) => {
        api.instrument(instrumentHash).then(() => {
          done()
        })
      })

      it('includes the auth token')

      it('returns instrument response', (done) => {
        api.instrument(instrumentHash).then((response) => {
          response.should.eql(instruments[instrumentHash])
          done()
        })
      })
    })
  })

  if (realAuth.username && realAuth.password) {
    describe('Robinhood @real-api Responses', () => {
      describe('Login', () => {
        it('matches expected schema', (done) => {
          api.login(realAuth)
            .then((response) => {
              response.should.have.property('token').that.is.a('string')
              done()
            })
            .catch((err) => done(new Error(`${err.status}: ${err.statusText}`)))
        })
      })

      describe('Orders', () => {
        let realOrders

        before((done) => {
          api.login(realAuth)
            .then(api.orders)
            .then((response) => {
              realOrders = response
              done()
            })
            .catch((err) => done(new Error(`${err.status}: ${err.statusText}`)))
        })

        it('matches expected schema', () => {
          realOrders.should.have.property('previous')
          realOrders.should.have.property('next')
          realOrders.should.have.property('results')

          realOrders.results.should.be.an('array')
            .that.all.have.property('instrument').and
            .that.all.have.property('fees').and
            .that.all.have.property('side').and
            .that.all.have.property('executions')

          realOrders.results.forEach((result) => {
            result.executions.should.be.an('array')
              .that.all.have.property('quantity').and
              .that.all.have.property('price').and
              .that.all.have.property('timestamp')
          })
        })
      })

      describe('Instrument', () => {
        let realInstrument

        before((done) => {
          api.login(realAuth)
            .then(api.orders)
            .then((response) => api.instrument(utils.pluckLastOfPath(response.results[0].instrument)))
            .then((response) => {
              realInstrument = response
              done()
            })
            .catch((err) => done(new Error(`${err.status}: ${err.statusText}`)))
        })

        it('matches expected schema', () => {
          realInstrument.should.have.property('symbol').that.is.a('string')
        })
      })
    })
  }
})
