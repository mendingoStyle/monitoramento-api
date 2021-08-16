module.exports = (Sequelize, sequelize) => {
  return sequelize.define('historicoEdicaoCaptura', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    valorAnterior: {
      type: Sequelize.STRING,
      allowNull: false
    },
    valorAtual: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    name: {
      singular: 'historicoEdicaoCaptura',
      plural: 'historicosEdicaoCaptura'
    },
    tableName: 'monitoramento.historicosEdicaoCaptura',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
