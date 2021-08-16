module.exports = (Sequelize, sequelize) => {
  return sequelize.define('camera', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false
    },
    mac: {
      type: Sequelize.STRING,
      allowNull: false
    },
    observacoes: {
      type: Sequelize.STRING
    }
  }, {
    tableName: 'monitoramento.cameras',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
