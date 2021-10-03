const { Op } = require('sequelize')
const CapturaRepository = require('../infrastructure/database/setup').captura
const CameraRepository = require('../infrastructure/database/setup').camera
const HistoricoEdicaoCaptura = require('./HistoricoEdicaoCaptura')
const InvalidArgumentError = require('./errors/InvalidArgumentError')
const ImagensCaptura = require('../infrastructure/database/setup').imagemCaptura
const ImagemCapturaEntities = require('../entities/ImagemCaptura')
const Monitoramento = require('../entities/Monitoramento')
const Camera = require('./Camera')
var fs = require('fs');
var admin = require('firebase-admin');
var serviceAccount = require("../monitoramento-52c54-firebase-adminsdk-f21tu-098768f3b2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


class Captura {
  constructor({ id, mac,observacoes, placa,modelo, dataHora, url, detalhes, cameraId, monitoramentoId, createdAt, updatedAt, version }) {
    this.id = id
    this.placa = placa
    this.dataHora = dataHora
    this.detalhes = detalhes
    this.cameraId = cameraId
    this.monitoramentoId = monitoramentoId
    this.url = url
    this.createdAt = createdAt
    this.modelo = modelo
    this.updatedAt = updatedAt
    this.version = version
    this.mac = mac

  }

  async validate() {
    const fields = ['placa']
    fields.forEach(field => {
      const value = this[field]
      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.mac) {
      throw new InvalidArgumentError(`forneça o MAC`)
    }

    if (!this.dataHora) {
      throw new InvalidArgumentError(`forneça a data e hora da captura`)
    }
    if (!this.url) {
      throw new InvalidArgumentError(`forneça a url`)
    }
    if (!this.modelo) {
      throw new InvalidArgumentError(`modelo invalido`)
    }

    let capturaCheck = await ImagemCapturaEntities.findImagemCapturaByUrlBool(this.url)
    if (capturaCheck) {
      throw new InvalidArgumentError(`Capturas Já cadastradas`)
    }

  }

  async add() {
    await this.validate()
    return await Camera.findByMac(this.mac)
      .then(async (r) => {
        let newCamera = null

        // se a camera nao existir, cadastre
        if (!r) {
          let camera = new Camera({ nome: this.mac, mac: this.mac, observacao: this.modelo })
          newCamera = await camera.addCapturaCamera()
        } else {
          newCamera = r
        }

        if (newCamera && newCamera.id) {

          return CapturaRepository.create({
            placa: this.placa,
            dataHora: this.dataHora,
            detalhes: this.detalhes,
            cameraId: newCamera.id,
            monitoramentoId: this.monitoramentoId,
            observacoes: this.observacoes
          }).then(async result => {
            let add = await this.addImagem(result.id)
            if (add) {
              this.notifica(this.placa)
              return Promise.resolve({ id: result.id })
            } else {
              return Promise.reject(new Error('nao foi possível cadastrar a imagem.'))
            }
          }).catch(err => {
            return Promise.reject(err)
          })
        } else {
          return Promise.reject(new Error('nao foi possível cadastrar a camera.'))
        }
      }).catch(err => {
        return Promise.reject(err)
      })
  }

  async addImagem(id) {
    return await ImagensCaptura.create({
      capturaId: id,
      imagem: this.url,
    })
  }

  async notifica(placa) {
    let m = await Monitoramento.findByplaca(placa);
    if (m) {
     
      const message = {
        data: {
          placa: placa,
        },
        token: 'fdJVlDgxTTunS_FBiv9BuY:APA91bFk7ZT5YtCs2Y9fePipHZ2SkrlcVTfJh3YHJyunqjuXoFyv9_aW0D33kkspxyp4wrc_BFiQWDDvullK8tIJK23K5swBwv004sXw-7j8eKraWLcCb3p4LrLserOPx7vbFGPrwUvM'
      };
      // TODO enviar notificacao via redis
      
      admin.messaging().send(message)
        .then(() => {
          Monitoramento.update(placa);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });

    } 
  }

  async update(usuarioId) {
    return CapturaRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        const valorAnterior = r.placa
        const valorAtual = this.placa
        r.placa = this.placa ? this.placa : r.placa
        await r.save()
        const historico = new HistoricoEdicaoCaptura({
          valorAnterior,
          valorAtual,
          usuarioId,
          capturaId: this.id
        })
        await historico.add()
      }
      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  static async findAll() {
    return await CapturaRepository.findAll({ raw: true })
  }

  static async findById(id) {
    return await CapturaRepository.findOne({
      where: { id: id },
      include: { model: CameraRepository },
      attributes: { exclude: ['cameraId'] }
    })
  }
  static async findCapturasDate(date) {
    return await CapturaRepository.findAll({
      where: { dataHora: date },
    })
  }


  static async findImagemCapturaByUrl(url) {
    return await ImagensCaptura.findOne({
      where: { imagem: url },
    })
  }

  static async findImagemCapturaByid(id) {
    return await ImagensCaptura.findAll({
      where: { capturaId: id },
    })
  }

  static find(page, size = 5, sort = 'placa', direction = 'ASC', filter = undefined, cameraId = undefined) {
    const offset = size * (page - 1)
    let condition = !filter
      ? undefined
      : {
        [Op.or]: [
          {
            placa: { [Op.like]: `%${filter}%` }
          },
          {
            detalhes: { [Op.like]: `%${filter}%` }
          },
          {
            dataHora: { [Op.like]: `%${filter}%` }
          },
        ]
      }


    let conditionCamera = !cameraId
      ? undefined
      : {
        [Op.and]: [
          {
            cameraId: cameraId
          }
        ]
      }

    let whereClause = undefined
    if (condition) {
      whereClause = condition
      if (conditionCamera) {
        whereClause = [condition, conditionCamera]
      }
    } else if (conditionCamera) {
      whereClause = conditionCamera
    }

    return CapturaRepository.findAndCountAll({
      raw: true,
      where: whereClause,
      offset: offset,
      limit: +size,
      order: [
        [sort, direction]
      ]
    })
      .then(capturas => {
        const pages = Math.ceil(capturas.count / size)
        return {
          pages,
          count: capturas.count,
          result: capturas.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Captura
