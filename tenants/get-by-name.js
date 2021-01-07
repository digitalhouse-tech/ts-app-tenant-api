const AWS = require('aws-sdk')
const config = require('../config')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('playhouse-nodejs-common')

AWS.config.update(config)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = (event, context, callback) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        ExpressionAttributeValues: {
            ':name': event.pathParameters.name,
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
