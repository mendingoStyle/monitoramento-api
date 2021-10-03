require('dotenv').config()
const redis = require('redis')
const WebSocket = require('ws')

const notifier = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS
})

notifier.on('connect', function () {
  console.log('Redis Connected - Notifier')
})

notifier.on('error', function (err) {
  console.log('[ERROR] Redis Notifier:')
  console.log(err)
})

notifier.subscribe('app:notifications')

const server = new WebSocket.Server({
  port: process.env.WEB_SOCKET_PORT
})

server.on('connection', function connection(ws) {
  notifier.on('message', function(channel, message) {
    console.log(message)
    ws.send(message)
  })
})

console.log('WebSocket server started at ws://localhost:'+process.env.WEB_SOCKET_PORT)
