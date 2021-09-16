const Router = require('express')
const Camera = require('../entities/Camera')
const db = require('../infrastructure/database/setup')
const { Serializer } = require('../infrastructure/http/serializer')
const InvalidArgumentError = require('../entities/errors/InvalidArgumentError')

const router = Router()

router.options('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
})

router.options('/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
})

router.options('/:mac/mac', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
})

router.get('/', async (req, res, next) => {
  try {
    const list = await Camera.findAll()
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(list))
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const camera = await Camera.findById(req.params.id)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(camera))
  } catch (error) {
    next(error)
  }
})

router.get('/:mac/mac', async (req, res, next) => {
  try {
    const camera = await Camera.findByMac(req.params.mac)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(camera))
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  let transaction
  
  try {
    transaction = await db.sequelize.transaction()
    const camera = new Camera(req.body)
    const result = await camera.add()
    
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(201).send(serializer.serialize(result))

    await transaction.commit()
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
})

router.post('/verify', async (req, res, next) => {
  let transaction
  
  try {
    transaction = await db.sequelize.transaction()
    const camera = new Camera(req.body)
    const result = await camera.addCapturaCamera()
    
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(201).send(serializer.serialize(result))

    await transaction.commit()
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  let transaction
  
  try {
    transaction = await db.sequelize.transaction()
    const camera = new Camera(req.body)
    camera.id = req.params.id
    await camera.update()
    res.status(204).send()

    await transaction.commit()
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
})

module.exports = router
