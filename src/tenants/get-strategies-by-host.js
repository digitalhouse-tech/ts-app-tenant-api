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

        const authStrategies = tenant.authStrategies.map((strategy) => {
            if (strategy.type !== 'OAuthStrategy') {
                return strategy
            }
            return {
                ...strategy,
                config: {
                    provider: strategy.config.provider,
                    clientId: strategy.config.clientId,
                    clientSecret: strategy.config.clientSecret,
                    profileUrl: strategy.config.profileUrl,
                    tokenURL: strategy.config.tokenURL,
                    authorizationURL: strategy.config.authorizationURL,
                    enablePublicSignUp: strategy.config.enablePublicSignUp,
                    enablePublicEnrolment:
                        strategy.config.enablePublicEnrolment,
                },
            }
        })

        const response = SlsResponse(
            new SuccessResponse(authStrategies),
            headers
        )
        callback(null, response)
    })
})
