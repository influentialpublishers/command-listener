
const R      = require('ramda')
const Status = require('../../../lib/status.js')


const success  = (e, p) => ({ status: Status.SUCCESS })


const requeue  = (e, p) => ({ status: Status.REQUEUE })


const priority = (e, p) => ({ status: Status.PRIORITY_REQUEUE })


const failed   = (e, p) => ({ status: Status.FAILED })


module.exports = {
  success
, requeue
, priority
, failed
}
