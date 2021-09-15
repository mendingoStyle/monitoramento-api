const { Op } = require('sequelize')
const MonitoramentoRepository = require('../infrastructure/database/setup').monitoramento
const UsuarioRepository = require('../infrastructure/database/setup').usuario
const InvalidArgumentError = require('./errors/InvalidArgumentError')


class Monitoramento {
  constructor({ id, placa, dataInicio, dataFim, observacoes, isContinuo, status, usuarioId, createdAt, updatedAt, version }) {
    this.id = id
    this.placa = placa
    this.dataInicio = dataInicio
    this.dataFim = dataFim
    this.observacoes = observacoes
    this.isContinuo = isContinuo
    this.status = status
    this.usuarioId = usuarioId

    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['placa', 'status']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.usuarioId) {
      throw new InvalidArgumentError(`usuarioId is invalid`)
    }
  }

  async add() {
    await this.validate()

    return MonitoramentoRepository.create({
      placa: this.placa,
      observacoes: this.observacoes,
      status: this.status,
      usuarioId: this.usuarioId,
      isContinuo: 1,
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  remove() {
    return MonitoramentoRepository.destroy({
      where: { id: this.id }
    }).then(r => {
      return Promise.resolve(r)
    })
    .catch(err => {
      Promise.reject(err)
    })
  }

  static async findAll() {
    return await MonitoramentoRepository.findAll({ raw: true })
  }

  static async findById(id) {
    return await MonitoramentoRepository.findOne({ 
      where: { id: id },
      include: { model: UsuarioRepository },
      attributes: { exclude: ['usuarioId'] }
    })
  }

  static async findByplaca(placa) {
    return await MonitoramentoRepository.findOne({ 
      where: { placa: placa },
      include: { model: UsuarioRepository },
      attributes: { exclude: ['usuarioId'] }
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
            }
          ]
        }

    return MonitoramentoRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(monitoramentos => {
        const pages = Math.ceil(monitoramentos.count / size)
        return {
          pages,
          count: monitoramentos.count,
          result: monitoramentos.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Monitoramento
