'use strict'

const path = require('path')
const fs = require('fs')
const basename = path.basename(module.filename)
const AWS = require('aws-sdk')
const YAML = require('yamljs')

const env = YAML.load(
    path.resolve(process.cwd(), 'environment', 'local', 'env.yml')
)

AWS.config.update({
    region: env.REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    endpoint: env.DYNAMO_ENDPOINT,
})

const ddb = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient()

const [, , arg] = process.argv

const methods = {
    '--up': 'up',
    '--down': 'down',
}

fs.readdirSync(__dirname)
    .filter(function (file) {
        return file.indexOf('.') !== 0 && file !== basename
    })
    .forEach(async function (file) {
        if (file.slice(-3) !== '.js') return
        const migration = require('./' + file.slice(0, -3))
        try {
            const method = migration(ddb, docClient, env)[methods[arg]]
            if (method) {
                await method()
                console.log(`SUCCESS: ${file}. METHOD: ${methods[arg]}`)
            }
        } catch (e) {
            console.log(`FAIL: ${e}`)
        }
    })
