const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const {
    InternalServerError,
    SuccessResponse,
    NotFoundError,
} = require('@dhteam/pg-http-kit')
const {
    sentryLambdaInit,
    sentryWrapHandler,
    SlsResponse,
    SlsErrorHandler,
} = require('@dhteam/pg-serverless-kit')

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

        const tenant = result.Items.find(({ hosts }) =>
            hosts.find((host) => host.name === name)
        )

        if (!tenant) {
            throw new NotFoundError(`Not found item.`)
        }

        tenant.authStrategies = tenant.authStrategies.map((strategy) => {
            if (strategy.type !== 'OAuthStrategy') {
                return strategy
            }
            return {
                ...strategy,
                config: {
                    redirectOnOpen: strategy.config.redirectOnOpen,
                    enablePublicSignUp: strategy.config.enablePublicSignUp,
                    provider: strategy.config.provider,
                    buttonOnNativeLogin: strategy.config.buttonOnNativeLogin,
                    providerUrl: strategy.config.providerUrl,
                },
            }
        })

        const host = tenant.hosts.find((host) => host.name === name)

        delete tenant.hosts

        const data = {
            ...tenant,
            host: name,
            logoutUrl: host.logoutUrl,
        }

        return SlsResponse(new SuccessResponse(data), headers)
    } catch (e) {
        return SlsErrorHandler(e, headers)
    }
})
