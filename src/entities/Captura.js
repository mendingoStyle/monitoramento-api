const { Op } = require('sequelize')
const CapturaRepository = require('../infrastructure/database/setup').captura
const CameraRepository = require('../infrastructure/database/setup').camera
const HistoricoEdicaoCaptura = require('./HistoricoEdicaoCaptura')
const InvalidArgumentError = require('./errors/InvalidArgumentError')
const ImagensCaptura = require('../infrastructure/database/setup').imagemCaptura
const Camera = require('./Camera')
var fs = require('fs');

class Captura {
  constructor({ id, mac, placa, dataHora, url, file, detalhes, cameraId, monitoramentoId, createdAt, updatedAt, version }) {
    this.id = id
    this.placa = placa
    this.dataHora = dataHora
    this.detalhes = detalhes
    this.cameraId = cameraId
    //this.monitoramentoId = monitoramentoId
    this.url = url
    this.file = file
    this.createdAt = createdAt
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

    let capturaCheck = await Captura.findImagemCapturaByUrl(this.url)
    if (capturaCheck != null) {
      throw new InvalidArgumentError(`Capturas Já cadastradas`)
    }



  }

  async add() {
    await this.validate()
    console.log('consultando o mac: ' + this.mac)
    Camera.findByMac(this.mac)
      .then(async r => {
        console.log('mac consultado: ' + this.mac)
        let newCamera;
        if (!r) {
          let camera = new Camera({ nome: this.mac, mac: this.mac })
          newCamera = await camera.add()
        } else {
          newCamera = r
        }

        if (newCamera && newCamera.id) {

          return CapturaRepository.create({
            placa: this.placa,
            dataHora: this.dataHora,
            detalhes: this.detalhes,
            cameraId: newCamera.id,
            monitoramentoId: this.monitoramentoId
          }).then(result => {
            this.addImagem(result.id)
            return Promise.resolve({ id: result.id })
          }).catch(err => {
            return Promise.reject(err)
          })
        }

      }).catch(err => {
        return Promise.reject(err)
      })

    // if (idCamera == null) {
    //   let camera = new Camera({ nome: this.mac, mac: this.mac })
    //   idCamera = await camera.add()
    // }
    // return CapturaRepository.create({
    //   placa: this.placa,
    //   dataHora: this.dataHora,
    //   detalhes: this.detalhes,
    //   cameraId: idCamera.id,
    //   monitoramentoId: this.monitoramentoId
    // }).then(r => {
    //   this.addImagem(r.id)
    //   return Promise.resolve({ id: r.id })
    // }).catch(err => {
    //   return Promise.reject(err)
    // })
  }
  async addImagem(id) {

    fs.readFile('uploads/' + this.url, async (err, data) => {
      if (!err) {
        await ImagensCaptura.create({
          capturaId: id,
          imagem: this.url,
          binary: data,
        })
      } else console.log(err)
    })
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

  static find(page, size = 5, sort = 'placa', direction = 'ASC', filter = undefined) {
    const offset = size * (page - 1)
    const condition = !filter
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

    return CapturaRepository.findAndCountAll({
      raw: true,
      where: condition,
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
