require('dotenv').config()
const redis = require('redis')

const publisher = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS
})

publisher.on('connect', function () {
  console.log('Redis Connected - Publisher')
})

publisher.on('error', function (err) {
  console.log('[ERROR] Redis Publisher:')
  console.log(err)
})

module.exports = (message) => {
  publisher.publish('app:notifications', message)
}
