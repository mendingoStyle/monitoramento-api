const { promisify } = require('util')

module.exports = list => {
  const existsAsync = promisify(list.exists).bind(list)
  const setAsync = promisify(list.set).bind(list)
  const getAsync = promisify(list.get).bind(list)
  const delAsync = promisify(list.del).bind(list)
  
  return {
    async add(key, value, expiresIn) {
      await setAsync(key, value)
      list.expireat(key, expiresIn)
    },

    async get(key) {
      return getAsync(key)
    },

    async hasKey(key) {
      const result = await existsAsync(key)
      return result === 1
    },

    async remove(key) {
      await delAsync(key)
    },
  }
}