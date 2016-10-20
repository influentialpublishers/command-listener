import test from 'ava'
import { stub } from 'sinon'
import CommandListener from '../index.js'
import { AssertionError } from 'assert'
import Status from '../lib/status.js'


/* eslint-disable no-magic-numbers */
test('require a handler', t => {

  t.plan(2)

  const event_source = {
    listen: () => null
  , ack: () => null
  }

  const runner = () => CommandListener(event_source)

  t.throws(runner, AssertionError)
  t.throws(runner, 'handler must be a function')

})


test('handler must be a function', t => {

  t.plan(2)

  const event_source = {
    listen: () => null
  , ack: () => null
  }

  const runner = () => CommandListener(event_source, {})

  t.throws(runner, AssertionError)
  t.throws(runner, 'handler must be a function')

})


test('require an event source', t => {
  t.plan(2)

  const runner = () => CommandListener()

  t.throws(runner, AssertionError)
  t.throws(runner, 'event_source is required')

})


test('require event_source to have a listen function', t => {
  t.plan(2)

  const runner = () => CommandListener({})

  t.throws(runner, AssertionError)
  t.throws(runner, 'event_source must have a "listen" function')

})


test('it should provide the internal handler to the event source ' +
'"listen" function', t => {
  t.plan(1)

  const listener_stub = stub()
  const event_source  = { listen: listener_stub }

  CommandListener(event_source, () => null)

  t.truthy(listener_stub.calledOnce)

})


// Generate basic test cases for the response handlers.
//
const response_types = [
  { name: 'SUCCESS', handler: 'success', status: Status.Ok }
, { name: 'REQUEUE', handler: 'requeue', status: Status.Requeue }
, { name: 'PRIORITY_REQUEUE'
  , handler: 'priority'
  , status: Status.PriorityRequeue
  }
, { name: 'FAILED', handler: 'failed', status: Status.Fail }
]


response_types.map((type) => {

  test.cb(`it should call the event_source.ack() method with the ` +
  `proper status upon a ${type.name} handler response`, t => {

    t.plan(2)
    
    const test_id = 12345

    const handler = (message, Status) =>
      typeof type.status === 'function' ? type.status(1) : type.status

    const event_source = {

      listen: (fn) => fn({ command: 'test', payload: { id: test_id }})

    , ack: (message, status) => {
        try {
          t.is(message.payload.id, test_id)

          if (typeof type.status === 'object') {
            t.is(status, type.status)
          } else {
            t.true(status instanceof type.status)
          }
          t.end()

        } catch (e) { t.end(e) }
      }

    }

    CommandListener(event_source, handler)

  })

})
