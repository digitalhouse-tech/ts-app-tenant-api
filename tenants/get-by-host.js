const headers = require('../utils/headers')
const getDynamoDb = require('../utils/get-dynamo-db')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
    NotFoundError,
} = require('@dhteam/pg-nodejs')

const { sentryLambdaInit, sentryWrapHandler } = require('@dhteam/pg-nodejs')

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
        console.log(JSON.stringify(result.Items, null, 2))

        const tenant = result.Items.find(({ cnames }) =>
            cnames.find((cname) => cname.host === name)
        )

        if (!tenant) {
            callback(
                null,
                SlsErrorHandler(new NotFoundError(`Not found item.`))
            )
            return
        }

        const cname = tenant.cnames.find((cname) => cname.host === name)

        cname.authStrategies = cname.authStrategies.map((strategy) => {
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

        const data = {
            _id: tenant._id,
            name: tenant.name,
            logoUrl: tenant.logoUrl,
            lookandfeelUrl: tenant.lookandfeelUrl,
            lang: tenant.lang,
            showPoweredBy: tenant.showPoweredBy,
            showTermsAndConditions: tenant.showTermsAndConditions,
            ...cname,
        }

        const response = SlsResponse(new SuccessResponse(data), headers)
        callback(null, response)
    })
})
