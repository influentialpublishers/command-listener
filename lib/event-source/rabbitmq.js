
const R        = require('ramda')
const Bluebird = require('bluebird')
/**
 * type Options =
 *   { conn :: RabbitMqConnection
 *   , name :: String
 *   , durable :: Boolean
 *   , prefetch :: Int
 *   }
 */


const parseContent = (content) => {
  try {
    return JSON.parse(content)

  } catch (e) {
    return content
  }
}

// getContent :: Message -> String
const getContent = R.compose(
  parseContent
, (x) => x.toString()
, R.prop('content')
)



// invoker :: Function -> Message -> Status -> Promise Status
const invoker = (handler, message, Status) => {
  if (message) {
    return handler({
      command: message.properties.headers.command
    , payload: getContent(message)
    , resource: message
    }, Status)
  } 

  return null

}


const wrap  = (ch, message, fn) => () => {
  fn(ch, message)
  return Bluebird.resolve(message)
}


const listen = (ch, { name, durable, prefetch}, handler) =>
  ch.assertQueue(name, { durable })
  
  .then(() => prefetch ? ch.prefetch(prefetch) : null)

  .then(() => ch.consume(name, invoker.bind(null, handler)))


const ack = (ch, { resource }, status) => status.cata({
  Ok              : wrap(ch, resource, () => ch.ack(resource))
, Fail            : wrap(ch, resource, () => ch.reject(resource, false))
, Requeue         : wrap(ch, resource, () => ch.reject(resource, true))
, PriorityRequeue : (priority) => {
    resource.properties.priority = priority
    ch.reject(resource, true)
    return Bluebird.resolve(resource)
  }
})


// RabbitMq :: Options -> Promise EventSource
function RabbitMq({ channel, name, durable=true, prefetch=1 }) {
  return {
    listen : listen.bind(null, channel, { name, durable, prefetch })
  , ack    : ack.bind(null, channel)
  }
}


module.exports = RabbitMq
