const config = {
    region: process.env.REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.DYNAMO_ENDPOINT,
}

module.exports = process.env.NODE_ENV !== 'local' ? {} : config
