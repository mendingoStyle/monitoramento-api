const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const BearerStrategy = require('passport-http-bearer').Strategy

const EncoderAdapter = require('../adapters/EncoderAdapter')
const TokenFactory = require('../tokens/TokenFactory')
const Usuario = require('../../entities/Usuario')
const blocklist = require('../../../redis/accessTokenBlocklist')
const InvalidArgumentError = require('../../entities/errors/InvalidArgumentError')

const validateUsuario = user => {
  if (!user) throw new InvalidArgumentError('password or email are incorrect or invalid')
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false
    },
    async (email, password, done) => {
      try {
        const encoder = new EncoderAdapter()
        const user = await Usuario.findByEmail(email)
        validateUsuario(user)
        await encoder.compare(password, user.senha)

        done(null, user)
      } catch (error) {
        done(error)
      }
    }
  )
)

passport.use(
  new BearerStrategy(
    async (token, done) => {
      try {
        await blocklist.checkToken(token)
        const jwt = TokenFactory.create('JWT')
        const payload = jwt.verify(token)
        const user = await Usuario.findById(payload.id)
        done(null, user, { token })
      } catch (error) {
        done(error)
      }      
    }
  )
)
