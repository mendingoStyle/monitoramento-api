const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description:
        'Back-end',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Luiz Carlos Silva de Oliveira Junior',
        email: 'lualpha_foz@hotmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:9000',
      },
    ],
  },
  apis: [`${__dirname}/controllers/*.router.js`, `${__dirname}/controllers/*.public.router.js`],
}

const specs = swaggerJsdoc(options)

module.exports = {
  docUrl: '/api-docs',
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, { explorer: true })
}
