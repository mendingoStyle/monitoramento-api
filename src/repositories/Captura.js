module.exports = (Sequelize, sequelize) => {
  return sequelize.define('captura', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    placa: {
      type: Sequelize.STRING,
      allowNull: false
    },
    dataHora: {
      type: Sequelize.DATE,
      allowNull: false
    },

    detalhes: {
      type: Sequelize.STRING
    }
  }, {
    tableName: 'monitoramento.capturas',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
