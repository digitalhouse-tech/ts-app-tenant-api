'use strict'

const uuid = require('uuid')
const AWS = require('aws-sdk')
const config = require('../config')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('playhouse-nodejs-common')
const moment = require('moment')

AWS.config.update(config)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = (event, context, callback) => {
    const date = moment().format('YYYY-MM-DD')
    const data = JSON.parse(event.body)

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            ...data,
            _id: uuid.v4(),
            createdAt: date,
            updatedAt: date,
        },
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error)
            SlsErrorHandler(
                new InternalServerError(`Couldn't create the tenant item.`)
            )
            return
        }

        const response = SlsResponse(new SuccessResponse(params.Item))
        callback(null, response)
    })
}
