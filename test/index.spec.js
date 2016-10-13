import test from 'ava'
import { stub } from 'sinon'
import CommandListener from '../index.js'
import { AssertionError } from 'assert'
import Status from '../lib/status.js'


/* eslint-disable no-magic-numbers */
test('require a route map', t => {
  t.plan(2)

  const runner = () => CommandListener({ })

  t.throws(runner, AssertionError)
  t.throws(runner, 'route_map is required')

})


test('require an event source', t => {
  t.plan(2)

  const runner = () => CommandListener({ route_map: {} })

  t.throws(runner, AssertionError)
  t.throws(runner, 'event_source is required')

})


test('require event_source to have a listen function', t => {
  t.plan(2)


  const options = {
    route_map: {}
  , event_source: {}
  }
  const runner = () => CommandListener(options)

  t.throws(runner, AssertionError)
  t.throws(runner, 'event_source must have a "listen" function')

})


test('it should provide the internal handler to the event source ' +
'"listen" function', t => {
  t.plan(1)

  const listener_stub = stub()

  const options = {
    route_map: {}
  , event_source: { listen: listener_stub }
  }

  CommandListener(options)

  t.truthy(listener_stub.calledOnce)

})


test.cb('it should call the event_source.success method upon ' +
'a successful handler response', t => {

  t.plan(1)

  const test_id = 12345

  const options = {
    route_map: {
      test: '/helpers/handlers/basic.js@success'
    }
    
  , event_source: {

      listen: (handler) => handler('test', { foo: 'bar' }, { id: test_id })
    , success: (msg, response) => {
        t.is(msg.id, test_id)
        t.end()
      }
    }
  }


  CommandListener(options)


})
