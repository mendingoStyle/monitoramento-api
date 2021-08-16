module.exports = (Sequelize, sequelize) => {
  return sequelize.define('imagemCaptura', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    imagem: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    tableName: 'monitoramento.imagensCaptura',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
