const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

const port = 3001

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
