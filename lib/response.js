
const R      = require('ramda')
const Status = require('./status.js')


function callEventSourceMethod(method) {
  return (event_source, msg, response) =>
    event_source[method](msg, response)
}


const StatusHandlers = {
  [Status.SUCCESS]          : callEventSourceMethod('success')
, [Status.REQUEUE]          : callEventSourceMethod('requeue')
, [Status.PRIORITY_REQUEUE] : callEventSourceMethod('priorityRequeue')
, [Status.FAILED]           : callEventSourceMethod('failed')
}


function throwUnknownStatus(status) {
  throw new Error(`Unknown Status: ${response}`)
}


function hasHandler(response) {
  return StatusHandlers.hasOwnProperty(response.status)
}


function runHandler(event_source, msg) {
  return (response) =>
    StatusHandlers[response.status](event_source, msg, response)
}


function ResponseHandler(event_source, msg) {
  return R.ifElse(
    hasHandler
  , runHandler(event_source, msg)
  , throwUnknownStatus
  )
}


module.exports = ResponseHandler
