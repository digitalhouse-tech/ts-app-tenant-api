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

sentryLambdaInit()

module.exports.handler = sentryWrapHandler(async (event) => {
    try {
        const dynamoDb = getDynamoDb()

        const name = decodeURIComponent(event.pathParameters.name)

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
        }

        const result = await dynamoDb.scan(params).promise()

        const tenant = result.Items.find(
            ({ hosts }) => hosts && hosts.find((host) => host.name === name)
        )

        if (!tenant) {
            throw new NotFoundError(`Not found item.`)
        }

        const host = tenant.hosts.find((host) => host.name === name)

        const authStrategies = host.authStrategies.map((strategy) => {
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

        return SlsResponse(new SuccessResponse(authStrategies), headers)
    } catch (e) {
        console.log(e)
        return SlsErrorHandler(e, headers)
    }
})
