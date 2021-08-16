module.exports = (Sequelize, sequelize) => {
  return sequelize.define('estado', {
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
    sigla: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    tableName: 'monitoramento.estados',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
