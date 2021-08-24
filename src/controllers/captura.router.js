const Router = require('express')
const Captura = require('../entities/Captura')
const HistoricoEdicaoCaptura = require('../entities/HistoricoEdicaoCaptura')
const db = require('../infrastructure/database/setup')
const { Serializer } = require('../infrastructure/http/serializer')
const InvalidArgumentError = require('../entities/errors/InvalidArgumentError')

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'./uploads/')
  },
  filename: function(req,file,cb){
    cb(null,file.originalname)
  },
})
const upload = multer({storage : storage})


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

router.options('/:id/historico', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
})

router.get('/', async (req, res, next) => {
  try {
    const list = await Captura.findAll()
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(list))
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const captura = await Captura.findById(req.params.id)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(captura))
  } catch (error) {
    next(error)
  }
})

router.get('/:id/imagens', async (req, res, next) => {
  try {
    const captura = await Captura.findImagemCapturaByid(req.params.id)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(captura))
  } catch (error) {
    next(error)
  }
})


router.get('/:name/imagem', async (req, res, next) => {
  try {
    const captura = await Captura.findImagemCapturaByUrl(req.params.name)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(captura))
  } catch (error) {
    next(error)
  }
})

router.get('/:id/historico', async (req, res, next) => {
  try {
    const captura = await HistoricoEdicaoCaptura.findByCapturaId(req.params.id)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(captura))
  } catch (error) {
    next(error)
  }
})

router.post('/', upload.single('file'), async (req, res, next) => {
  let transaction
  try {
    transaction = await db.sequelize.transaction()
    const captura = new Captura(req.body)
    const result = await captura.add()

    console.log(result)
    
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
    const captura = new Captura(req.body)
    captura.id = req.params.id
    await captura.update(req.user.id)
    
    res.status(204).send()

    await transaction.commit()
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
})

module.exports = router
