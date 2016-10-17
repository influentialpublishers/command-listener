
/**
 * type Options =
 *   { conn :: RabbitMqConnection
 *   , name :: String
 *   , durable :: Boolean
 *   , prefetch :: Int
 *   }
 */
const Bluebird = require('bluebird')


// getChannel :: RabbitMqConnection -> Promise Either Error Channel
function getChannel(conn) {
  return new Bluebird((resolve, reject) =>
    conn.createChannel((err, ch) => err ? reject(err) : resolve(ch))
  )
}


function invoker(handler, message) {
  const content   = JSON.parse(message.content.toString())
  const msg       = {
    command: content.command
  , payload: content
  , resource: message
  }

  return handler(message)
}


function listen(ch, handler) {
  ch.assertQueue(name, { durable })
  if (prefetch) ch.prefetch(prefetch)

  ch.consume(name, invoker.bind(null, handler))
}


function ack(ch, { resource }, status) {
  return status.cata({
    Ok              : () => ch.ack(resource)
  , Fail            : () => ch.reject(resource, false)
  , Requeue         : () => ch.reject(resource, true)
  , PriorityRequeue : (priority) => {
      resource.properties.priority = priority
      ch.reject(resource, true)
    }
  })
}


function eventSourceFactory({ name, durable, prefetch }, ch) {
  return {
    listen : listen.bind(null, ch)
  , ack    : ack.bind(null, ch)
  }
}


// RabbitMq :: Options -> Promise EventSource
module.exports = function RabbitMq({ conn, name, durable=true, prefetch=1 }) {
  return getChannel(conn).then(eventSourceFactory.bind(null, options))
}
