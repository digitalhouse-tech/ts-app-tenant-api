const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const {
    InternalServerError,
    SuccessResponse,
    NotFoundError,
} = require('@digitalhouse-dev/http-kit')
const {
    sentryLambdaInit,
    sentryWrapHandler,
    SlsResponse,
    SlsErrorHandler,
} = require('@digitalhouse-dev/serverless-kit')
const clearAuthStrategies = require('../utils/clear-tenant')

sentryLambdaInit()

module.exports.handler = sentryWrapHandler(async (event) => {
    try {
        const dynamoDb = getDynamoDb()

        const name = decodeURIComponent(event.pathParameters.name)

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
        }

        const result = await dynamoDb.scan(params).promise()

        if (!result) {
            throw new NotFoundError(`Not found item.`)
        }

        const tenant = result.Items.find(
            ({ hosts }) => hosts && hosts.find((host) => host.name === name)
        )

        if (!tenant) {
            throw new NotFoundError(
                `Not found item or some tenant is wrong formed.`
            )
        }

        const host = tenant.hosts.find((host) => host.name === name)

        tenant.authStrategies = clearAuthStrategies(host.authStrategies)
        tenant.country = host.country

        delete tenant.hosts

        const data = {
            ...tenant,
            host: name,
            logoutUrl: host.logoutUrl,
        }

        return SlsResponse(new SuccessResponse(data), headers)
    } catch (e) {
        console.log(e)
        return SlsErrorHandler(e, headers)
    }
})
