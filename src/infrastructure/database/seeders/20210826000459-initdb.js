'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('usuario.usuarios', [{
      nome: 'Administrador',
      email: 'lualpha_foz@hotmail.com',
      senha: '$2b$12$9X78ChDeY05MuV0j911CoeHJdTYnEf4LBLyiZCGRSADfNd6DE.Pzm',
      permissao: 'ADMIN',
      isAtivo: 1,
      isEmailVerificado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0
    }])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuario.usuarios', null, {})
  }
};