const R        = require('ramda')
const Bluebird = require('bluebird')
const urarse   = require('urarse')
const assert   = require('assert')
const Status   = require('./lib/status.js')


function run(router, message) {

  return Bluebird.resolve(
    router.route(message.command)( message, Status )
  )
}


function CommandListener(event_source, handler) {

  assert.ok(R.is(Object, event_source), 'event_source is required')

  assert.ok(
    R.is(Function, event_source.listen)
  , 'event_source must have a "listen" function'
  )

  assert.ok(
    R.equals('function', typeof handler)
  , 'handler must be a function'
  )

  return event_source.listen((message) =>
    Bluebird.resolve(handler(message, Status)).then((status) =>
      event_source.ack(message, status))
  )

}


module.exports = CommandListener
