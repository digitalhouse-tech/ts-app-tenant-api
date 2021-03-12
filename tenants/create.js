'use strict'

const uuid = require('uuid')
const headers = require('../utils/headers')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('@dhteam/pg-nodejs')
const moment = require('moment')
const { sentryLambdaInit, sentryWrapHandler } = require('@dhteam/pg-nodejs')
const getDynamoDb = require('../utils/get-dynamo-db')

sentryLambdaInit()

module.exports.handler = sentryWrapHandler((event, context, callback) => {
    const dynamoDb = getDynamoDb()

    const date = moment().format('YYYY-MM-DD')
    const data = JSON.parse(event.body)

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            ...data,
            _id: uuid.v4(),
            createdAt: date,
            updatedAt: date,
        },
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error)
            SlsErrorHandler(
                new InternalServerError(`Couldn't create the tenant item.`)
            )
            return
        }

        const response = SlsResponse(new SuccessResponse(params.Item), headers)
        callback(null, response)
    })
})
