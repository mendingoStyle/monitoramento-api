require('dotenv').config()

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
})

router.options('/page', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
})

router.options('/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
})

router.options('/:id/imagens', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
})

router.options('/:name/imagem/captura', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
})

router.options('/:id/historico', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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

router.get('/page', async (req, res, next) => {
  try {
    if (!req.query.page) {
      throw new InvalidArgumentError('\'page\' query not provided')
    }

    const page = req.query.page
    const size = req.query.size
    const sort = req.query.sort
    const direction = req.query.direction
    const filter = req.query.filter
    const cameraId = req.query.camera

    const list = await Captura.find(page, size, sort, direction, filter, cameraId)
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

router.get('/:name/date', async (req, res, next) => {
  try {
    const captura = await Captura.findCapturasDate(req.params.name)
    const serializer = new Serializer(res.getHeader('Content-Type'))
    res.status(200).send(serializer.serialize(captura.length))
  } catch (error) {
    next(error)
  }
})

router.get('/:name/imagem/captura', async (req, res, next) => {
  try {
    let c = new Client();
    const imagemCaptura = await ImagemCaptura.findImagemCapturaByUrlBool(req.params.name)
    if (imagemCaptura) {
      if (fs.existsSync('public/' + req.params.name)) {
        console.log("existe")
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

      } else {
        c.get(`${process.env.FTP_PATH}/${process.env.path_ftp_subdiretorio_lidas}/${req.params.name}`, async function (err, stream) {
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
                next()
              });


            })
            stream.once('close', function () { c.end(); });
          }


        })
        var connectionProperties = {
          user: process.env.FTP_USER,
          password: process.env.FTP_PASS,
          host: process.env.FTP_HOST,
          port: process.env.FTP_PORT
        };
        try{
          c.connect(connectionProperties);
        } catch(e){
          next(e)
        }
      }
    } else {
      const serializer = new Serializer(res.getHeader('Content-Type'))
      res.status(200).send(serializer.serialize(imagemCaptura))
    }

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
    //verifica se essa captura foi uma captura de veiculo atualmente monitorada
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
