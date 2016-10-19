
import fs from 'fs'
import path from 'path'
import test from 'ava'
import amqp from 'amqplib'
import Bluebird from 'bluebird'
import RabbitMq from '../lib/event-source/rabbitmq.js'
import CommandListener from '../index.js'

const TEST_PATH  = '/tmp'
const TEST_QUEUE = 'event-source-test-queue'

/* eslint-disable no-magic-numbers */


// getPath :: String -> String
const getPath = (name) => path.join(TEST_PATH, name)


// read :: String -> Promise Either Error String
const read = (path) => new Bluebird((resolve, reject) =>
  fs.readFile(path, (err, data) => err ? reject(err) : resolve(data))
)


// pathExists :: String -> Promise Either Error Boolean
const pathExists = (path) => new Bluebird((resolve) =>
  fs.stat(path, (err, stats) => err ?
    resolve(false) :
    resolve(stats.isFile())
  )
)


// deleteFile :: String -> Promise Either Error String
const deleteFile = (path) => new Bluebird((resolve, reject) =>
  fs.unlink(path, (err) => err ? reject(err) : resolve(path))
)


// writeFile :: String -> String -> Promise Either Error String
const writeFile = (path, data) => new Bluebird((resolve, reject) =>
  fs.writeFile(path, data, (err) => err ? reject(err) : resolve(path))
)


// deleteIfExists :: String -> Promise Either Error String
const deleteIfExists = (path) =>
  pathExists(path).then((exists) => exists ? deleteFile(path) : path)


const publishMessage = (ch, q, msg, options) =>
  ch.assertQueue(q).then(() => ch.sendToQueue(q, msg, options))


const deleteQ = (ch, q) => ch.deleteQueue(q)


test.beforeEach('initialize RabbitMq connection', t =>
  amqp.connect('amqp://localhost')

  .tap((conn) => t.context.rabbitmq = conn)

  .then((conn) => conn.createChannel())

  .tap((ch) => t.context.channel = ch)

)


test.afterEach('close RabbitMq Connection', t => {

  const ch   = t.context.channel
  const conn = t.context.rabbitmq

  return deleteQ(ch, TEST_QUEUE).then(() => conn.close())

})


test.cb('it should recieve and acknowledge a RabbitMq event ' +
'based upon a successful response from the handler', t => {

  const channel      = t.context.channel
  const test_name    = 'basic'
  const test_path    = getPath(`test-file-${test_name}`)
  const test_content = 'this is my content'
  const test_options = {
    messageId: '12345'
  , type: 'test'
  }
  const test_msg     = Buffer.from(JSON.stringify({
    content: test_content
  , path: test_path
  }))

  const handler = (message, Status) =>

    writeFile(test_path, message.payload.content)

    .then(() => Status.Ok)

  const event_source = RabbitMq({
    channel: t.context.channel
  , name: TEST_QUEUE
  })

  const org_ack = event_source.ack

  event_source.ack = (options, status) =>

    org_ack(options, status)
      
    .then(() => read(test_path))

    .then((data) => t.is(data.toString(), test_content))

    .then(() => t.end())


  CommandListener(event_source, handler)

  .then(() => deleteIfExists(test_path))

  .then(() => publishMessage(channel, TEST_QUEUE, test_msg, test_options))

})
