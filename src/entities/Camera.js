const { Op } = require('sequelize')
const CameraRepository = require('../infrastructure/database/setup').camera
const Localizacao = require('../infrastructure/database/setup').localizacao
const LocalizacaoModel = require('./Localizacao')
const InvalidArgumentError = require('./errors/InvalidArgumentError')

class Camera {
  constructor({ id, nome, observacao, mac, createdAt, updatedAt, version, localizacaoId }) {
    this.id = id
    this.nome = nome
    this.observacao = observacao
    this.mac = mac
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
    this.localizacaoId = localizacaoId
  }

  async validate() {
    const fields = ['nome', 'mac']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    const exists = await Camera.findByMac(this.mac)
    if (exists) {
      throw new InvalidArgumentError(`mac = ${this.mac} already exists`)
    }
  }

  async validateUpdate() {
    if (this.localizacaoId) {
      const localizacao = await LocalizacaoModel.findById(this.localizacaoId)
      if (!localizacao) {
        throw new InvalidArgumentError(`localizacao com id ${this.localizacaoId} nao existe`)
      }
    }
  }


  /**
   * 
   * A camera deve ser cadastrada de forma automatica pelo sistema,
   * por isso ainda nao tem a localizacao.
   */

  
 
  async add() {
    await this.validate()
    return CameraRepository.create({
      nome: this.nome,
      mac: this.mac,
      observacao: this.observacao
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  async update() {
    await this.validateUpdate()
    return CameraRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        r.nome = this.nome ? this.nome : r.nome
        r.observacao = this.observacao ? this.observacao : r.observacao
        r.localizacaoId = this.localizacaoId ? this.localizacaoId : r.localizacaoId
        await r.save()
      }

      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })  
  }

  static async findAll() {
    return await CameraRepository.findAll({ raw: true })
  }

  static async findByMac(mac) {
    return await CameraRepository.findOne({ 
      where: { mac: mac },
      raw: true 
    })
  }

  static async findById(id) {
    return await CameraRepository.findOne({ 
      where: { id: id },
      include: { model: Localizacao },
      attributes: { exclude: ['localizacaoId'] }
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
              mac: { [Op.like]: `%${filter}%`}
            },
            {
              observacao: { [Op.like]: `%${filter}%`}
            }
          ]
        }

    return CameraRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(cameras => {
        const pages = Math.ceil(cameras.count / size)
        return {
          pages,
          count: cameras.count,
          result: cameras.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Camera
