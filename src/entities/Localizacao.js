const { Op } = require('sequelize')
const LocalizacaoRepository = require('../infrastructure/database/setup').localizacao
const CidadeRepository = require('../infrastructure/database/setup').cidade
const InvalidArgumentError = require('./errors/InvalidArgumentError')

class Localizacao {
  constructor({ id, latitude, longitude, rua, bairro, numero, zipcode, complemento, cidadeId, createdAt, updatedAt, version }) {
    this.id = id
    this.latitude = latitude
    this.longitude = longitude
    this.rua = rua
    this.bairro = bairro
    this.numero = numero
    this.zipcode = zipcode
    this.complemento = complemento
    this.cidadeId = cidadeId

    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['rua', 'bairro', 'numero', 'zipcode']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.cidadeId) {
      throw new InvalidArgumentError(`cidadeId invalido`)
    }
  }

  async add() {
    await this.validate()

    return LocalizacaoRepository.create({
      latitude: this.latitude,
      longitude: this.longitude,
      rua: this.rua,
      bairro: this.bairro,
      numero: this.numero,
      zipcode: this.zipcode,
      complemento: this.complemento,
      cidadeId: this.cidadeId
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  update() {
    return LocalizacaoRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        r.latitude = this.latitude ? this.latitude : r.latitude
        r.longitude = this.longitude ? this.longitude : r.longitude
        r.rua = this.rua ? this.rua : r.rua
        r.bairro = this.bairro ? this.bairro : r.bairro
        r.numero = this.numero ? this.numero : r.numero
        r.zipcode = this.zipcode ? this.zipcode : r.zipcode
        r.complemento = this.complemento ? this.complemento : r.complemento
        r.cidadeId = this.cidadeId ? this.cidadeId : r.cidadeId
        await r.save()
      }

      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })  
  }

  static async findById(id) {
    return await LocalizacaoRepository.findOne({ 
      where: { id: id },
      include: { model: CidadeRepository },
      attributes: { exclude: ['cidadeId'] }
    })
  }

  
  static find(page, size = 5, sort = 'rua', direction = 'ASC', filter = undefined) {
    const offset = size * (page-1)
    const condition = !filter 
      ? undefined
      : {
          [Op.or]: [
            {
              rua: { [Op.like]: `%${filter}%` }
            },
            {
              bairro: { [Op.like]: `%${filter}%`}
            },
            {
              complemento: { [Op.like]: `%${filter}%`}
            }
          ]
        }

    return LocalizacaoRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(localizacoes => {
        const pages = Math.ceil(localizacoes.count / size)
        return {
          pages,
          count: localizacoes.count,
          result: localizacoes.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Localizacao
