const { Op } = require('sequelize')
const ImagensCapturaRepository = require('../infrastructure/database/setup').imagemCaptura

class ImagemCaptura {
  constructor({url}){
    this.url = url
  }
  async validate() {
    if (!this.url) {
      throw new InvalidArgumentError(`forneça a url`)
    }
  }
  static async findImagemCapturaByIdcaptura(id) {
    return await ImagensCapturaRepository.findOne({
      where: { capturaId: id },
    })
  }
  static async findImagemCapturaByUrlBool(url) {
    const exist = await ImagensCapturaRepository.findOne({
      where: { imagem: url },
    })
    if(exist == null){
      return false
    } else return true
  }
}

module.exports = ImagemCaptura