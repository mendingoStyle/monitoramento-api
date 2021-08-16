function applyAssociations(sequelize) {
  const { 
    usuario, 
    camera, 
    localizacao, 
    monitoramento, 
    captura,
    imagemCaptura,
    historicoEdicaoCaptura,
    pais,
    estado,
    cidade
  } = sequelize.models;

  localizacao.hasMany(camera)
  camera.belongsTo(localizacao)

  usuario.hasMany(monitoramento)
  monitoramento.belongsTo(usuario)

  monitoramento.hasMany(captura)
  captura.belongsTo(monitoramento)

  camera.hasMany(captura)
  captura.belongsTo(camera)

  captura.hasMany(imagemCaptura)
  imagemCaptura.belongsTo(captura)

  captura.hasMany(historicoEdicaoCaptura)
  historicoEdicaoCaptura.belongsTo(captura)

  usuario.hasMany(historicoEdicaoCaptura)
  historicoEdicaoCaptura.belongsTo(usuario)

  pais.hasMany(estado)
  estado.belongsTo(pais)

  estado.hasMany(cidade)
  cidade.belongsTo(estado)

  cidade.hasMany(localizacao)
  localizacao.belongsTo(cidade)
}

module.exports = { applyAssociations }
