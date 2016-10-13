const R               = require('ramda')
const Bluebird = require('bluebird')
const urarse          = require('urarse')
const assert          = require('assert')
const ResponseHandler = require('./lib/response.js')


function CommandListener({ route_map, event_source }) {

  assert.ok(R.is(Object, route_map), 'route_map is required')
  assert.ok(R.is(Object, event_source), 'event_source is required')

  assert.ok(
    R.is(Function, event_source.listen)
  , 'event_source must have a "listen" function'
  )

  const router = urarse.init(route_map)

  return event_source.listen((command, payload, msg) =>

    Bluebird.resolve( router.routeAndExecute(command, payload, msg) )

    .then(ResponseHandler(event_source, msg))
  )

}


module.exports = CommandListener
