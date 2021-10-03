const redis = require('redis')
const listCommands = require('./listCommands')
const allowList = redis.createClient({
  prefix: 'allowlist-refresh-token:',
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS
})

allowList.on('connect', function () {
  console.log('Redis Connected - Refresh Token Allow List')
})

allowList.on('error', function (err) {
  console.log('[ERROR] Redis Refresh Token Allow List:')
  console.log(err)
})

module.exports = listCommands(allowList)
