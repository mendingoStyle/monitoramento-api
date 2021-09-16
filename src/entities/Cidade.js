const { Op } = require('sequelize')
const CidadeRepository = require('../infrastructure/database/setup').cidade
const EstadoRepository = require('../infrastructure/database/setup').estado
const InvalidArgumentError = require('./errors/InvalidArgumentError')


class Cidade {
  constructor({ id, nome, estadoId, createdAt, updatedAt, version }) {
    this.id = id
    this.nome = nome
    this.estadoId = estadoId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['nome']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.estadoId) {
      throw new InvalidArgumentError(`estadoId is invalid`)
    }
  }

  async add() {
    await this.validate()
    return CidadeRepository.create({
      nome: this.nome,
      estadoId: this.estadoId
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }
  static async addCidade(nome, estadoid) {
    return CidadeRepository.create({
      nome: nome,
      estadoId: estadoid
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  async update() {
    return CidadeRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        r.nome = this.nome ? this.nome : r.nome
        await r.save()
      }

      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  static async findAll() {
    return await CidadeRepository.findAll({ raw: true })
  }

  static async findById(id) {
    return await CidadeRepository.findOne({
      where: { id: id },
      include: { model: EstadoRepository },
      attributes: { exclude: ['estadoId'] }
    })
  }

  static async findName(id) {
    return await CidadeRepository.findOne({
      where: { name: id },
      include: { model: EstadoRepository },
      attributes: { exclude: ['estadoId'] }
    })
  }


  static find(page, size = 5, sort = 'nome', direction = 'ASC', filter = undefined) {
    const offset = size * (page - 1)
    const condition = !filter
      ? undefined
      : {
        [Op.or]: [
          {
            nome: { [Op.like]: `%${filter}%` }
          }
        ]
      }

    return CidadeRepository.findAndCountAll({
      raw: true,
      where: condition,
      offset: offset,
      limit: +size,
      order: [
        [sort, direction]
      ]
    })
      .then(cidades => {
        const pages = Math.ceil(cidades.count / size)
        return {
          pages,
          count: cidades.count,
          result: cidades.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Cidade
