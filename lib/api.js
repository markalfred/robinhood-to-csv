const axios = require('axios')

class API {
  constructor () {
    this.api = axios.create({ baseURL: 'https://api.robinhood.com/' })
  }

  login (auth) {
    return this.api.post('api-token-auth/', auth, { headers: { authorization: null } })
      .then((response) => {
        Object.assign(this.api.defaults, { headers: { authorization: `Token ${response.data.token}` } })
        return response.data
      })
  }

  loggedIn () {
    if (this.api.defaults.headers && this.api.defaults.headers.authorization) { return true }
    return false
  }

  orders (cursor = 0) {
    return this.api
      .get('orders/', { params: { cursor } })
      .then((response) => response.data)
  }

  instrument (instrumentHash) {
    return this.api
      .get('instruments/' + instrumentHash)
      .then((response) => response.data)
  }
}

module.exports = API
