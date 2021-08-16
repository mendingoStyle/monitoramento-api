const { Op } = require('sequelize')
const CapturaRepository = require('../infrastructure/database/setup').captura
const CameraRepository = require('../infrastructure/database/setup').camera
const HistoricoEdicaoCaptura = require('./HistoricoEdicaoCaptura')
const InvalidArgumentError = require('./errors/InvalidArgumentError')

class Captura {
  constructor({ id, placa, dataHora, detalhes, cameraId, monitoramentoId, createdAt, updatedAt, version }) {
    this.id = id
    this.placa = placa
    this.dataHora = dataHora
    this.detalhes = detalhes
    this.cameraId = cameraId
    this.monitoramentoId = monitoramentoId

    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['placa']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.dataHora) {
      throw new InvalidArgumentError(`forneça a data e hora da captura`)
    }

    if (!this.cameraId) {
      throw new InvalidArgumentError(`cameraId invalido`)
    }
  }

  async add() {
    await this.validate()

    return CapturaRepository.create({
      placa: this.placa,
      dataHora: this.dataHora,
      detalhes: this.detalhes,
      cameraId: this.cameraId,
      monitoramentoId: this.monitoramentoId
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
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

  static find(page, size = 5, sort = 'placa', direction = 'ASC', filter = undefined) {
    const offset = size * (page-1)
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
