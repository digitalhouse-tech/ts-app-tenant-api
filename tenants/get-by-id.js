const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('@dhteam/pg-nodejs')
const { sentryLambdaInit, sentryWrapHandler } = require('@dhteam/pg-nodejs')

sentryLambdaInit()

module.exports.handler = sentryWrapHandler((event, context, callback) => {
    const dynamoDb = getDynamoDb()

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            _id: event.pathParameters.id,
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

        const response = SlsResponse(new SuccessResponse(result.Item), headers)
        callback(null, response)
    })
})
