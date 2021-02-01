const TABLE_NAME = 'tenants'

module.exports = (dynamodb, docClient) => ({
    up: () =>
        dynamodb
            .createTable({
                TableName: TABLE_NAME,
                KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
                AttributeDefinitions: [
                    { AttributeName: '_id', AttributeType: 'S' },
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10,
                },
            })
            .promise()
            .then(async () => {
                const promises = []

                getItems().map((item) => {
                    const params = {
                        TableName: process.env.DYNAMODB_TABLE,
                        Item: item,
                    }
                    const promise = new Promise((resolve, reject) => {
                        docClient.put(params, (error) => {
                            if (error) {
                                reject(error)
                                return
                            }
                            resolve(params.Item)
                        })
                    })
                    promises.push(promise)
                })

                return Promise.all(promises)
            }),
    down: () =>
        dynamodb
            .deleteTable({
                TableName: TABLE_NAME,
            })
            .promise(),
})

function getItems() {
    return [
        {
            createdAt: '2021-01-08',
            lookandfeelUrl: 'https://dev-pg-look-and-feel.digitalhouse.com/corporate.css',
            name: 'corporate',
            _id: '8aa25c8b-444d-4276-9a33-4294ac0ab5c0',
            lang: 'es-AR',
            logoUrl: 'https://assets.digitalhouse.com/pg/dev/logos/dh-logo.png',
            showPoweredBy: false,
            cnames: [
                {
                    host: 'http://localhost:3005',
                    authStrategies: [
                        {
                            type: 'OAuthStrategy',
                            config: {
                                redirectOnOpen: false,
                                enablePublicSignUp: false,
                                clientId:
                                    '651303397206-ucasvj78adcem5pus5o7t0gl7mr2hra0.apps.googleusercontent.com',
                                provider: 'google',
                                buttonOnNativeLogin: true,
                                clientSecret: '301HA4nTnZ2AtihbrXHl6eeW',
                                enablePublicEnrolment: true,
                                providerUrl:
                                    'http://localhost:4050/v1/api/oauth/google',
                            },
                        },
                        {
                            type: 'OAuthStrategy',
                            config: {
                                redirectOnOpen: false,
                                enablePublicSignUp: true,
                                clientId: '6861563145345718',
                                authorizationURL:
                                    'https://auth.mercadolibre.com.ar/authorization',
                                provider: 'mercadolibre',
                                buttonOnNativeLogin: true,
                                clientSecret:
                                    'yHYRMqBNnIHHAbNtTP3MCcj7lSc59A9B',
                                providerUrl:
                                    'http://localhost:4050/v1/api/oauth/mercadolibre',
                            },
                        },
                        {
                            type: 'NativeAuthStrategy',
                        },
                    ],
                    country: 'ar',
                },
            ],
            updatedAt: '2021-01-08',
        },
    ]
}
