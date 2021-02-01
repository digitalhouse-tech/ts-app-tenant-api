'use strict'

const AWS = require('aws-sdk')
const config = require('../config')
const headers = require('../utils/headers')
const {
    SlsResponse,
    SlsErrorHandler,
    InternalServerError,
    SuccessResponse,
} = require('@dhteam/pg-nodejs')
const moment = require('moment')

AWS.config.update(config)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = (event, context, callback) => {
    const date = moment().format('YYYY-MM-DD')
    const data = JSON.parse(event.body)

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            _id: event.pathParameters.id,
        },
        ExpressionAttributeNames: {
            '#cnames': 'cnames',
            '#logoUrl': 'logoUrl',
            '#lookandfeelUrl': 'lookandfeelUrl',
            '#lang': 'lang',
            '#showPoweredBy': 'showPoweredBy',
        },
        ExpressionAttributeValues: {
            ':cnames': data.cnames,
            ':logoUrl': data.logoUrl,
            ':lookandfeelUrl': data.lookandfeelUrl,
            ':lang': data.lang,
            ':showPoweredBy': data.showPoweredBy,
            ':updatedAt': date,
        },
        UpdateExpression:
            'SET #cnames = :cnames, #logoUrl = :logoUrl, #lookandfeelUrl = :lookandfeelUrl, #lang = :lang, #showPoweredBy = :showPoweredBy, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    }

    dynamoDb.update(params, (error, result) => {
        if (error) {
            console.error(error)
            SlsErrorHandler(
                new InternalServerError(`Couldn't update the tenant item.`)
            )
            return
        }

        const response = SlsResponse(
            new SuccessResponse(result.Attributes),
            headers
        )
        callback(null, response)
    })
}
