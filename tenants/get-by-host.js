const AWS = require('aws-sdk')
const config = require('../config')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
    NotFoundError,
} = require('@dhteam/pg-nodejs')

AWS.config.update(config)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = (event, context, callback) => {
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
            logoutUrl: tenant.logoutUrl,
            lang: tenant.lang,
            ...cname,
        }

        const response = SlsResponse(new SuccessResponse(data), {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        })
        callback(null, response)
    })
}
