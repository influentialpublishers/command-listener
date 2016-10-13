
const R      = require('ramda')
const Status = require('../../../lib/status.js')


const success = (e, p) => ({ status: Status.SUCCESS })


module.exports = {
  success
}
