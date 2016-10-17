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


function CommandListener({ route_map, event_source }) {

  assert.ok(R.is(Object, route_map), 'route_map is required')
  assert.ok(R.is(Object, event_source), 'event_source is required')

  assert.ok(
    R.is(Function, event_source.listen)
  , 'event_source must have a "listen" function'
  )

  const router = urarse.init(route_map)

  return event_source.listen((message) =>
    run(router, message).then((status) => event_source.ack(message, status))
  )

}


module.exports = CommandListener
