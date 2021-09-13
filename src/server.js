const app = require('./app')
const db = require('./infrastructure/database/setup')
require('../redis/accessTokenBlocklist')
require('../redis/refreshTokenAllowlist')

const PORT = process.env.PORT || 9000

db.sequelize.authenticate()
  .then(r => {
    app.listen(PORT, () => {
      console.log(`monitoramento-api is listening on port ${PORT}`)
    })
  }).catch(err => {
    console.log(err)
  })