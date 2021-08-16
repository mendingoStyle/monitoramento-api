const { Op } = require('sequelize')
const UsuarioRepository = require('../infrastructure/database/setup').usuario
const InvalidArgumentError = require('./errors/InvalidArgumentError')

const TokenFactory = require('../infrastructure/tokens/TokenFactory')
const EncoderAdapter = require('../infrastructure/adapters/EncoderAdapter')
const EmailConfirmationMailer = require('../infrastructure/mail/EmailConfirmationMailer')

class Usuario {
  constructor({ id, nome, email, senha, token, createdAt, updatedAt, version, isAtivo, permissao }) {
    this.id = id
    this.nome = nome
    this.email = email
    this.senha = senha
    this.token = token
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
    this.isAtivo = isAtivo
    this.permissao = permissao
  }

  async validate() {
    const fields = ['nome', 'email', 'senha', 'permissao']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    const exists = await Usuario.findByEmail(this.email)
    if (exists) {
      throw new InvalidArgumentError(`the field 'email' is invalid`)
    }
  }

  async add() {
    await this.validate()
    const encoder = new EncoderAdapter()

    return UsuarioRepository.create({
      nome: this.nome,
      email: this.email,
      senha: await encoder.encode(this.senha),
      token: this.token,
      isEmailVerificado: 0,
      isAtivo: 1,
      permissao: this.permissao
    }).then(r => {
      const token = TokenFactory.create('JWT').generate(r.id, [1, 'h'])
      EmailConfirmationMailer.send(r.email, token)
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  update() {
    return UsuarioRepository.findOne({
      where: { id: this.id },
    }).then(async r => {
      if (r) {
        r.nome = this.nome ? this.nome : r.nome
        r.token = this.token ? this.token : r.token
        r.isAtivo = this.isAtivo != undefined ? this.isAtivo : r.isAtivo
        r.permissao = this.permissao ? this.permissao : r.permissao
        
        if (this.senha) {
          const encoder = new EncoderAdapter()
          r.senha = await encoder.encode(this.senha)
        }
  
        await r.save()
      }

      return Promise.resolve()
    }).catch(err => {
      return Promise.reject(err)
    })  
  }

  static async verifyEmail(token) {
    const payload = TokenFactory.create('JWT').verify(token)

    return await UsuarioRepository.findOne({ 
      where: { id: payload.id },
    })
    .then(async r => {
      r.isEmailVerificado = 1
      await r.save()
      return Promise.resolve()
    })
    .catch(err => {
      return Promise.reject(err)
    })
  }

  static async findAll() {
    return await UsuarioRepository.findAll({ raw: true })
  }

  static async findByEmail(email) {
    return await UsuarioRepository.findOne({ 
      where: { email: email },
      raw: true 
    })
  }

  static async findById(id) {
    return await UsuarioRepository.findOne({ 
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
            },
            {
              email: { [Op.like]: `%${filter}%`}
            },
            {
              permissao: { [Op.like]: `%${filter}%`}
            }
          ]
        }

    return UsuarioRepository.findAndCountAll({
        raw: true,
        where: condition,
        offset: offset,
        limit: +size,
        order: [
          [sort, direction]
        ]
      })
      .then(usuarios => {
        const pages = Math.ceil(usuarios.count / size)
        return {
          pages,
          count: usuarios.count,
          result: usuarios.rows
        }
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }
}

module.exports = Usuario
