const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const {
    SuccessResponse,
    BadRequestError,
    NotFoundError,
} = require('@digitalhouse-dev/http-kit')
const {
    SlsResponse,
    SlsErrorHandler,
    sentryLambdaInit,
    sentryWrapHandler,
} = require('@digitalhouse-dev/serverless-kit')
const clearAuthStrategies = require('../utils/clear-tenant')

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

        const { Item: tenant } = await dynamoDb.get(params).promise()

        if (!tenant) {
            throw new NotFoundError(`Not found item.`)
        }

        tenant.hosts = tenant.hosts.map((host) => {
            return {
                ...host,
                authStrategies: clearAuthStrategies(host.authStrategies),
            }
        })

        return SlsResponse(new SuccessResponse(tenant), headers)
    } catch (e) {
        console.log(e)
        return SlsErrorHandler(e, headers)
    }
})
