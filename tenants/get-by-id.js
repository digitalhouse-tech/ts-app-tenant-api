const AWS = require('aws-sdk')
const config = require('../config')
const uuid = require('uuid')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('playhouse-nodejs-common')

AWS.config.update(config)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

const uuidReg = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

module.exports.handler = (event, context, callback) => {
    const isUUID = uuidReg.test(event.pathParameters.id)

    if (isUUID) {
        getById(event.pathParameters.id, callback)
    } else {
        getByName(event.pathParameters.id, callback)
    }
}

const getById = (_id, callback) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            _id,
        },
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error)
            callback(
                null,
                SlsErrorHandler(
                    new InternalServerError(`Couldn't fetch the tenant item.`)
                )
            )
        }

        const response = SlsResponse(new SuccessResponse(result.Item))
        callback(null, response)
    })
}

const getByName = (name, callback) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        ExpressionAttributeValues: {
            ':name': name,
        },
        ExpressionAttributeNames: {
            '#n': 'name',
        },
        FilterExpression: 'contains (#n, :name)',
    }

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            console.error(error)
            callback(
                null,
                SlsErrorHandler(
                    new InternalServerError(`Couldn't fetch the tenant item.`)
                )
            )
        }

        const response = SlsResponse(new SuccessResponse(result.Items[0]))
        callback(null, response)
    })
}
