const HistoricoEdicaoCapturaRepository = require('../infrastructure/database/setup').historicoEdicaoCaptura
const InvalidArgumentError = require('./errors/InvalidArgumentError')
const UsuarioRepository = require('../infrastructure/database/setup').usuario

class HistoricoEdicaoCaptura {
  constructor({ id, valorAnterior, valorAtual, usuarioId, capturaId, createdAt, updatedAt, version }) {
    this.id = id
    this.valorAnterior = valorAnterior
    this.valorAtual = valorAtual
    this.usuarioId = usuarioId
    this.capturaId = capturaId

    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.version = version
  }

  async validate() {
    const fields = ['valorAnterior', 'valorAtual']
    fields.forEach(field => {
      const value = this[field]

      if (typeof value !== 'string' || value.length === 0) {
        throw new InvalidArgumentError(`the field ${field} is invalid`)
      }
    })

    if (!this.usuarioId) {
      throw new InvalidArgumentError(`usuarioId is invalid`)
    }

    if (!this.capturaId) {
      throw new InvalidArgumentError(`capturaId is invalid`)
    }
  }

  async add() {
    await this.validate()

    return HistoricoEdicaoCapturaRepository.create({
      valorAnterior: this.valorAnterior,
      valorAtual: this.valorAtual,
      usuarioId: this.usuarioId,
      capturaId: this.capturaId
    }).then(r => {
      return Promise.resolve({ id: r.id })
    }).catch(err => {
      return Promise.reject(err)
    })
  }

  static async findByCapturaId(id) {
    return await HistoricoEdicaoCapturaRepository.findAll({ 
      where: { capturaId: id },
      include: { model: UsuarioRepository }
    })
  }
}

module.exports = HistoricoEdicaoCaptura
