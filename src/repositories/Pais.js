module.exports = (Sequelize, sequelize) => {
  return sequelize.define('pais', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    name: {
      singular: 'pais',
      plural: 'paises'
    },
    tableName: 'monitoramento.paises',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
