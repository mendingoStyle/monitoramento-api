module.exports = (Sequelize, sequelize) => {
  return sequelize.define('usuario', {
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
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    senha: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isEmailVerificado: {
      type: Sequelize.INTEGER
    },
    token: {
      type: Sequelize.STRING
    },
    isAtivo: {
      type: Sequelize.INTEGER
    },
    permissao: {
      type: Sequelize.ENUM,
      values: [
        'ADMIN',
        'USUARIO',
      ]
    },
  }, {
    tableName: 'usuario.usuarios',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
