module.exports = (Sequelize, sequelize) => {
  return sequelize.define('localizacao', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    latitude: {
      type: Sequelize.STRING
    },
    longitude: {
      type: Sequelize.STRING
    },
    rua: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bairro: {
      type: Sequelize.STRING,
      allowNull: false
    },
    numero: {
      type: Sequelize.STRING,
      allowNull: false
    },
    zipcode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    complemento: {
      type: Sequelize.STRING
    }
  }, {
    tableName: 'monitoramento.localizacoes',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
