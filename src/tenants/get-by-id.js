const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const { SuccessResponse, BadRequestError } = require('@dhteam/pg-http-kit')
const {
    SlsResponse,
    SlsErrorHandler,
    sentryLambdaInit,
    sentryWrapHandler,
} = require('@dhteam/pg-serverless-kit')

const { env } = process

sentryLambdaInit()

module.exports.handler = sentryWrapHandler(async (event) => {
    try {
        const dynamoDb = getDynamoDb()

        const id = event.pathParameters.id

        if (!id) {
            throw new BadRequestError('Bad Request: tenantId is missing.')
        }

        const params = {
            TableName: env.DYNAMODB_TABLE,
            Key: {
                _id: event.pathParameters.id,
            },
        }

        const result = await dynamoDb.get(params).promise()

        return SlsResponse(new SuccessResponse(result.Item), headers)
    } catch (e) {
        return SlsErrorHandler(e, headers)
    }
})
