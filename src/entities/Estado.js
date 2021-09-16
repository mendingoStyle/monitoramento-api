const { Op } = require('sequelize')
const EstadoRepository = require('../infrastructure/database/setup').estado
const PaisRepository = require('../infrastructure/database/setup').pais
const InvalidArgumentError = require('./errors/InvalidArgumentError')

class Estado {
  constructor({ id, nome, sigla, paisId, createdAt, updatedAt, version }) {
    this.id = id
    this.nome = nome
    this.sigla = sigla
    this.paisId = paisId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['nome', 'sigla']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.paisId) {
      throw new InvalidArgumentError(`paisId inválido`)
    }
  }

   static async add(nome,pais) {
    return EstadoRepository.create({
      nome: this.nome,
      sigla: 'PR',
      paisId: pais
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  async update() {
    return EstadoRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        r.nome = this.nome ? this.nome : r.nome
        r.sigla = this.sigla ? this.sigla : r.sigla
        await r.save()
      }

      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })  
  }

  static async findAll() {
    return await EstadoRepository.findAll({ raw: true })
  }

  static async findById(id) {
    return await EstadoRepository.findOne({ 
      where: { id: id },
      include: { model: PaisRepository },
      attributes: { exclude: ['paisId'] }
    })
  }

  static async findName(name) {
    return await EstadoRepository.findOne({ 
      where: { name: name },
      include: { model: PaisRepository },
      attributes: { exclude: ['paisId'] }
    })
  }

  static find(page, size = 5, sort = 'nome', direction = 'ASC', filter = undefined) {
    const offset = size * (page-1)
    const condition = !filter 
      ? undefined
      : {
          [Op.or]: [
            {
              nome: { [Op.like]: `%${filter}%` }
            },
            {
              sigla: { [Op.like]: `%${filter}%` }
            },
          ]
        }

    return EstadoRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(estados => {
        const pages = Math.ceil(estados.count / size)
        return {
          pages,
          count: estados.count,
          result: estados.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Estado
