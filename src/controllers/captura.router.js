const Router = require('express')
const Captura = require('../entities/Captura')
const HistoricoEdicaoCaptura = require('../entities/HistoricoEdicaoCaptura')
const db = require('../infrastructure/database/setup')
const { Serializer } = require('../infrastructure/http/serializer')
const InvalidArgumentError = require('../entities/errors/InvalidArgumentError')
const ImagemCaptura = require('../entities/ImagemCaptura')
let Client = require('ftp');
let fs = require('fs');

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
    const imagemCaptura = await ImagemCaptura.findImagemCapturaByIdcaptura(req.params.id)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(imagemCaptura))
  } catch (error) {
    next(error)
  }
})

router.get('/:name/imagem', async (req, res, next) => {
  try {
    const imagemCaptura = await ImagemCaptura.findImagemCapturaByUrlBool(req.params.name)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(imagemCaptura))
  } catch (error) {
    next(error)
  }
})



router.get('/:name/imagem/captura', async (req, res, next) => {
  try {
    let c = new Client();
    const imagemCaptura = await ImagemCaptura.findImagemCapturaByUrlBool(req.params.name)
    if (imagemCaptura) {
      c.get(req.params.name, async function (err, stream) {
        if (err) {
          next(err)
        } else {
          stream.pipe(fs.createWriteStream('public/' + req.params.name)).on('finish', async () => {
            let s = fs.createReadStream('public/' + req.params.name);
            s.on('open', function () {
              res.setHeader('Content-Type', 'image/png');
              s.pipe(res);
            });
            s.on('error', function () {
              res.setHeader('Content-Type', 'text/plain');
              res.statusCode = 404;
              res.end('Not found');
            });
                 

          })
          stream.once('close', function() { c.end(); });
        }

      })
    } else {
      const serializer = new Serializer(res.getHeader('Content-Type'))
      res.status(200).send(serializer.serialize(imagemCaptura))
    }
    var connectionProperties = {
      user: "teste",
      password: "teste",
    };
    c.connect(connectionProperties);
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

router.post('/', async (req, res, next) => {
  let transaction
  try {
    transaction = await db.sequelize.transaction()
    const captura = new Captura(req.body)
    const result = await captura.add()

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
