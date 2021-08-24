'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema('usuario')
    await queryInterface.createSchema('monitoramento')

    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      senha: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      isEmailVerificado: {
        type: Sequelize.INTEGER,
        default: 0
      },
      token: {
        type: Sequelize.STRING
      },
      isAtivo: {
        type: Sequelize.INTEGER,
        default: 1
      },
      permissao: {
        type: Sequelize.ENUM,
        values: [
          'ADMIN',
          'USUARIO',
        ],
        allowNull: false
      },
    }, {
      charset: 'utf8',
      schema: 'usuario',
      collate: 'utf8_swedish_ci'
    })

    await queryInterface.createTable('monitoramentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      placa: {
        type: Sequelize.STRING(12),
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
      usuarioId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'usuario.usuarios',
          key: 'id'
        }
      }
    }, {
      charset: 'utf8',
      schema: 'monitoramento',
      collate: 'utf8_swedish_ci'
    })

    await queryInterface.createTable('paises',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        nome: {
          type: Sequelize.STRING(30)
        }
      }, 
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('estados',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        nome: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        sigla: {
          type: Sequelize.STRING(2),
          allowNull: false
        },
        paisId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.paises',
            key: 'id'
          },
          allowNull: false
        },
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('cidades',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        nome: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        estadoId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.estados',
            key: 'id'
          },
          allowNull: false
        },
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('localizacoes',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        latitude: {
          type: Sequelize.STRING(10)
        },
        longitude: {
          type: Sequelize.STRING(10)
        },
        rua: {
          type: Sequelize.STRING(25),
          allowNull: false
        },
        bairro: {
          type: Sequelize.STRING(25),
          allowNull: false
        },
        numero: {
          type: Sequelize.STRING(10),
          allowNull: false
        },
        zipcode: {
          type: Sequelize.STRING(12),
          allowNull: false
        },
        complemento: {
          type: Sequelize.STRING(25),
        },
        cidadeId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.cidades',
            key: 'id'
          },
          allowNull: false
        },
      }, 
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('cameras',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        nome: {
          type: Sequelize.STRING(45),
          allowNull: false
        },
        mac: {
          type: Sequelize.STRING(45),
          allowNull: false,
          unique: true
        },
        observacoes: {
          type: Sequelize.STRING(255)
        },
        localizacaoId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.localizacoes',
            key: 'id'
          },
          onDelete: 'cascade',
          onUpdate: 'cascade'
        }
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('capturas',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        placa: {
          type: Sequelize.STRING(12),
          allowNull: false
        },
        dataHora: {
          type: Sequelize.DATE,
          allowNull: false
        },
        detalhes: {
          type: Sequelize.STRING
        },
        monitoramentoId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.monitoramentos',
            key: 'id'
          },
          allowNull: true
        },
        cameraId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.cameras',
            key: 'id'
          }
        },
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('imagensCaptura',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        imagem: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        binary:{
          type: Sequelize.BLOB,
          allowNull: false
        },
        capturaId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.capturas',
            key: 'id'
          },
          allowNull: true
        },
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )

    await queryInterface.createTable('historicosEdicaoCaptura',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        valorAnterior: {
          type: Sequelize.STRING(12),
          allowNull: false
        },
        valorAtual: {
          type: Sequelize.STRING(12),
          allowNull: false
        },
        capturaId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'monitoramento.capturas',
            key: 'id'
          },
          allowNull: false
        },
        usuarioId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'usuario.usuarios',
            key: 'id'
          },
          allowNull: false
        },
      },
      {
        charset: 'utf8',
        schema: 'monitoramento',
        collate: 'utf8_swedish_ci'
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropAllTables()
    await queryInterface.dropAllSchemas()
  }
};
