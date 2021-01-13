'use strict'

require('dotenv-json')({ path: './.env.local.json' })

const fs = require('fs')
const path = require('path')
const basename = path.basename(module.filename)
const config = require('../config')
const AWS = require('aws-sdk')

AWS.config.update(config)

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
            const method = migration(ddb, docClient)[methods[arg]]
            if (method) {
                await method()
                console.log(`SUCCESS: ${file}. METHOD: ${methods[arg]}`)
            }
        } catch (e) {
            console.log(`FAIL: ${e}`)
        }
    })
