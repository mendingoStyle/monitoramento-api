const { Op } = require('sequelize')
const PaisRepository = require('../infrastructure/database/setup').pais
const InvalidArgumentError = require('./errors/InvalidArgumentError')

class Pais {
  constructor({ id, nome, createdAt, updatedAt, version }) {
    this.id = id
    this.nome = nome
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
  }

  async add() {
    await this.validate()

    return PaisRepository.create({
      nome: this.nome
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  async update() {
    return PaisRepository.findOne({
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
    return await PaisRepository.findAll({ raw: true })
  }

  static async findById(id) {
    return await PaisRepository.findOne({ 
      where: { id: id },
      raw: true
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
            }
          ]
        }

    return PaisRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(paises => {
        const pages = Math.ceil(paises.count / size)
        return {
          pages,
          count: paises.count,
          result: paises.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Pais
