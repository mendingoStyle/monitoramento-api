const path = require('path')
const redisPath = path.resolve(process.cwd(), 'redis', 'refreshTokenAllowlist')
const errorPath = path.resolve(process.cwd(), 'src', 'entities', 'errors', 'InvalidArgumentError')

const refreshTokenAllowList = require(redisPath)
const InvalidArgumentError = require(errorPath)

const crypto = require('crypto')
const moment = require('moment')

class RefreshToken {
  async generate(id, [time, unit]) {
    const expiresIn = moment().add(time, unit).unix()
    const refreshToken = crypto.randomBytes(24).toString('hex')
    await refreshTokenAllowList.add(refreshToken, id, expiresIn)
    return refreshToken
  }

  async verify(token) {
    if (!token) {
      throw new InvalidArgumentError('refreshToken is invalid')
    }
  
    const id = await refreshTokenAllowList.get(token)
    if (!id) {
      throw new InvalidArgumentError('refreshToken is invalid')
    }
    
    return id
  }

  async invalidate(token) {
    await refreshTokenAllowList.remove(token)
  }
}

module.exports = RefreshToken