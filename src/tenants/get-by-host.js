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

module.exports.handler = sentryWrapHandler((event, context, callback) => {
    const dynamoDb = getDynamoDb()

    const name = decodeURIComponent(event.pathParameters.name)

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
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

        if (!result) {
            callback(
                null,
                SlsErrorHandler(new NotFoundError(`Not found item.`))
            )
            return
        }

        const tenant = result.Items.find(({ hosts }) =>
            hosts.find((host) => host.name === name)
        )

        if (!tenant) {
            callback(
                null,
                SlsErrorHandler(new NotFoundError(`Not found item.`))
            )
            return
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

        const response = SlsResponse(new SuccessResponse(data), headers)
        callback(null, response)
    })
})
