const axios = require('axios')
const api = axios.create({ baseURL: 'https://api.robinhood.com/' })

module.exports = {
  login: (auth) => {
    return api.post('api-token-auth/', auth, { headers: { authorization: null } })
      .then((response) => {
        Object.assign(api.defaults, { headers: { authorization: `Token ${response.data.token}` } })
        return response.data
      })
  },

  loggedIn: () => {
    if (api.defaults.headers.authorization) { return true }
    return false
  },

  orders: () => {
    return api
      .get('orders/')
      .then((response) => response.data)
  },

  instrument: (instrumentHash) => {
    return api
      .get('instruments/' + instrumentHash)
      .then((response) => response.data)
  }
}
