module.exports = (dynamodb, docClient, env) => ({
    up: () =>
        dynamodb
            .createTable({
                TableName: env.DYNAMODB_TABLE,
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
                        TableName: env.DYNAMODB_TABLE,
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
                TableName: env.DYNAMODB_TABLE,
            })
            .promise(),
})

function getItems() {
    return [
        {
            createdAt: '2021-01-08',
            lookandfeelUrl:
                'https://dev-gbl-pg-lnf.digitalhouse.com/tenants/dh/ui/index.css',
            name: 'corporate',
            _id: '8aa25c8b-444d-4276-9a33-4294ac0ab5c0',
            lang: 'es-AR',
            logoUrl: 'https://assets.digitalhouse.com/pg/dev/logos/pg.svg',
            dhLogoUrl:
                'https://assets.digitalhouse.com/pg/dev/logos/dh-logo.svg',
            playstrapUrl:
                'https://dev-gbl-pg-lnf.digitalhouse.com/tenants/dh/playstrap/playstrap.css',
            showPoweredBy: false,
            showTermsAndConditions: true,
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
                        clientId: '506518984266150',
                        authorizationURL:
                            'https://auth.mercadolibre.com.ar/authorization',
                        provider: 'mercadolibre',
                        buttonOnNativeLogin: true,
                        clientSecret: 'kEwqRl7iBDSIByujmgp9EUIZXIEctNZv',
                        providerUrl:
                            'http://localhost:4050/v1/api/oauth/mercadolibre',
                    },
                },
                {
                    type: 'NativeAuthStrategy',
                },
            ],
            hosts: [
                {
                    name: 'http://localhost:3005',
                },
            ],
            country: 'ar',
            updatedAt: '2021-01-08',
        },
        {
            createdAt: '2021-02-02',
            lookandfeelUrl:
                'https://dev-gbl-pg-lnf.digitalhouse.com/tenants/meli/ui/index.css',
            name: 'corporate',
            _id: '491717d4-2a6c-426d-9b77-cae09f8da34b',
            lang: 'es-AR',
            logoUrl: 'https://assets.digitalhouse.com/pg/dev/logos/pg.svg',
            dhLogoUrl:
                'https://assets.digitalhouse.com/pg/dev/logos/dh-logo.svg',
            playstrapUrl:
                'https://dev-gbl-pg-lnf.digitalhouse.com/tenants/dh/playstrap/playstrap.css',
            showPoweredBy: false,
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
                        clientId: '506518984266150',
                        authorizationURL:
                            'https://auth.mercadolibre.com.ar/authorization',
                        provider: 'mercadolibre',
                        buttonOnNativeLogin: true,
                        clientSecret: 'kEwqRl7iBDSIByujmgp9EUIZXIEctNZv',
                        providerUrl:
                            'http://localhost:4050/v1/api/oauth/mercadolibre',
                    },
                },
                {
                    type: 'NativeAuthStrategy',
                },
            ],
            hosts: [
                {
                    name: 'http://localhost:3006',
                },
            ],
            country: 'ar',
            updatedAt: '2021-02-02',
        },
    ]
}
