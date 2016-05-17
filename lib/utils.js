module.exports = {
  pluckLastOfPath: (path) => {
    let reversed = path.split('/').reverse()
    return reversed[0] || reversed[1]
  },

  formatCurrency: (floatString) => {
    return parseFloat(floatString).toFixed(2)
  }
}
