const AWS = require('aws-sdk')
const AmazonDaxClient = require('amazon-dax-client')

let dynamoDb = null

module.exports = () => {
    if (!dynamoDb) {
        const config = {}
        if (process.env.NODE_ENV !== 'local') {
            config.service = new AmazonDaxClient({
                endpoints: [
                    process.env.DAX_ENDPOINT_1,
                    process.env.DAX_ENDPOINT_2,
                    process.env.DAX_ENDPOINT_3,
                ],
            })
            console.log("INFO: I'm using DynamoDB from AmazonDaxClient")
        } else {
            AWS.config.update({
                region: process.env.REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                endpoint: process.env.DYNAMO_ENDPOINT,
            })
            console.log("INFO: I'm using DynamoDB from AWS SDK")
        }

        dynamoDb = new AWS.DynamoDB.DocumentClient(config)
    }

    return dynamoDb
}
