module.exports = (Sequelize, sequelize) => {
  return sequelize.define('monitoramento', {
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
    dataInicio: {
      type: Sequelize.DATE
    },
    dataFim: {
      type: Sequelize.DATE
    },
    observacoes: {
      type: Sequelize.STRING
    },
    isContinuo: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM,
      values: [
        'NENHUMA_OCORRENCIA',
        'OCORRENCIA_ENCONTRADA',
      ],
      allowNull: false
    },
  }, {
    tableName: 'monitoramento.monitoramentos',
    freezeTableName: true,
    version: 'version',
    createdAt: 'createdAt',
    updateAt: 'updatedAt'
  })
}
