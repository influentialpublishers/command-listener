
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


const listen = (ch, options, handler) =>

  ch.assertQueue(options.name, options)

  .then(() => options.prefetch ? ch.prefetch(options.prefetch) : null)

  .then(() => ch.consume(options.name, invoker.bind(null, handler)))


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
function RabbitMq(options) {

  const _options = R.reject(
    R.isNil
  , { name               : options.name
    , durable            : R.defaultTo(true, options.durable)
    , prefetch           : R.defaultTo(1, options.prefetch)
    , deadLetterExchange : options.deadLetterExchange
    , messageTtl         : options.messageTtl
    }
  )

  return {
    listen : listen.bind(null, options.channel, _options)
  , ack    : ack.bind(null, options.channel)
  }
}


module.exports = RabbitMq
