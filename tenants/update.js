'use strict'

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
        Key: {
            _id: event.pathParameters.id,
        },
        ExpressionAttributeNames: {
            '#authStrategies': 'authStrategies',
        },
        ExpressionAttributeValues: {
            ':authStrategies': data.authStrategies,
            ':updatedAt': date,
        },
        UpdateExpression:
            'SET #authStrategies = :authStrategies, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    }

    dynamoDb.update(params, (error, result) => {
        if (error) {
            console.error(error)
            SlsErrorHandler(
                new InternalServerError(`Couldn't update the tenant item.`)
            )
            return
        }

        const response = SlsResponse(new SuccessResponse(result.Attributes))
        callback(null, response)
    })
}
