const userRouter = require('./user.router')
const cameraRouter = require('./camera.router')
const localizacaoRouter = require('./localizacao.router')
const paisRouter = require('./pais.router')
const estadoRouter = require('./estado.router')
const cidadeRouter = require('./cidade.router')
const monitoramentoRouter = require('./monitoramento.router')
const capturaRouter = require('./captura.router')
const userPublicRouter = require('./user.public.router')
const authRouter = require('./auth.router')

const { MimeType, Serializer } = require('../infrastructure/http/serializer')
const NotFoundError = require('../entities/errors/NotFoundError')
const InvalidArgumentError = require('../entities/errors/InvalidArgumentError')
const InvalidContentTypeError = require('../entities/errors/InvalidContentTypeError')
const InternalServerError = require('../entities/errors/InternalServerError')


const authMiddleware = require('../infrastructure/auth/middleware')

const routes = (app) => {

  /* intercept */
  app.use((req, res, next) => {
    const contentType = req.header('Accept')

    /*if (Object.values(MimeType).indexOf(contentType) === -1) {
      throw new InvalidContentTypeError(contentType)
    }*/

    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  })

  
  /* cors */
  app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
    res.status(200).end()
  })

  /* routes */
  app.use('/public/usuarios', userPublicRouter)
  app.use('/auth', authRouter)

  // app.use('/api/users', authMiddleware.bearer, userRouter)
  app.use('/api/usuarios', userRouter)
  app.use('/api/cameras', cameraRouter)
  app.use('/api/localizacoes', localizacaoRouter)
  app.use('/api/localizacoes/paises', paisRouter)
  app.use('/api/localizacoes/estados', estadoRouter)
  app.use('/api/localizacoes/cidades', cidadeRouter)
  app.use('/api/monitoramentos', monitoramentoRouter)
  app.use('/api/capturas',  capturaRouter)

  
  /* error handler */
  app.use('*', (req, res, next) => {
    throw new NotFoundError('Resource')
  })
  app.use((error, req, res, next) => {
    const serializer = new Serializer(res.getHeader('Content-Type'))

    if (error instanceof NotFoundError) {
      res.status(404)
    } else if (error instanceof InvalidArgumentError) {
      res.status(400)
    } else if (error instanceof InvalidContentTypeError) {
      res.status(406)
    } else if (error instanceof InternalServerError) {
      res.status(500)
    } else {
      res.status(400)
    }

    res.send(serializer.serialize({
      message: error.message,
      code: error.code
    }))
  })
}

module.exports = routes
